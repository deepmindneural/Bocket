const admin = require('firebase-admin');

// Intentar inicializar Firebase con diferentes métodos
async function inicializarFirebase() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  // Intentar con diferentes rutas de configuración
  const posiblesRutas = [
    './firebase-config.json',
    './src/environments/firebase-config.json',
    './firebase-adminsdk.json',
    './firebase-service-account.json'
  ];

  let credencialesPath = null;
  for (const ruta of posiblesRutas) {
    try {
      require.resolve(ruta);
      credencialesPath = ruta;
      break;
    } catch (e) {
      // Continuar buscando
    }
  }

  if (credencialesPath) {
    const serviceAccount = require(credencialesPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log(`✅ Firebase inicializado con credenciales desde: ${credencialesPath}`);
  } else {
    // Usar variables de entorno o credenciales por defecto
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('✅ Firebase inicializado con credenciales por defecto');
    } catch (error) {
      console.log('❌ No se pudieron encontrar credenciales de Firebase');
      console.log('💡 Intenta usar uno de los scripts existentes que ya funcionan');
      return null;
    }
  }

  return admin.firestore();
}

async function verificarConexionYRestaurantes() {
  try {
    console.log('🔥 Verificando conexión a Firestore...\n');

    // Inicializar Firebase
    const db = await inicializarFirebase();
    if (!db) {
      console.log('❌ No se pudo inicializar Firebase');
      return;
    }

    // Verificar conexión básica
    const testDoc = await db.collection('test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'connected'
    });
    
    console.log('✅ Conexión a Firestore exitosa\n');
    
    // Borrar documento de prueba
    await db.collection('test').doc('connection').delete();

    console.log('📊 ESTRUCTURA DE LA BASE DE DATOS:\n');

    // 1. Verificar estructura antigua (clients/worldfood/Formularios)
    console.log('1️⃣ ESTRUCTURA ANTIGUA - /clients/worldfood/Formularios/');
    const oldStructure = await db.collection('clients')
      .doc('worldfood')
      .collection('Formularios')
      .get();
    
    console.log(`   📁 Documentos encontrados: ${oldStructure.size}`);
    
    if (!oldStructure.empty) {
      console.log('   📝 Primeros 5 documentos:');
      oldStructure.docs.slice(0, 5).forEach((doc, index) => {
        const data = doc.data();
        console.log(`     ${index + 1}. ${doc.id}`);
        console.log(`        Tipo: ${data.tipo || 'No definido'}`);
        console.log(`        Nombre: ${data.nombre || data.nombreRestaurante || 'Sin nombre'}`);
        console.log(`        RestauranteId: ${data.restauranteId || 'No definido'}`);
        console.log('');
      });
    }

    // 2. Verificar nueva estructura (clients/{restauranteId})
    console.log('2️⃣ NUEVA ESTRUCTURA - /clients/{restauranteId}/');
    const newStructure = await db.collection('clients').get();
    
    const restauranteIds = [];
    newStructure.docs.forEach(doc => {
      if (doc.id !== 'worldfood' && doc.id.startsWith('rest_')) {
        restauranteIds.push(doc.id);
      }
    });
    
    console.log(`   🏪 Restaurantes encontrados: ${restauranteIds.length}`);
    console.log(`   📋 IDs: ${restauranteIds.join(', ')}\n`);

    // 3. Mostrar datos detallados de cada restaurante
    for (const restauranteId of restauranteIds) {
      console.log(`🏪 RESTAURANTE: ${restauranteId}`);
      console.log('─'.repeat(50));
      
      // Información del restaurante
      const infoRef = db.collection('clients').doc(restauranteId).collection('info').doc('restaurante');
      const infoDoc = await infoRef.get();
      
      if (infoDoc.exists) {
        const info = infoDoc.data();
        console.log('📋 INFORMACIÓN GENERAL:');
        console.log(`   Nombre: ${info.nombre || 'Sin nombre'}`);
        console.log(`   Email: ${info.email || 'Sin email'}`);
        console.log(`   Teléfono: ${info.telefono || 'Sin teléfono'}`);
        console.log(`   Dirección: ${info.direccion || 'Sin dirección'}`);
        console.log(`   Ciudad: ${info.ciudad || 'Sin ciudad'}`);
        console.log(`   Estado: ${info.estado || 'Sin estado'}`);
        console.log(`   Plan: ${info.planActual || 'Sin plan'}`);
        console.log(`   Creado: ${info.fechaCreacion ? new Date(info.fechaCreacion.seconds * 1000).toLocaleString() : 'Sin fecha'}`);
        console.log('');
      } else {
        console.log('❌ No se encontró información del restaurante\n');
      }
      
      // Usuarios del restaurante
      const usersRef = db.collection('clients').doc(restauranteId).collection('users');
      const users = await usersRef.get();
      console.log(`👥 USUARIOS: ${users.size}`);
      
      if (!users.empty) {
        users.docs.forEach((userDoc, index) => {
          const user = userDoc.data();
          console.log(`   ${index + 1}. ${userDoc.id}`);
          console.log(`      Email: ${user.email || 'Sin email'}`);
          console.log(`      Nombre: ${user.displayName || user.nombre || 'Sin nombre'}`);
          console.log(`      Rol: ${user.role || 'Sin rol'}`);
          console.log(`      Estado: ${user.active ? 'Activo' : 'Inactivo'}`);
        });
      }
      console.log('');
      
      // Datos del restaurante (clientes, reservas, pedidos)
      const dataCollections = ['clientes', 'reservas', 'pedidos', 'productos'];
      
      for (const collection of dataCollections) {
        const collectionRef = db.collection('clients').doc(restauranteId).collection('data').doc('collections').collection(collection);
        const docs = await collectionRef.get();
        console.log(`📊 ${collection.toUpperCase()}: ${docs.size} registros`);
        
        if (docs.size > 0 && docs.size <= 3) {
          docs.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`   ${index + 1}. ${doc.id}`);
            if (collection === 'clientes') {
              console.log(`      Nombre: ${data.nombre || 'Sin nombre'}`);
              console.log(`      Email: ${data.email || 'Sin email'}`);
              console.log(`      Teléfono: ${data.telefono || 'Sin teléfono'}`);
            } else if (collection === 'reservas') {
              console.log(`      Cliente: ${data.nombreCliente || 'Sin cliente'}`);
              console.log(`      Fecha: ${data.fecha || 'Sin fecha'}`);
              console.log(`      Personas: ${data.numeroPersonas || 'Sin especificar'}`);
              console.log(`      Estado: ${data.estado || 'Sin estado'}`);
            } else if (collection === 'pedidos') {
              console.log(`      Cliente: ${data.nombreCliente || 'Sin cliente'}`);
              console.log(`      Total: ${data.total ? `$${data.total}` : 'Sin total'}`);
              console.log(`      Estado: ${data.estado || 'Sin estado'}`);
            } else if (collection === 'productos') {
              console.log(`      Nombre: ${data.nombre || 'Sin nombre'}`);
              console.log(`      Precio: ${data.precio ? `$${data.precio}` : 'Sin precio'}`);
              console.log(`      Categoría: ${data.categoria || 'Sin categoría'}`);
            }
          });
        } else if (docs.size > 3) {
          console.log(`   (Mostrando primeros 3 de ${docs.size})`);
          docs.docs.slice(0, 3).forEach((doc, index) => {
            const data = doc.data();
            console.log(`   ${index + 1}. ${doc.id} - ${data.nombre || data.nombreCliente || 'Sin nombre'}`);
          });
        }
        console.log('');
      }
      
      console.log('═'.repeat(70));
      console.log('');
    }

    // 4. Resumen final
    console.log('📈 RESUMEN GENERAL:');
    console.log('─'.repeat(30));
    console.log(`🏪 Total restaurantes: ${restauranteIds.length}`);
    console.log(`📁 Estructura antigua: ${oldStructure.size} documentos`);
    console.log(`🆕 Nueva estructura: ${restauranteIds.length} restaurantes`);
    console.log(`🔥 Conexión: ✅ Exitosa`);
    console.log(`📅 Verificación: ${new Date().toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error al verificar Firestore:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔐 Sugerencias para resolver permisos:');
      console.log('1. Verificar que las credenciales de Firebase sean correctas');
      console.log('2. Verificar los permisos en Firestore Rules');
      console.log('3. Verificar que el proyecto de Firebase esté activo');
    }
  }
}

// Ejecutar verificación
verificarConexionYRestaurantes();