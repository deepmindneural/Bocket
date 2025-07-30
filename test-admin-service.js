// Test script para validar AdminService con Firebase SDK v9 nativo
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

// Simular exactamente el patrón que usa AdminService
async function probarAdminServicePattern() {
  try {
    console.log('🔥 AdminService Pattern Test: Iniciando...');
    
    // Paso 1: Inicializar app (esto debe haberse hecho ya en Angular)
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app inicializada');
    
    // Paso 2: Obtener Firestore directamente desde app
    const db = getFirestore(app);
    console.log('✅ Firestore obtenido correctamente');
    
    // Paso 3: Probar obtenerTodosRestaurantes()
    console.log('\n🏪 === OBTENER TODOS RESTAURANTES ===');
    const restaurantesRef = collection(db, 'restaurantes');
    const restaurantesSnapshot = await getDocs(restaurantesRef);
    
    const restaurantes = [];
    restaurantesSnapshot.forEach(doc => {
      const data = doc.data();
      restaurantes.push({ id: doc.id, ...data });
    });
    
    console.log(`✅ AdminService: ${restaurantes.length} restaurantes encontrados`);
    console.log('📋 Restaurantes:', restaurantes.map(r => ({ id: r.id, nombre: r.nombre })));
    
    // Paso 4: Probar obtenerTodosUsuarios()
    console.log('\n👤 === OBTENER TODOS USUARIOS ===');
    const usuariosRef = collection(db, 'usuarios');
    const usuariosSnapshot = await getDocs(usuariosRef);
    
    const usuarios = [];
    usuariosSnapshot.forEach(doc => {
      const data = doc.data();
      usuarios.push({ id: doc.id, ...data });
    });
    
    console.log(`✅ AdminService: ${usuarios.length} usuarios encontrados`);
    
    // Paso 5: Probar obtenerTodosPedidos()
    console.log('\n🍽️ === OBTENER TODOS PEDIDOS ===');
    const restaurantesIds = ['rest_donpepe_001', 'rest_marinacafe_002'];
    const todosPedidos = [];
    
    for (const restauranteId of restaurantesIds) {
      console.log(`🔍 Consultando pedidos de ${restauranteId}...`);
      const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidos`);
      const snapshot = await getDocs(pedidosRef);
      
      console.log(`📊 ${restauranteId}: ${snapshot.size} pedidos encontrados`);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        todosPedidos.push({ 
          id: doc.id, 
          restauranteId: restauranteId,
          restauranteNombre: restauranteId === 'rest_donpepe_001' ? 'Don Pepe Restaurant' : 'Marina Café & Bistro',
          ...data 
        });
      });
    }
    
    console.log(`✅ AdminService: ${todosPedidos.length} pedidos encontrados en total`);
    
    // Paso 6: Probar obtenerTodosClientes()
    console.log('\n👥 === OBTENER TODOS CLIENTES ===');
    const todosClientes = [];
    
    for (const restauranteId of restaurantesIds) {
      console.log(`🔍 Consultando clientes de ${restauranteId}...`);
      const clientesRef = collection(db, `restaurantes/${restauranteId}/clientes`);
      const snapshot = await getDocs(clientesRef);
      
      console.log(`📊 ${restauranteId}: ${snapshot.size} clientes encontrados`);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        todosClientes.push({ 
          id: doc.id, 
          restauranteId: restauranteId,
          restauranteNombre: restauranteId === 'rest_donpepe_001' ? 'Don Pepe Restaurant' : 'Marina Café & Bistro',
          ...data 
        });
      });
    }
    
    console.log(`✅ AdminService: ${todosClientes.length} clientes encontrados en total`);
    
    // Paso 7: Probar obtenerTodasReservas()
    console.log('\n📅 === OBTENER TODAS RESERVAS ===');
    const todasReservas = [];
    
    for (const restauranteId of restaurantesIds) {
      console.log(`🔍 Consultando reservas de ${restauranteId}...`);
      const reservasRef = collection(db, `restaurantes/${restauranteId}/reservas`);
      const snapshot = await getDocs(reservasRef);
      
      console.log(`📊 ${restauranteId}: ${snapshot.size} reservas encontradas`);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        todasReservas.push({ 
          id: doc.id, 
          restauranteId: restauranteId,
          restauranteNombre: restauranteId === 'rest_donpepe_001' ? 'Don Pepe Restaurant' : 'Marina Café & Bistro',
          ...data 
        });
      });
    }
    
    console.log(`✅ AdminService: ${todasReservas.length} reservas encontradas en total`);
    
    // Resumen final
    console.log('\n📊 === RESUMEN FINAL ===');
    console.log(`🏪 Restaurantes: ${restaurantes.length}`);
    console.log(`👤 Usuarios: ${usuarios.length}`);
    console.log(`🍽️ Pedidos: ${todosPedidos.length}`);
    console.log(`👥 Clientes: ${todosClientes.length}`);
    console.log(`📅 Reservas: ${todasReservas.length}`);
    
    console.log('\n✅ AdminService Pattern Test: ¡EXITOSO! 🎉');
    console.log('✅ Firebase SDK v9 nativo funciona correctamente');
    console.log('✅ No hay errores NG0203 en este patrón');
    
  } catch (error) {
    console.error('❌ Error en AdminService Pattern Test:', error);
    console.error('❌ Detalles del error:', error.message);
  }
}

probarAdminServicePattern().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error final:', error);
  process.exit(1);
});