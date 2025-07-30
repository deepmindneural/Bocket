// Script para migrar automáticamente los servicios a Firebase SDK nativo
const fs = require('fs');
const path = require('path');

const servicesToFix = [
  'src/app/servicios/cliente.service.ts',
  'src/app/servicios/pedido.service.ts', 
  'src/app/servicios/producto.service.ts'
];

const firebaseImports = `
// Import Firebase SDK nativo para operaciones directas
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';`;

function addFirebaseImports(content) {
  // Buscar la línea después de los imports existentes
  const lines = content.split('\n');
  let insertIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('from \'./auth.service\';') || lines[i].includes('from \'../modelos')) {
      insertIndex = i + 1;
      break;
    }
  }
  
  if (insertIndex > -1) {
    lines.splice(insertIndex, 0, firebaseImports);
  }
  
  return lines.join('\n');
}

function replaceObtenerTodos(content, collectionName) {
  const oldMethod = /\/\/ CRUD: Obtener todos.*?\n.*?async obtenerTodos\(\): Promise<.*?\[\]> {[\s\S]*?return.*?;.*?\n.*?}/;
  
  const newMethod = `  // CRUD: Obtener todos usando Firebase SDK nativo
  async obtenerTodos(): Promise<${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}[]> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const collectionRef = collection(db, 'restaurantes', restauranteActual.id, '${collectionName}');
      const snapshot = await getDocs(collectionRef);
      
      const items: ${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as ${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)});
      });
      
      return items;
    } catch (error) {
      console.error('Error obteniendo ${collectionName}:', error);
      return [];
    }
  }`;
  
  return content.replace(oldMethod, newMethod);
}

function replaceCrearMethod(content, collectionName, entityType) {
  const oldMethod = /\/\/ CRUD: Crear.*?\n.*?async crear\(.*?\): Promise<.*?> {[\s\S]*?return.*?;.*?\n.*?}/;
  
  const newMethod = `  // CRUD: Crear usando Firebase SDK nativo
  async crear(item: Partial<${entityType}>): Promise<${entityType}> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const nuevoItem = {
        id: this.generarId(),
        ...item
      } as ${entityType};

      const app = getApp();
      const db = getFirestore(app);
      const docRef = doc(db, 'restaurantes', restauranteActual.id, '${collectionName}', nuevoItem.id);
      await setDoc(docRef, nuevoItem);
      
      console.log('${entityType} creado exitosamente:', nuevoItem);
      return nuevoItem;
    } catch (error) {
      console.error('Error creando ${entityType.toLowerCase()}:', error);
      throw error;
    }
  }`;
  
  return content.replace(oldMethod, newMethod);
}

console.log('🔧 Iniciando migración de servicios a Firebase SDK nativo...');

servicesToFix.forEach(servicePath => {
  if (fs.existsSync(servicePath)) {
    console.log(`📝 Procesando ${servicePath}...`);
    
    let content = fs.readFileSync(servicePath, 'utf8');
    
    // Determinar el tipo de servicio
    let collectionName, entityType;
    if (servicePath.includes('cliente')) {
      collectionName = 'clientes';
      entityType = 'Cliente';
    } else if (servicePath.includes('pedido')) {
      collectionName = 'pedidos';
      entityType = 'Pedido';
    } else if (servicePath.includes('producto')) {
      collectionName = 'productos';
      entityType = 'Producto';
    }
    
    // Aplicar transformaciones
    if (!content.includes('getFirestore')) {
      content = addFirebaseImports(content);
      console.log(`✅ Imports de Firebase agregados a ${servicePath}`);
    }
    
    // Solo aplicar si no está ya migrado
    if (content.includes('this.firestore.collection') && content.includes('obtenerTodos')) {
      content = replaceObtenerTodos(content, collectionName);
      console.log(`✅ Método obtenerTodos migrado en ${servicePath}`);
    }
    
    if (content.includes('this.firestore.collection') && content.includes('async crear')) {
      content = replaceCrearMethod(content, collectionName, entityType);
      console.log(`✅ Método crear migrado en ${servicePath}`);
    }
    
    fs.writeFileSync(servicePath, content, 'utf8');
    console.log(`✅ ${servicePath} actualizado exitosamente`);
  } else {
    console.log(`⚠️  Archivo no encontrado: ${servicePath}`);
  }
});

console.log('\n🎉 Migración completada!');
console.log('📋 Servicios migrados:');
servicesToFix.forEach(service => {
  if (fs.existsSync(service)) {
    console.log(`  ✅ ${service}`);
  }
});

console.log('\n🔧 Próximos pasos:');
console.log('1. Compilar con: npm run build');
console.log('2. Probar la aplicación');
console.log('3. Revisar errores en consola del navegador');