// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, collection, writeBatch } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

async function createUserAndRestaurantData() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Datos del usuario a crear
    const userData = {
      email: 'admin@donpepe.com',
      password: 'DonPepe2024!',
      displayName: 'Admin Don Pepe',
      emailVerified: true
    };

    console.log('🔥 Creando usuario en Firebase Authentication...');

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    
    // Actualizar el perfil del usuario
    await updateProfile(user, {
      displayName: userData.displayName
    });
    
    console.log('✅ Usuario creado exitosamente en Firebase Auth:', user.uid);

    // Datos del restaurante
    const restauranteData = {
      id: 'rest_donpepe_001',
      nombre: 'Don Pepe Restaurant',
      slug: 'don-pepe',
      descripcion: 'Restaurante tradicional con los mejores sabores',
      direccion: 'Calle 123 #45-67, Bogotá',
      telefono: '+57 300 123 4567',
      email: 'contacto@donpepe.com',
      sitioWeb: 'https://donpepe.com',
      colorPrimario: '#D32F2F',
      colorSecundario: '#FFC107',
      logo: 'https://firebasestorage.googleapis.com/v0/b/bocket-2024.appspot.com/o/logos%2Fdon-pepe-logo.png?alt=media',
      activo: true,
      fechaCreacion: new Date(),
      configuracion: {
        horarioAtencion: {
          lunes: { abierto: true, apertura: '08:00', cierre: '22:00' },
          martes: { abierto: true, apertura: '08:00', cierre: '22:00' },
          miercoles: { abierto: true, apertura: '08:00', cierre: '22:00' },
          jueves: { abierto: true, apertura: '08:00', cierre: '22:00' },
          viernes: { abierto: true, apertura: '08:00', cierre: '23:00' },
          sabado: { abierto: true, apertura: '09:00', cierre: '23:00' },
          domingo: { abierto: true, apertura: '09:00', cierre: '21:00' }
        },
        metodosEntrega: ['delivery', 'pickUp', 'insideOrder'],
        monedaDefecto: 'COP'
      }
    };

    console.log('🍽️ Creando datos del restaurante en Firestore...');

    // Crear documento del restaurante
    await setDoc(doc(db, 'restaurantes', restauranteData.id), restauranteData);
    console.log('✅ Restaurante creado en Firestore:', restauranteData.id);

    // Datos del usuario en Firestore
    const usuarioData = {
      uid: user.uid,
      email: userData.email,
      nombre: userData.displayName,
      rol: 'admin',
      activo: true,
      fechaCreacion: new Date(),
      ultimoAcceso: new Date(),
      restaurantePrincipal: restauranteData.id
    };

    console.log('👤 Creando perfil de usuario en Firestore...');

    // Crear documento del usuario
    await setDoc(doc(db, 'usuarios', user.uid), usuarioData);
    console.log('✅ Usuario creado en Firestore:', user.uid);

    // Crear relación usuario-restaurante
    const usuarioRestauranteData = {
      uid: user.uid,
      restauranteId: restauranteData.id,
      rol: 'admin',
      permisos: ['leer', 'escribir', 'eliminar', 'administrar'],
      activo: true,
      fechaAsignacion: new Date()
    };

    console.log('🔗 Creando relación usuario-restaurante...');

    const usuarioRestauranteId = `${user.uid}_${restauranteData.id}`;
    await setDoc(doc(db, 'usuariosRestaurantes', usuarioRestauranteId), usuarioRestauranteData);
    console.log('✅ Relación usuario-restaurante creada:', usuarioRestauranteId);

    // Crear algunas categorías de productos por defecto
    const categorias = [
      { id: 'entradas', nombre: 'Entradas', descripcion: 'Aperitivos y entradas', orden: 1, activa: true },
      { id: 'principales', nombre: 'Platos Principales', descripcion: 'Platos fuertes', orden: 2, activa: true },
      { id: 'bebidas', nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes', orden: 3, activa: true },
      { id: 'postres', nombre: 'Postres', descripcion: 'Dulces y postres', orden: 4, activa: true }
    ];

    console.log('📝 Creando categorías de productos por defecto...');

    const batch = writeBatch(db);
    categorias.forEach(categoria => {
      const ref = doc(db, 'restaurantes', restauranteData.id, 'categorias', categoria.id);
      batch.set(ref, categoria);
    });
    await batch.commit();
    console.log('✅ Categorías de productos creadas');

    console.log('\n🎉 ¡USUARIO CREADO EXITOSAMENTE!');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Password:', userData.password);
    console.log('🏪 Restaurante:', restauranteData.nombre);
    console.log('🔗 Slug:', restauranteData.slug);
    console.log('👤 UID:', user.uid);
    console.log('🆔 Restaurant ID:', restauranteData.id);

    console.log('\n🌐 URLs de acceso:');
    console.log('• Dashboard: https://tu-dominio.com/don-pepe/dashboard');
    console.log('• Clientes: https://tu-dominio.com/don-pepe/clientes');
    console.log('• Productos: https://tu-dominio.com/don-pepe/productos');
    console.log('• Reservas: https://tu-dominio.com/don-pepe/reservas');
    console.log('• Pedidos: https://tu-dominio.com/don-pepe/pedidos');

    console.log('\n✨ El usuario puede usar estas credenciales para hacer login en la aplicación');

  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    if (error.code === 'auth/email-already-exists') {
      console.log('💡 El email ya existe. Intentando obtener información del usuario existente...');
      console.log('💡 El email ya existe en Firebase Auth.');
      console.log('📧 Email:', userData.email);
      console.log('🔑 Password: DonPepe2024! (usa esta contraseña si no la has cambiado)');
    }
  }
}

// Ejecutar la función
createUserAndRestaurantData();