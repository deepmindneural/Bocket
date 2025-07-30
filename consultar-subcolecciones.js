// Script para consultar subcolecciones específicas
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

async function consultarSubcolecciones() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const restaurantes = [
      { id: 'rest_donpepe_001', nombre: 'Don Pepe Restaurant' },
      { id: 'rest_marinacafe_002', nombre: 'Marina Café & Bistro' }
    ];
    
    for (const restaurante of restaurantes) {
      console.log(`\n🔍 === ${restaurante.nombre} (${restaurante.id}) ===`);
      
      // Consultar clientes
      try {
        const clientesRef = collection(db, `restaurantes/${restaurante.id}/clientes`);
        const clientesSnapshot = await getDocs(clientesRef);
        console.log(`👥 Clientes: ${clientesSnapshot.size}`);
        
        if (clientesSnapshot.size > 0) {
          clientesSnapshot.forEach((doc, index) => {
            if (index < 3) { // Solo mostrar primeros 3
              const data = doc.data();
              console.log(`   📋 Cliente ${index + 1}:`, {
                id: doc.id,
                name: data.name,
                email: data.email,
                phone: data.phone
              });
            }
          });
          if (clientesSnapshot.size > 3) {
            console.log(`   ... y ${clientesSnapshot.size - 3} más`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error consultando clientes: ${error.message}`);
      }
      
      // Consultar pedidos
      try {
        const pedidosRef = collection(db, `restaurantes/${restaurante.id}/pedidos`);
        const pedidosSnapshot = await getDocs(pedidosRef);
        console.log(`🍽️ Pedidos: ${pedidosSnapshot.size}`);
        
        if (pedidosSnapshot.size > 0) {
          pedidosSnapshot.forEach((doc, index) => {
            if (index < 3) { // Solo mostrar primeros 3
              const data = doc.data();
              console.log(`   📋 Pedido ${index + 1}:`, {
                id: doc.id,
                contactNameOrder: data.contactNameOrder,
                statusBooking: data.statusBooking,
                orderType: data.orderType
              });
            }
          });
          if (pedidosSnapshot.size > 3) {
            console.log(`   ... y ${pedidosSnapshot.size - 3} más`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error consultando pedidos: ${error.message}`);
      }
      
      // Consultar reservas
      try {
        const reservasRef = collection(db, `restaurantes/${restaurante.id}/reservas`);
        const reservasSnapshot = await getDocs(reservasRef);
        console.log(`📅 Reservas: ${reservasSnapshot.size}`);
        
        if (reservasSnapshot.size > 0) {
          reservasSnapshot.forEach((doc, index) => {
            if (index < 3) { // Solo mostrar primeros 3
              const data = doc.data();
              console.log(`   📋 Reserva ${index + 1}:`, {
                id: doc.id,
                contactNameBooking: data.contactNameBooking,
                statusBooking: data.statusBooking,
                dateBooking: data.dateBooking
              });
            }
          });
          if (reservasSnapshot.size > 3) {
            console.log(`   ... y ${reservasSnapshot.size - 3} más`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error consultando reservas: ${error.message}`);
      }
      
      // Consultar productos
      try {
        const productosRef = collection(db, `restaurantes/${restaurante.id}/productos`);
        const productosSnapshot = await getDocs(productosRef);
        console.log(`🥘 Productos: ${productosSnapshot.size}`);
        
        if (productosSnapshot.size > 0) {
          productosSnapshot.forEach((doc, index) => {
            if (index < 3) { // Solo mostrar primeros 3
              const data = doc.data();
              console.log(`   📋 Producto ${index + 1}:`, {
                id: doc.id,
                nombre: data.nombre,
                precio: data.precio,
                categoria: data.categoria
              });
            }
          });
          if (productosSnapshot.size > 3) {
            console.log(`   ... y ${productosSnapshot.size - 3} más`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error consultando productos: ${error.message}`);
      }
    }
    
    // Consultar usuarios globales
    console.log(`\n👤 === USUARIOS GLOBALES ===`);
    try {
      const usuariosRef = collection(db, 'usuarios');
      const usuariosSnapshot = await getDocs(usuariosRef);
      console.log(`👥 Total usuarios: ${usuariosSnapshot.size}`);
      
      usuariosSnapshot.forEach((doc, index) => {
        if (index < 5) { // Solo mostrar primeros 5
          const data = doc.data();
          console.log(`   📋 Usuario ${index + 1}:`, {
            id: doc.id,
            email: data.email,
            nombre: data.nombre,
            activo: data.activo
          });
        }
      });
    } catch (error) {
      console.log(`❌ Error consultando usuarios: ${error.message}`);
    }
    
    console.log('\n✅ Consulta de subcolecciones completada');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

consultarSubcolecciones().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error final:', error);
  process.exit(1);
});