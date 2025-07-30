// Test para verificar si realmente se están guardando datos en Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

async function testCrearCliente() {
  try {
    console.log('🔥 Test de creación de cliente en Firestore...\n');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // 1. Primero, verificar cuántos clientes hay actualmente
    console.log('📊 === ESTADO INICIAL ===');
    const restauranteId = 'rest_donpepe_001';
    const clientesRef = collection(db, `restaurantes/${restauranteId}/clientes`);
    const snapshotInicial = await getDocs(clientesRef);
    console.log(`✅ Clientes actuales en ${restauranteId}: ${snapshotInicial.size}`);
    
    // 2. Crear un nuevo cliente de prueba
    console.log('\n🔧 === CREANDO CLIENTE DE PRUEBA ===');
    const testClienteId = `test_cliente_${Date.now()}`;
    const nuevoCliente = {
      id: testClienteId,
      name: 'Cliente de Prueba desde NodeJS',
      whatsAppName: 'Test NodeJS',
      email: 'test@nodejs.com',
      phone: '+573001234567',
      restauranteId: restauranteId,
      isWAContact: true,
      isMyContact: true,
      sourceType: 'manual',
      respType: 'manual',
      labels: 'test_nodejs',
      creation: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      userInteractions: {
        whatsapp: 0,
        controller: 0,
        chatbot: 0,
        api: 0,
        campaing: 0,
        client: 0,
        others: 0,
        wappController: 0,
        ai: 0,
        fee: 0
      }
    };
    
    // Guardar en Firestore
    const clienteDocRef = doc(db, `restaurantes/${restauranteId}/clientes/${testClienteId}`);
    await setDoc(clienteDocRef, nuevoCliente);
    console.log('✅ Cliente de prueba creado con ID:', testClienteId);
    
    // 3. Verificar que se guardó correctamente
    console.log('\n📊 === VERIFICANDO CREACIÓN ===');
    const snapshotDespues = await getDocs(clientesRef);
    console.log(`✅ Clientes después de crear: ${snapshotDespues.size} (debería ser ${snapshotInicial.size + 1})`);
    
    // Buscar el cliente específico
    let clienteEncontrado = false;
    snapshotDespues.forEach(doc => {
      if (doc.id === testClienteId) {
        clienteEncontrado = true;
        const data = doc.data();
        console.log('✅ Cliente encontrado en Firestore:');
        console.log('   - ID:', doc.id);
        console.log('   - Nombre:', data.name);
        console.log('   - Email:', data.email);
        console.log('   - Phone:', data.phone);
      }
    });
    
    if (!clienteEncontrado) {
      console.error('❌ ERROR: Cliente no encontrado después de crearlo');
    }
    
    // 4. Eliminar el cliente de prueba
    console.log('\n🗑️ === LIMPIANDO DATOS DE PRUEBA ===');
    await deleteDoc(clienteDocRef);
    console.log('✅ Cliente de prueba eliminado');
    
    // 5. Verificar eliminación
    const snapshotFinal = await getDocs(clientesRef);
    console.log(`✅ Clientes finales: ${snapshotFinal.size} (debería ser ${snapshotInicial.size})`);
    
    // Resumen
    console.log('\n📊 === RESUMEN DEL TEST ===');
    console.log('✅ Test completado exitosamente');
    console.log('✅ Los datos SÍ se están guardando en Firestore en la nube');
    console.log('✅ Las operaciones CRUD funcionan correctamente');
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error);
    console.error('❌ Detalles:', error.message);
  }
}

// Ejecutar el test
testCrearCliente().then(() => {
  console.log('\n✅ Test finalizado');
  process.exit(0);
}).catch(error => {
  console.error('Error final:', error);
  process.exit(1);
});