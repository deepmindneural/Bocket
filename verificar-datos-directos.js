const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuración Firebase
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

async function verificarDatosDirectos() {
  console.log('🔥 VERIFICACIÓN DIRECTA DE DATOS EN FIREBASE');
  console.log('============================================');
  
  try {
    // Verificar la ruta exacta que usan los servicios
    const formulariosPath = 'clients/worldfood/Formularios';
    console.log(`📍 Verificando ruta: ${formulariosPath}`);
    
    const formulariosRef = collection(db, formulariosPath);
    const snapshot = await getDocs(formulariosRef);
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.size === 0) {
      console.log('❌ No hay documentos en la colección');
      console.log('💡 Esto significa que los datos no se están guardando o la ruta es incorrecta');
      return;
    }
    
    // Analizar cada documento
    console.log('\n📋 ANÁLISIS DETALLADO DE DOCUMENTOS:');
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      const docId = doc.id;
      
      console.log(`\n${index + 1}. DOCUMENTO: ${docId}`);
      console.log(`   TypeForm: ${data.typeForm || 'Sin tipo'}`);
      console.log(`   CreatedAt: ${data.createdAt || 'Sin fecha'}`);
      console.log(`   Source: ${data.source || 'Sin origen'}`);
      
      // Parsear ID para extraer información
      const parts = docId.split('_');
      if (parts.length >= 3) {
        const timestamp = parseInt(parts[0]);
        const typeForm = parts.slice(1, -1).join('_');
        const chatId = parts[parts.length - 1];
        
        console.log(`   → Timestamp: ${timestamp} (${new Date(timestamp).toLocaleString()})`);
        console.log(`   → Tipo formulario: ${typeForm}`);
        console.log(`   → Chat ID: ${chatId}`);
      }
      
      // Mostrar campos principales
      if (data['Por favor escribe tu nombre']) {
        console.log(`   → Nombre: ${data['Por favor escribe tu nombre']}`);
      }
      if (data['Email (opcional)']) {
        console.log(`   → Email: ${data['Email (opcional)']}`);
      }
      if (data['Indícame el nombre y apellido de la persona para la cual será la reserva.']) {
        console.log(`   → Nombre reserva: ${data['Indícame el nombre y apellido de la persona para la cual será la reserva.']}`);
      }
    });
    
    // Analizar por tipos
    console.log('\n📊 ANÁLISIS POR TIPO DE FORMULARIO:');
    const tiposCont = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const tipo = data.typeForm || 'Sin tipo';
      tiposCont[tipo] = (tiposCont[tipo] || 0) + 1;
    });
    
    Object.entries(tiposCont).forEach(([tipo, cantidad]) => {
      console.log(`   ${tipo}: ${cantidad} documentos`);
    });
    
    // Simular la lógica del ClienteService
    console.log('\n🧠 SIMULANDO LÓGICA DEL ClienteService.obtenerTodos():');
    const clientesMap = new Map();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      const parts = docId.split('_');
      
      if (parts.length >= 3) {
        const chatId = parts[parts.length - 1];
        const typeForm = parts.slice(1, -1).join('_');
        const timestamp = parseInt(parts[0]);
        
        // Simular extraerInfoCliente
        let nombre = '';
        if (typeForm.includes('cliente manual')) {
          nombre = data['Por favor escribe tu nombre'] || '';
        } else if (typeForm.includes('reservas')) {
          nombre = data['Indícame el nombre y apellido de la persona para la cual será la reserva.'] || '';
        }
        
        if (nombre) {
          if (clientesMap.has(chatId)) {
            const existente = clientesMap.get(chatId);
            if (timestamp > parseInt(existente.creation || '0')) {
              clientesMap.set(chatId, { chatId, nombre, timestamp, typeForm });
            }
          } else {
            clientesMap.set(chatId, { chatId, nombre, timestamp, typeForm });
          }
        }
      }
    });
    
    const clientesEncontrados = Array.from(clientesMap.values());
    console.log(`✅ Clientes únicos extraídos: ${clientesEncontrados.length}`);
    
    clientesEncontrados.forEach((cliente, index) => {
      console.log(`   ${index + 1}. ${cliente.nombre} (${cliente.chatId}) - ${cliente.typeForm}`);
    });
    
    if (clientesEncontrados.length === 0) {
      console.log('\n❌ NO SE EXTRAJO NINGÚN CLIENTE');
      console.log('🔍 Posibles causas:');
      console.log('   1. Los documentos no tienen los campos de nombre esperados');
      console.log('   2. La lógica de extracción no coincide con la estructura real');
      console.log('   3. Los documentos no siguen el formato esperado de ID');
    } else {
      console.log('\n✅ EXTRACCIÓN EXITOSA');
      console.log('🎉 Los clientes deberían aparecer en la interfaz');
    }
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

// Ejecutar verificación
verificarDatosDirectos().then(() => {
  console.log('\n✅ Verificación completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});