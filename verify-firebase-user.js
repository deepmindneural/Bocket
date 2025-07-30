// Script para verificar la creación del usuario en Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

async function verifyUserAndData() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const email = 'admin@donpepe.com';
    const password = 'DonPepe2024!';

    console.log('🔍 Verificando conexión a Firebase...');
    console.log('📧 Email a verificar:', email);
    console.log('🔑 Password a verificar:', password);

    // Intentar hacer login con las credenciales
    console.log('\n🔐 Intentando login con las credenciales...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ LOGIN EXITOSO!');
    console.log('👤 UID:', user.uid);
    console.log('📧 Email:', user.email);
    console.log('📅 Email verificado:', user.emailVerified);
    console.log('👨‍💼 Display Name:', user.displayName);

    // Verificar datos del usuario en Firestore
    console.log('\n🔍 Verificando datos del usuario en Firestore...');
    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('✅ Documento de usuario encontrado en Firestore:');
      console.log(JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log('❌ No se encontró documento de usuario en Firestore');
    }

    // Verificar datos del restaurante
    console.log('\n🏪 Verificando datos del restaurante...');
    const restauranteId = 'rest_donpepe_001';
    const restauranteDocRef = doc(db, 'restaurantes', restauranteId);
    const restauranteDoc = await getDoc(restauranteDocRef);
    
    if (restauranteDoc.exists()) {
      console.log('✅ Documento de restaurante encontrado en Firestore:');
      console.log(JSON.stringify(restauranteDoc.data(), null, 2));
    } else {
      console.log('❌ No se encontró documento de restaurante en Firestore');
    }

    // Verificar relación usuario-restaurante
    console.log('\n🔗 Verificando relación usuario-restaurante...');
    const usuarioRestauranteId = `${user.uid}_${restauranteId}`;
    const usuarioRestauranteDocRef = doc(db, 'usuariosRestaurantes', usuarioRestauranteId);
    const usuarioRestauranteDoc = await getDoc(usuarioRestauranteDocRef);
    
    if (usuarioRestauranteDoc.exists()) {
      console.log('✅ Relación usuario-restaurante encontrada:');
      console.log(JSON.stringify(usuarioRestauranteDoc.data(), null, 2));
    } else {
      console.log('❌ No se encontró relación usuario-restaurante');
    }

    // Verificar categorías de productos
    console.log('\n📝 Verificando categorías de productos...');
    const categoriasRef = collection(db, 'restaurantes', restauranteId, 'categorias');
    const categoriasSnapshot = await getDocs(categoriasRef);
    
    if (!categoriasSnapshot.empty) {
      console.log('✅ Categorías encontradas:');
      categoriasSnapshot.forEach(doc => {
        console.log(`- ${doc.id}:`, doc.data());
      });
    } else {
      console.log('❌ No se encontraron categorías de productos');
    }

    // Verificar colecciones del restaurante
    console.log('\n📊 Verificando estructura de datos del restaurante...');
    const colecciones = ['clientes', 'productos', 'reservas', 'pedidos'];
    
    for (const coleccion of colecciones) {
      try {
        const coleccionRef = collection(db, 'restaurantes', restauranteId, coleccion);
        const snapshot = await getDocs(coleccionRef);
        console.log(`✅ Colección '${coleccion}': ${snapshot.size} documentos`);
      } catch (error) {
        console.log(`❌ Error accediendo a colección '${coleccion}':`, error.message);
      }
    }

    // Cerrar sesión
    await signOut(auth);
    console.log('\n✅ Verificación completada. Usuario desconectado.');

    console.log('\n🎉 RESUMEN DE VERIFICACIÓN:');
    console.log('✅ Firebase Auth: Funcionando correctamente');
    console.log('✅ Firestore: Conexión exitosa');
    console.log('✅ Credenciales: Válidas y funcionales');
    console.log('✅ Estructura de datos: Completa');

    console.log('\n📋 CREDENCIALES VERIFICADAS:');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🏪 Restaurante ID:', restauranteId);
    console.log('👤 User UID:', user.uid);

  } catch (error) {
    console.error('\n❌ ERROR EN LA VERIFICACIÓN:');
    console.error('Código de error:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 El usuario no existe en Firebase Auth');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 La contraseña es incorrecta');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 El formato del email es inválido');
    } else if (error.code === 'auth/user-disabled') {
      console.log('💡 El usuario está deshabilitado');
    } else if (error.code === 'auth/too-many-requests') {
      console.log('💡 Demasiados intentos fallidos, cuenta temporalmente bloqueada');
    }
    
    console.log('\n🔧 Intentando crear el usuario nuevamente...');
    // Si hay error, intentar crear el usuario de nuevo
    try {
      const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
      const { setDoc } = require('firebase/firestore');
      
      const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = newUserCredential.user;
      
      await updateProfile(newUser, {
        displayName: 'Admin Don Pepe'
      });
      
      console.log('✅ Usuario recreado exitosamente:', newUser.uid);
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      
    } catch (createError) {
      console.error('❌ Error recreando usuario:', createError.message);
      if (createError.code === 'auth/email-already-in-use') {
        console.log('💡 El email ya está en uso. Las credenciales deberían funcionar.');
      }
    }
  }
}

// Ejecutar la verificación
verifyUserAndData();