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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifySetup() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE BASE DE DATOS');
  
  try {
    // Verificar usuarios globales
    const usuarios = await getDocs(collection(db, 'usuarios'));
    console.log(`✅ usuarios: ${usuarios.size} documentos`);
    
    // Verificar restaurantes
    const restaurantes = await getDocs(collection(db, 'restaurantes'));
    console.log(`✅ restaurantes: ${restaurantes.size} documentos`);
    
    // Verificar relaciones usuario-restaurante
    const usuariosRestaurantes = await getDocs(collection(db, 'usuariosRestaurantes'));
    console.log(`✅ usuariosRestaurantes: ${usuariosRestaurantes.size} documentos`);
    
    // Verificar clientes con finalUser para cada restaurante
    const restauranteIds = ['rest_donpepe_001', 'rest_marinacafe_002'];
    
    for (const restauranteId of restauranteIds) {
      console.log(`\n📁 Verificando: ${restauranteId}`);
      
      const clientes = await getDocs(collection(db, 'restaurantes', restauranteId, 'clientes'));
      console.log(`  👥 clientes: ${clientes.size} documentos`);
      
      if (clientes.size > 0) {
        const primeraCliente = clientes.docs[0].data();
        console.log(`  🔍 Campos finalUser en primer cliente:`);
        console.log(`    - id: ${primeraCliente.id}`);
        console.log(`    - name: ${primeraCliente.name}`);
        console.log(`    - sourceType: ${primeraCliente.sourceType}`);
        console.log(`    - respType: ${primeraCliente.respType}`);
        console.log(`    - isWAContact: ${primeraCliente.isWAContact}`);
        console.log(`    - userInteractions.whatsapp: ${primeraCliente.userInteractions?.whatsapp}`);
        console.log(`    - userInteractions.fee: ${primeraCliente.userInteractions?.fee}`);
      }
      
      const pedidos = await getDocs(collection(db, 'restaurantes', restauranteId, 'pedidos'));
      console.log(`  🍽️  pedidos: ${pedidos.size} documentos`);
      
      if (pedidos.size > 0) {
        const primerPedido = pedidos.docs[0].data();
        console.log(`  🔍 Campos OrderTodelivery en primer pedido:`);
        console.log(`    - id: ${primerPedido.id}`);
        console.log(`    - contact: ${primerPedido.contact}`);
        console.log(`    - orderType: ${primerPedido.orderType}`);
        console.log(`    - statusBooking: ${primerPedido.statusBooking}`);
        console.log(`    - contactNameOrder: ${primerPedido.contactNameOrder}`);
      }
      
      const etiquetas = await getDocs(collection(db, 'restaurantes', restauranteId, 'etiquetas'));
      console.log(`  🏷️  etiquetas: ${etiquetas.size} documentos`);
      
      const productos = await getDocs(collection(db, 'restaurantes', restauranteId, 'productos'));
      console.log(`  🥘 productos: ${productos.size} documentos`);
    }
    
    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('✅ Base de datos configurada con interfaces finalUser y OrderTodelivery');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifySetup().then(() => process.exit(0));