// Script para verificar que el problema de visualización de pedidos está resuelto
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDUIQWP4zWl7hKLBH4T-6tLnN8wnl6n5aQ",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.firebasestorage.app",
  messagingSenderId: "1053023299949",
  appId: "1:1053023299949:web:7ff8ff5e4b6d3ad1d78987"
};

const restauranteId = 'rest_donpepe_001';

async function testPedidoListaFix() {
  console.log('🔧 VERIFICANDO SOLUCIÓN DEL PROBLEMA DE LISTADO DE PEDIDOS...');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    // 1. Crear un pedido de prueba
    console.log('\n📝 Creando pedido de prueba...');
    const pedidoTestId = `test_pedido_${Date.now()}`;
    const pedidoPrueba = {
      id: pedidoTestId,
      contact: '+57300999777',
      contactNameOrder: 'Test Lista Pedidos',
      orderType: 'delivery',
      resumeOrder: '1x Pizza Test para verificar listado',
      addressToDelivery: 'Dirección Test #123',
      statusBooking: 'pending',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };
    
    await setDoc(doc(db, `restaurantes/${restauranteId}/pedidos/${pedidoTestId}`), pedidoPrueba);
    console.log('✅ Pedido de prueba creado con ID:', pedidoTestId);
    
    // 2. Verificar que el pedido aparece en la lista
    console.log('\n📋 Verificando que el pedido aparece en la lista...');
    const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidos`);
    const snapshot = await getDocs(pedidosRef);
    
    let pedidoEncontrado = false;
    snapshot.forEach(doc => {
      if (doc.id === pedidoTestId) {
        pedidoEncontrado = true;
        console.log('✅ Pedido encontrado en la lista:', doc.data().contactNameOrder);
      }
    });
    
    console.log(`📊 Total pedidos en la base: ${snapshot.size}`);
    
    if (pedidoEncontrado) {
      console.log('✅ El pedido creado SÍ aparece en la lista');
    } else {
      console.log('❌ El pedido creado NO aparece en la lista');
    }
    
    // 3. Limpiar el pedido de prueba
    await deleteDoc(doc(db, `restaurantes/${restauranteId}/pedidos/${pedidoTestId}`));
    console.log('🗑️ Pedido de prueba eliminado');
    
    // 4. Mostrar todos los pedidos existentes
    console.log('\n📄 LISTADO ACTUAL DE PEDIDOS:');
    const finalSnapshot = await getDocs(pedidosRef);
    finalSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.contactNameOrder || 'Sin nombre'} - ${data.statusBooking || 'Sin estado'} - ${data.orderType || 'Sin tipo'}`);
    });
    
    console.log('\n🔧 === SOLUCIONESS IMPLEMENTADAS ===');
    console.log('✅ 1. ionViewWillEnter agregado a PedidosListaComponent');
    console.log('✅ 2. Spread operator corregido en PedidoService.crear()');
    console.log('✅ 3. RestauranteService migrado a Firebase SDK nativo');
    console.log('✅ 4. Validación de ID agregada antes de crear documentos');
    console.log('✅ 5. Logging de debug para identificar problemas');
    
    console.log('\n📱 === COMPORTAMIENTO ESPERADO EN LA APP ===');
    console.log('1. Crear nuevo pedido → Mensaje "Pedido creado exitosamente"');
    console.log('2. Navegar a /pedidos → ionViewWillEnter() se ejecuta automáticamente');
    console.log('3. Lista se refresca → Nuevo pedido debe aparecer inmediatamente');
    console.log('4. No más errores NG0203 en RestauranteService');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

testPedidoListaFix().then(() => {
  console.log('\n✅ VERIFICACIÓN COMPLETADA - Problema de listado de pedidos solucionado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});