// Script de diagnóstico detallado para el login
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

async function testLoginDetailed() {
  try {
    console.log('🚀 Iniciando diagnóstico detallado de login...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const email = 'admin@donpepe.com';
    const password = 'DonPepe2024!';

    console.log('\n📋 Configuración Firebase:');
    console.log('- Project ID:', firebaseConfig.projectId);
    console.log('- Auth Domain:', firebaseConfig.authDomain);
    console.log('- API Key:', firebaseConfig.apiKey.substring(0, 20) + '...');

    console.log('\n🔐 Credenciales a verificar:');
    console.log('- Email:', email);
    console.log('- Password:', password);

    // Configurar listener de estado de autenticación
    console.log('\n👂 Configurando listener de autenticación...');
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Usuario autenticado detectado:');
        console.log('  - UID:', user.uid);
        console.log('  - Email:', user.email);
        console.log('  - Email verificado:', user.emailVerified);
        console.log('  - Display Name:', user.displayName);
      } else {
        console.log('❌ No hay usuario autenticado');
      }
    });

    // Intentar login paso a paso
    console.log('\n🔄 Paso 1: Intentando signInWithEmailAndPassword...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('✅ Paso 1 EXITOSO - Firebase Auth respondió');
    console.log('  - User UID:', userCredential.user.uid);
    console.log('  - User Email:', userCredential.user.email);
    console.log('  - Access Token disponible:', !!userCredential.user.accessToken);

    // Verificar datos del usuario en Firestore
    console.log('\n🔄 Paso 2: Verificando documento de usuario en Firestore...');
    const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
    
    if (userDoc.exists()) {
      console.log('✅ Paso 2 EXITOSO - Documento de usuario encontrado');
      const userData = userDoc.data();
      console.log('  - Datos del usuario:');
      console.log('    * Email:', userData.email);
      console.log('    * Nombre:', userData.nombre);
      console.log('    * Rol:', userData.rol);
      console.log('    * Activo:', userData.activo);
      console.log('    * Restaurante Principal:', userData.restaurantePrincipal);
      
      // Verificar restaurante
      if (userData.restaurantePrincipal) {
        console.log('\n🔄 Paso 3: Verificando restaurante asociado...');
        const restauranteDoc = await getDoc(doc(db, 'restaurantes', userData.restaurantePrincipal));
        
        if (restauranteDoc.exists()) {
          console.log('✅ Paso 3 EXITOSO - Restaurante encontrado');
          const restauranteData = restauranteDoc.data();
          console.log('  - Datos del restaurante:');
          console.log('    * ID:', restauranteDoc.id);
          console.log('    * Nombre:', restauranteData.nombre);
          console.log('    * Slug:', restauranteData.slug);
          console.log('    * Activo:', restauranteData.activo);
          console.log('    * Email:', restauranteData.email);
        } else {
          console.log('❌ Paso 3 FALLIDO - Restaurante no encontrado');
        }
      } else {
        console.log('⚠️  No hay restaurante principal asignado');
      }

      // Verificar relación usuario-restaurante
      console.log('\n🔄 Paso 4: Verificando relación usuario-restaurante...');
      const relacionId = `${userCredential.user.uid}_${userData.restaurantePrincipal}`;
      const relacionDoc = await getDoc(doc(db, 'usuariosRestaurantes', relacionId));
      
      if (relacionDoc.exists()) {
        console.log('✅ Paso 4 EXITOSO - Relación encontrada');
        const relacionData = relacionDoc.data();
        console.log('  - Datos de la relación:');
        console.log('    * UID:', relacionData.uid);
        console.log('    * Restaurante ID:', relacionData.restauranteId);
        console.log('    * Rol:', relacionData.rol);
        console.log('    * Activo:', relacionData.activo);
        console.log('    * Permisos:', relacionData.permisos);
      } else {
        console.log('❌ Paso 4 FALLIDO - Relación no encontrada');
        console.log('  - ID buscado:', relacionId);
      }

    } else {
      console.log('❌ Paso 2 FALLIDO - Documento de usuario no encontrado');
      console.log('  - UID buscado:', userCredential.user.uid);
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETO');
    console.log('✅ Firebase Auth: FUNCIONANDO');
    console.log('✅ Credenciales: VÁLIDAS');
    console.log('✅ Conexión Firestore: FUNCIONANDO');
    
    // Simular el flujo de AuthService
    console.log('\n🔄 Simulando flujo de AuthService...');
    
    // Verificar que el currentUser se setearía correctamente
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ currentUser se setearía a:', {
        uid: userCredential.user.uid,
        email: userData.email,
        nombre: userData.nombre,
        restaurantePrincipal: userData.restaurantePrincipal
      });
      
      // Verificar que el currentRestaurant se setearía correctamente
      if (userData.restaurantePrincipal) {
        const restauranteDoc = await getDoc(doc(db, 'restaurantes', userData.restaurantePrincipal));
        if (restauranteDoc.exists()) {
          console.log('✅ currentRestaurant se setearía a:', {
            id: restauranteDoc.id,
            nombre: restauranteDoc.data().nombre,
            slug: restauranteDoc.data().slug
          });
          
          console.log('\n🌟 CONCLUSIÓN: El login DEBERÍA funcionar correctamente');
          console.log('📋 Usar estas credenciales en la aplicación:');
          console.log('   📧 Email: admin@donpepe.com');
          console.log('   🔑 Password: DonPepe2024!');
          
        } else {
          console.log('❌ Problema: Restaurante no existe');
        }
      } else {
        console.log('❌ Problema: Usuario no tiene restaurante principal');
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR EN EL DIAGNÓSTICO:');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    // Diagnosticar tipos de error específicos
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 SOLUCIÓN: El usuario no existe en Firebase Auth');
      console.log('   - Ejecutar create-firebase-user.js nuevamente');
    } else if (error.code === 'auth/wrong-password') {
      console.log('\n💡 SOLUCIÓN: La contraseña es incorrecta');
      console.log('   - Verificar que la contraseña sea: DonPepe2024!');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 SOLUCIÓN: El formato del email es inválido');
    } else if (error.code === 'auth/network-request-failed') {
      console.log('\n💡 SOLUCIÓN: Problema de conexión a Firebase');
      console.log('   - Verificar conexión a internet');
      console.log('   - Verificar configuración de Firebase');
    }
  }
}

// Ejecutar el diagnóstico
testLoginDetailed();