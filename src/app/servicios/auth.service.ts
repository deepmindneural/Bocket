import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, from, of, switchMap } from 'rxjs';
import { UsuarioGlobal, UsuarioRestaurante } from '../modelos';

// Import Firebase SDK nativo para operaciones directas
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  user$ = this.auth.authState;
  currentUser: UsuarioGlobal | null = null;
  currentRestaurant: any = null;
  
  // Solo usar Firebase - sin modo mock
  private useFirebase = true;
  
  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    // Intentar cargar datos del localStorage al inicializar
    this.initializeFromStorage();
    
    // Configurar listener de Firebase
    this.user$.subscribe((firebaseUser) => {
      if (!firebaseUser) {
        // Usuario no autenticado
        this.currentUser = null;
        this.currentRestaurant = null;
        // Limpiar localStorage
        try {
          localStorage.removeItem('bocket_current_user');
          localStorage.removeItem('bocket_current_restaurant');
        } catch (error) {
          console.error('Error limpiando localStorage en logout automático:', error);
        }
      }
    });
  }
  
  // Inicializar desde localStorage
  private initializeFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('bocket_current_user');
      const storedRestaurant = localStorage.getItem('bocket_current_restaurant');
      
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        console.log('🔄 AuthService: Usuario cargado desde localStorage en inicialización:', this.currentUser);
      }
      
      if (storedRestaurant) {
        this.currentRestaurant = JSON.parse(storedRestaurant);
        console.log('🔄 AuthService: Restaurante cargado desde localStorage en inicialización:', this.currentRestaurant);
        // Aplicar tema si hay datos del restaurante
        if (this.currentRestaurant) {
          this.aplicarTemaRestaurante(this.currentRestaurant);
        }
      }
    } catch (error) {
      console.error('Error inicializando desde localStorage:', error);
    }
  }

  // Método para cambiar entre modo Firebase y Mock
  setUseFirebase(useFirebase: boolean): void {
    this.useFirebase = useFirebase;
    console.log(`AuthService: Modo cambiado a ${useFirebase ? 'Firebase' : 'Mock'}`);
  }

  // Iniciar sesión
  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log('AuthService: Iniciando login para:', email);
      
      // Limpiar cualquier sesión anterior
      this.currentUser = null;
      this.currentRestaurant = null;
      this.limpiarTemaPersonalizado();
      
      return await this.loginConFirebase(email, password);
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  // Login con Firebase
  private async loginConFirebase(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 AuthService: Iniciando signInWithEmailAndPassword...');
      const credential = await this.auth.signInWithEmailAndPassword(email, password);
      console.log('✅ AuthService: Firebase Auth exitoso, UID:', credential.user?.uid);
      
      if (credential.user) {
        console.log('📋 AuthService: Cargando datos del usuario...');
        await this.cargarDatosUsuario(credential.user.uid);
        console.log('👤 AuthService: currentUser después de cargar:', this.currentUser);
        
        // Buscar el restaurante principal del usuario
        const restaurantePrincipalId = this.currentUser?.restaurantePrincipal;
        console.log('🏪 AuthService: Restaurante principal ID:', restaurantePrincipalId);
        
        if (restaurantePrincipalId) {
          console.log('🔍 AuthService: Buscando datos del restaurante...');
          
          // Usar Firebase SDK nativo también para el restaurante
          const app = getApp();
          const db = getFirestore(app);
          const restauranteDocRef = doc(db, 'restaurantes', restaurantePrincipalId);
          const restauranteDoc = await getDoc(restauranteDocRef);
          
          if (restauranteDoc.exists()) {
            const data = restauranteDoc.data();
            this.currentRestaurant = { id: restauranteDoc.id, ...data };
            
            // Guardar en localStorage como respaldo
            try {
              localStorage.setItem('bocket_current_restaurant', JSON.stringify(this.currentRestaurant));
              localStorage.setItem('bocket_current_user', JSON.stringify(this.currentUser));
            } catch (error) {
              console.error('Error guardando en localStorage:', error);
            }
            
            this.aplicarTemaRestaurante(this.currentRestaurant);
            console.log('✅ AuthService: Restaurante cargado exitosamente:', this.currentRestaurant);
            console.log('🎨 AuthService: Tema aplicado, navegando a dashboard...');
            
            // Verificar estado final antes de navegar
            console.log('🔍 AuthService: Estado final antes de navegar:');
            console.log('  - estaAutenticado():', this.estaAutenticado());
            console.log('  - currentUser:', !!this.currentUser);
            console.log('  - currentRestaurant:', !!this.currentRestaurant);
            
            // Pequeño delay para asegurar que todo esté listo antes de navegar
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 200);
            
            return true;
          } else {
            console.log('❌ AuthService: Documento de restaurante no encontrado');
            return false;
          }
        } else {
          console.log('⚠️ AuthService: Usuario no tiene restaurante principal, navegando a configuración inicial');
          this.router.navigate(['/configuracion-inicial']);
          return true;
        }
      }
      
      console.log('❌ AuthService: No se obtuvo credential.user');
      return false;
    } catch (error: any) {
      console.error('❌ AuthService: Error en login con Firebase:', error);
      console.error('   - Código:', error?.code);
      console.error('   - Mensaje:', error?.message);
      return false;
    }
  }


  // Registrar nuevo usuario
  async register(email: string, password: string, nombreCompleto: string): Promise<boolean> {
    try {
      const credential = await this.auth.createUserWithEmailAndPassword(email, password);
      if (credential.user) {
        // Crear documento de usuario en Firestore
        const nuevoUsuario: UsuarioGlobal = {
          uid: credential.user.uid,
          email,
          nombre: nombreCompleto, // Cambiar de nombreCompleto a nombre
          emailVerificado: false,
          activo: true,
          idioma: 'es',
          zonaHoraria: 'America/Bogota',
          restaurantePrincipal: '', // Inicializar como string vacío
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        };

        await this.firestore.collection('usuarios').doc(credential.user.uid).set(nuevoUsuario);
        this.currentUser = nuevoUsuario;
        
        this.router.navigate(['/configuracion-inicial']);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    console.log('AuthService: Cerrando sesión');
    
    this.currentUser = null;
    this.currentRestaurant = null;
    
    // Limpiar localStorage
    try {
      localStorage.removeItem('bocket_current_user');
      localStorage.removeItem('bocket_current_restaurant');
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
    }
    
    // Limpiar tema personalizado
    this.limpiarTemaPersonalizado();
    
    // Cerrar sesión de Firebase
    await this.auth.signOut();
    
    console.log('AuthService: Sesión cerrada, redirigiendo a login');
    this.router.navigate(['/login']);
  }

  // Cargar datos completos del usuario usando Firebase SDK nativo
  private async cargarDatosUsuario(uid: string): Promise<void> {
    try {
      console.log('📋 AuthService: Obteniendo documento de usuario para UID:', uid);
      
      // Usar Firebase SDK nativo para evitar problemas de contexto de inyección
      const app = getApp();
      const db = getFirestore(app);
      const userDocRef = doc(db, 'usuarios', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ AuthService: Documento de usuario encontrado:', userData);
        
        // Convertir Timestamps de Firestore a Date si existen
        if (userData['fechaCreacion'] && userData['fechaCreacion'].toDate) {
          userData['fechaCreacion'] = userData['fechaCreacion'].toDate();
        }
        if (userData['ultimoAcceso'] && userData['ultimoAcceso'].toDate) {
          userData['ultimoAcceso'] = userData['ultimoAcceso'].toDate();
        }
        
        this.currentUser = { id: userDoc.id, ...userData } as UsuarioGlobal;
        console.log('✅ AuthService: currentUser asignado:', this.currentUser);
        
        // Actualizar última fecha de acceso
        console.log('🔄 AuthService: Actualizando último acceso...');
        await updateDoc(userDocRef, {
          ultimoAcceso: new Date()
        });
        console.log('✅ AuthService: Último acceso actualizado');
      } else {
        console.log('❌ AuthService: Documento de usuario no existe para UID:', uid);
      }
    } catch (error: any) {
      console.error('❌ AuthService: Error cargando datos del usuario:', error);
      console.error('   - Error code:', error?.code);
      console.error('   - Error message:', error?.message);
    }
  }

  // Obtener permisos del usuario para un restaurante específico
  async obtenerPermisosRestaurante(restauranteId: string): Promise<UsuarioRestaurante | null> {
    if (!this.currentUser) return null;

    try {
      const permisoDoc = await this.firestore
        .collection('usuariosRestaurantes')
        .doc(`${this.currentUser.uid}_${restauranteId}`)
        .get()
        .toPromise();
      
      if (permisoDoc?.exists) {
        const permisoData = permisoDoc.data();
        return { id: permisoDoc.id, ...(permisoData || {}) } as UsuarioRestaurante;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
      return null;
    }
  }

  // Verificar si el usuario tiene acceso a un restaurante
  async tieneAccesoRestaurante(restauranteId: string): Promise<boolean> {
    const permisos = await this.obtenerPermisosRestaurante(restauranteId);
    return permisos !== null && permisos.activo;
  }

  // Obtener restaurantes del usuario
  obtenerRestaurantesUsuario(): string[] {
    return this.currentUser?.restaurantePrincipal ? [this.currentUser.restaurantePrincipal] : [];
  }

  // Verificar si el usuario está autenticado
  estaAutenticado(): boolean {
    console.log('AuthService: Verificando autenticación - currentUser:', this.currentUser);
    return this.currentUser !== null;
  }

  // Obtener usuario actual
  obtenerUsuarioActual(): UsuarioGlobal | null {
    // Si tenemos datos en memoria, usarlos
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // Si no, intentar cargar desde localStorage como respaldo
    try {
      const storedUser = localStorage.getItem('bocket_current_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        console.log('🔄 AuthService: Usuario cargado desde localStorage:', this.currentUser);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Error cargando usuario desde localStorage:', error);
    }
    
    return null;
  }

  // Observable del estado de autenticación
  obtenerEstadoAuth(): Observable<UsuarioGlobal | null> {
    return of(this.currentUser);
  }

  // Obtener restaurante actual
  obtenerRestauranteActual(): any {
    // Si tenemos datos en memoria, usarlos
    if (this.currentRestaurant) {
      return this.currentRestaurant;
    }
    
    // Si no, intentar cargar desde localStorage como respaldo
    try {
      const storedRestaurant = localStorage.getItem('bocket_current_restaurant');
      if (storedRestaurant) {
        this.currentRestaurant = JSON.parse(storedRestaurant);
        console.log('🔄 AuthService: Restaurante cargado desde localStorage:', this.currentRestaurant);
        return this.currentRestaurant;
      }
    } catch (error) {
      console.error('Error cargando restaurante desde localStorage:', error);
    }
    
    console.warn('⚠️ AuthService: No hay restaurante actual disponible');
    return null;
  }

  // Aplicar tema del restaurante
  private aplicarTemaRestaurante(restaurante: any): void {
    console.log('AuthService: Aplicando tema del restaurante:', restaurante);
    const root = document.documentElement;
    
    // Aplicar colores principales usando variables de Ionic
    if (restaurante.colorPrimario) {
      root.style.setProperty('--ion-color-primary', restaurante.colorPrimario);
      root.style.setProperty('--ion-color-primary-rgb', this.hexToRgb(restaurante.colorPrimario));
      root.style.setProperty('--ion-color-primary-contrast', '#ffffff');
      root.style.setProperty('--ion-color-primary-contrast-rgb', '255,255,255');
      root.style.setProperty('--ion-color-primary-shade', this.darkenColor(restaurante.colorPrimario, 20));
      root.style.setProperty('--ion-color-primary-tint', this.lightenColor(restaurante.colorPrimario, 20));
      
      // También mantener variables personalizadas para uso directo
      root.style.setProperty('--bocket-primary-500', restaurante.colorPrimario);
      root.style.setProperty('--bocket-primary-600', this.darkenColor(restaurante.colorPrimario, 10));
      root.style.setProperty('--bocket-primary-400', this.lightenColor(restaurante.colorPrimario, 10));
    }
    
    if (restaurante.colorSecundario) {
      root.style.setProperty('--ion-color-secondary', restaurante.colorSecundario);
      root.style.setProperty('--ion-color-secondary-rgb', this.hexToRgb(restaurante.colorSecundario));
      root.style.setProperty('--ion-color-secondary-contrast', '#ffffff');
      root.style.setProperty('--ion-color-secondary-contrast-rgb', '255,255,255');
      root.style.setProperty('--ion-color-secondary-shade', this.darkenColor(restaurante.colorSecundario, 20));
      root.style.setProperty('--ion-color-secondary-tint', this.lightenColor(restaurante.colorSecundario, 20));
      
      // También mantener variables personalizadas
      root.style.setProperty('--bocket-secondary-500', restaurante.colorSecundario);
      root.style.setProperty('--bocket-secondary-600', this.darkenColor(restaurante.colorSecundario, 10));
      root.style.setProperty('--bocket-secondary-400', this.lightenColor(restaurante.colorSecundario, 10));
    }

    // Actualizar título de la página
    document.title = `${restaurante.nombre} - Panel de Gestión`;
    console.log('AuthService: Tema aplicado. Título de página:', document.title);
  }

  // Limpiar tema personalizado
  private limpiarTemaPersonalizado(): void {
    const root = document.documentElement;
    
    // Limpiar variables de Ionic
    root.style.removeProperty('--ion-color-primary');
    root.style.removeProperty('--ion-color-primary-rgb');
    root.style.removeProperty('--ion-color-primary-contrast');
    root.style.removeProperty('--ion-color-primary-contrast-rgb');
    root.style.removeProperty('--ion-color-primary-shade');
    root.style.removeProperty('--ion-color-primary-tint');
    root.style.removeProperty('--ion-color-secondary');
    root.style.removeProperty('--ion-color-secondary-rgb');
    root.style.removeProperty('--ion-color-secondary-contrast');
    root.style.removeProperty('--ion-color-secondary-contrast-rgb');
    root.style.removeProperty('--ion-color-secondary-shade');
    root.style.removeProperty('--ion-color-secondary-tint');
    
    // Limpiar variables personalizadas
    root.style.removeProperty('--bocket-primary-500');
    root.style.removeProperty('--bocket-primary-600');
    root.style.removeProperty('--bocket-primary-400');
    root.style.removeProperty('--bocket-secondary-500');
    root.style.removeProperty('--bocket-secondary-600');
    root.style.removeProperty('--bocket-secondary-400');
    
    document.title = 'Bocket CRM';
  }

  private darkenColor(color: string, amount: number): string {
    // Implementación básica - convertir hex a RGB y oscurecer
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private lightenColor(color: string, amount: number): string {
    // Implementación básica - convertir hex a RGB y aclarar
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private hexToRgb(color: string): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `${r},${g},${b}`;
  }
}