const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, doc, setDoc } = require('firebase/firestore');

// Configuración Firebase (la misma que usas en tu app)
const firebaseConfig = {
  apiKey: "AIzaSyDLXjw8f0mfXd5NHWJVYXQTKz7FmXdpfyM",
  authDomain: "bocket-development.firebaseapp.com",
  projectId: "bocket-development",
  storageBucket: "bocket-development.firebasestorage.app",
  messagingSenderId: "295916039133",
  appId: "1:295916039133:web:a5b5b3f4a2c9d4e1a2b9c8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verificarConexionCompleta() {
  console.log('🔥 VERIFICACIÓN COMPLETA DE CONEXIÓN FIREBASE');
  console.log('================================================');
  
  try {
    // 1. Verificar datos existentes
    console.log('\n📖 1. VERIFICANDO DATOS EXISTENTES:');
    const formulariosRef = collection(db, 'clients/worldfood/Formularios');
    const snapshot = await getDocs(formulariosRef);
    
    console.log(`✅ Total de formularios encontrados: ${snapshot.size}`);
    
    const tiposFormulario = {};
    const clientesUnicos = new Set();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      
      // Analizar tipo de formulario
      const typeForm = data.typeForm || 'sin tipo';
      tiposFormulario[typeForm] = (tiposFormulario[typeForm] || 0) + 1;
      
      // Extraer chatID para contar clientes únicos
      const parts = docId.split('_');
      if (parts.length >= 3) {
        const chatId = parts[parts.length - 1];
        clientesUnicos.add(chatId);
      }
      
      console.log(`  📝 ${docId} -> ${typeForm}`);
    });
    
    console.log('\n📊 RESUMEN POR TIPO DE FORMULARIO:');
    Object.entries(tiposFormulario).forEach(([tipo, cantidad]) => {
      console.log(`  ${tipo}: ${cantidad} formularios`);
    });
    
    console.log(`\n👥 Clientes únicos identificados: ${clientesUnicos.size}`);
    
    // 2. Probar creación de un nuevo cliente
    console.log('\n✏️ 2. PROBANDO CREACIÓN DE NUEVO CLIENTE:');
    const timestamp = Date.now();
    const testChatId = `test_${timestamp}`;
    const docId = `${timestamp}_Formulario cliente manual_${testChatId}`;
    
    const nuevoClienteData = {
      'Por favor escribe tu nombre': 'Cliente de Prueba',
      'Email (opcional)': 'prueba@test.com',
      'Tipo de cliente': 'Regular',
      typeForm: 'Formulario cliente manual',
      createdAt: new Date().toISOString(),
      source: 'verification_test'
    };
    
    const clienteDocRef = doc(db, 'clients/worldfood/Formularios', docId);
    await setDoc(clienteDocRef, nuevoClienteData);
    
    console.log(`✅ Cliente de prueba creado con ID: ${docId}`);
    
    // 3. Probar creación de una nueva reserva
    console.log('\n🗓️ 3. PROBANDO CREACIÓN DE NUEVA RESERVA:');
    const reservaTimestamp = Date.now() + 1000;
    const reservaChatId = `test_reserva_${reservaTimestamp}`;
    const reservaDocId = `${reservaTimestamp}_Formulario reservas particulares_${reservaChatId}`;
    
    const nuevaReservaData = {
      'Indícame el nombre y apellido de la persona para la cual será la reserva.': 'Juan Pérez de Prueba',
      '¿Para cuántas personas deseas reservar?': '4',
      '*TEN EN CUENTA* debes reservar con 1 dia de anticipación y que tomamos reservas hasta las 7:30 pm. Después de esa hora es por orden de llegada.\\nPor favor escribe el *día y hora* en que deseas reservar.': 'Mañana a las 7:00 PM',
      'Indique el *área de preferencia*\\nTen en cuenta que el Rooftop solo de jueves a domingo a partir de las 5:30 pm, no incluye servicio del restaurante Brazzeiro (Rodizio) y dependemos del clima.': 'Terraza principal',
      typeForm: 'Formulario reservas particulares',
      createdAt: new Date().toISOString(),
      source: 'verification_test',
      status: 'pending'
    };
    
    const reservaDocRef = doc(db, 'clients/worldfood/Formularios', reservaDocId);
    await setDoc(reservaDocRef, nuevaReservaData);
    
    console.log(`✅ Reserva de prueba creada con ID: ${reservaDocId}`);
    
    // 4. Verificar que los nuevos datos se crearon correctamente
    console.log('\n🔍 4. VERIFICANDO DATOS RECIÉN CREADOS:');
    const newSnapshot = await getDocs(formulariosRef);
    console.log(`✅ Total de formularios después de las pruebas: ${newSnapshot.size}`);
    
    // Buscar nuestros datos de prueba
    let clientePruebaEncontrado = false;
    let reservaPruebaEncontrada = false;
    
    newSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.source === 'verification_test') {
        if (data.typeForm === 'Formulario cliente manual') {
          clientePruebaEncontrado = true;
          console.log(`✅ Cliente de prueba encontrado: ${doc.id}`);
        } else if (data.typeForm === 'Formulario reservas particulares') {
          reservaPruebaEncontrada = true;
          console.log(`✅ Reserva de prueba encontrada: ${doc.id}`);
        }
      }
    });
    
    console.log('\n🎉 RESULTADO FINAL:');
    console.log(`📊 Datos existentes: ${snapshot.size} formularios`);
    console.log(`👤 Cliente de prueba: ${clientePruebaEncontrado ? '✅ CREADO' : '❌ ERROR'}`);
    console.log(`🗓️ Reserva de prueba: ${reservaPruebaEncontrada ? '✅ CREADA' : '❌ ERROR'}`);
    console.log(`📈 Total final: ${newSnapshot.size} formularios`);
    
    if (clientePruebaEncontrado && reservaPruebaEncontrada) {
      console.log('\n🚀 ¡CONEXIÓN COMPLETAMENTE FUNCIONAL!');
      console.log('   Los servicios están guardando correctamente en la nueva BD');
    } else {
      console.log('\n⚠️ Hay problemas con la creación de datos');
    }
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

// Ejecutar verificación
verificarConexionCompleta().then(() => {
  console.log('\n✅ Verificación completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});