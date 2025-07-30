import { Injectable } from '@angular/core';
// Import Firebase SDK nativo para evitar problemas de inyección
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, writeBatch } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// Import AuthService to access working Firestore instance
import { AuthService } from '../servicios/auth.service';

// Interfaces para tipado
interface RestauranteFirestore {
  id: string;
  nombre?: string;
  slug?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  descripcion?: string;
  logo?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  activo?: boolean;
  fechaCreacion?: any;
  fechaActualizacion?: any;
  configuracion?: any;
  [key: string]: any; // Para campos adicionales
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private authService: AuthService
  ) {}

  // RESTAURANTES - Obtener todos los restaurantes
  async obtenerTodosRestaurantes(): Promise<RestauranteFirestore[]> {
    try {
      console.log('🔥 AdminService: Obteniendo todos los restaurantes...');
      
      // Usar Firebase SDK nativo
      const app = getApp();
      const db = getFirestore(app);
      const restaurantesRef = collection(db, 'restaurantes');
      const snapshot = await getDocs(restaurantesRef);
      
      const restaurantes: RestauranteFirestore[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        restaurantes.push({ id: doc.id, ...data } as RestauranteFirestore);
      });
      
      console.log(`✅ AdminService: ${restaurantes.length} restaurantes encontrados`);
      console.log('📋 Restaurantes:', restaurantes.map(r => ({ id: r.id, nombre: r.nombre })));
      return restaurantes;
    } catch (error) {
      console.error('❌ Error obteniendo restaurantes:', error);
      return [];
    }
  }

  // USUARIOS GLOBALES - Obtener todos los usuarios
  async obtenerTodosUsuarios(): Promise<any[]> {
    try {
      console.log('🔥 AdminService: Obteniendo todos los usuarios...');
      
      // Usar Firebase SDK nativo
      const app = getApp();
      const db = getFirestore(app);
      const usuariosRef = collection(db, 'usuarios');
      const snapshot = await getDocs(usuariosRef);
      
      const usuarios: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        usuarios.push({ id: doc.id, ...data });
      });
      
      console.log(`✅ AdminService: ${usuarios.length} usuarios encontrados`);
      return usuarios;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return [];
    }
  }

  // PEDIDOS - Obtener todos los pedidos de todos los restaurantes
  async obtenerTodosPedidos(): Promise<any[]> {
    try {
      console.log('🔥 AdminService: Obteniendo todos los pedidos...');
      
      // Usar Firebase SDK nativo
      const app = getApp();
      const db = getFirestore(app);
      
      // IDs conocidos de restaurantes
      const restaurantesIds = ['rest_donpepe_001', 'rest_marinacafe_002'];
      const todosPedidos: any[] = [];
      
      for (const restauranteId of restaurantesIds) {
        try {
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
        } catch (error) {
          console.error(`❌ Error obteniendo pedidos del restaurante ${restauranteId}:`, error);
        }
      }
      
      console.log(`✅ AdminService: ${todosPedidos.length} pedidos encontrados en total`);
      return todosPedidos;
    } catch (error) {
      console.error('❌ Error obteniendo pedidos:', error);
      return [];
    }
  }

  // CLIENTES - Obtener todos los clientes de todos los restaurantes
  async obtenerTodosClientes(): Promise<any[]> {
    try {
      console.log('🔥 AdminService: Obteniendo todos los clientes...');
      
      // Usar Firebase SDK nativo
      const app = getApp();
      const db = getFirestore(app);
      
      // IDs conocidos de restaurantes
      const restaurantesIds = ['rest_donpepe_001', 'rest_marinacafe_002'];
      const todosClientes: any[] = [];
      
      for (const restauranteId of restaurantesIds) {
        try {
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
        } catch (error) {
          console.error(`❌ Error obteniendo clientes del restaurante ${restauranteId}:`, error);
        }
      }
      
      console.log(`✅ AdminService: ${todosClientes.length} clientes encontrados en total`);
      return todosClientes;
    } catch (error) {
      console.error('❌ Error obteniendo clientes:', error);
      return [];
    }
  }

  // RESERVAS - Obtener todas las reservas de todos los restaurantes
  async obtenerTodasReservas(): Promise<any[]> {
    try {
      console.log('🔥 AdminService: Obteniendo todas las reservas...');
      
      // Usar Firebase SDK nativo
      const app = getApp();
      const db = getFirestore(app);
      
      // IDs conocidos de restaurantes
      const restaurantesIds = ['rest_donpepe_001', 'rest_marinacafe_002'];
      const todasReservas: any[] = [];
      
      for (const restauranteId of restaurantesIds) {
        try {
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
        } catch (error) {
          console.error(`❌ Error obteniendo reservas del restaurante ${restauranteId}:`, error);
        }
      }
      
      console.log(`✅ AdminService: ${todasReservas.length} reservas encontradas en total`);
      return todasReservas;
    } catch (error) {
      console.error('❌ Error obteniendo reservas:', error);
      return [];
    }
  }

  // ESTADÍSTICAS GLOBALES
  async obtenerEstadisticasGlobales(): Promise<any> {
    try {
      console.log('🔥 AdminService: Calculando estadísticas globales...');
      
      const [restaurantes, usuarios, pedidos, clientes, reservas] = await Promise.all([
        this.obtenerTodosRestaurantes(),
        this.obtenerTodosUsuarios(),
        this.obtenerTodosPedidos(),
        this.obtenerTodosClientes(),
        this.obtenerTodasReservas()
      ]);

      const estadisticas = {
        restaurantes: {
          total: restaurantes.length,
          activos: restaurantes.filter(r => r.activo).length,
          inactivos: restaurantes.filter(r => !r.activo).length
        },
        usuarios: {
          total: usuarios.length,
          activos: usuarios.filter(u => u.activo).length,
          ultimaSemana: usuarios.filter(u => {
            if (!u.ultimoAcceso) return false;
            const hace7Dias = new Date();
            hace7Dias.setDate(hace7Dias.getDate() - 7);
            return new Date(u.ultimoAcceso) > hace7Dias;
          }).length
        },
        pedidos: {
          total: pedidos.length,
          pendientes: pedidos.filter(p => p.statusBooking === 'pending').length,
          aceptados: pedidos.filter(p => p.statusBooking === 'accepted').length,
          enProceso: pedidos.filter(p => p.statusBooking === 'inProcess').length,
          entregados: pedidos.filter(p => p.statusBooking === 'deliveried').length,
          porTipo: {
            delivery: pedidos.filter(p => p.orderType === 'delivery').length,
            pickUp: pedidos.filter(p => p.orderType === 'pickUp').length,
            insideOrder: pedidos.filter(p => p.orderType === 'insideOrder').length
          }
        },
        clientes: {
          total: clientes.length,
          porRestaurante: this.agruparPorRestaurante(clientes)
        },
        reservas: {
          total: reservas.length,
          pendientes: reservas.filter(r => r.statusBooking === 'pending').length,
          confirmadas: reservas.filter(r => r.statusBooking === 'accepted').length,
          rechazadas: reservas.filter(r => r.statusBooking === 'rejected').length,
          porRestaurante: this.agruparPorRestaurante(reservas)
        }
      };

      console.log('✅ AdminService: Estadísticas calculadas:', estadisticas);
      return estadisticas;
    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
      return {};
    }
  }

  // BÚSQUEDA GLOBAL
  async buscarEnTodo(termino: string): Promise<any> {
    try {
      console.log(`🔍 AdminService: Buscando "${termino}" en toda la base...`);
      
      const [pedidos, clientes, reservas, usuarios] = await Promise.all([
        this.obtenerTodosPedidos(),
        this.obtenerTodosClientes(),
        this.obtenerTodasReservas(),
        this.obtenerTodosUsuarios()
      ]);

      const terminoLower = termino.toLowerCase();
      
      const resultados = {
        pedidos: pedidos.filter(p => 
          p.contactNameOrder?.toLowerCase().includes(terminoLower) ||
          p.contact?.includes(termino) ||
          p.resumeOrder?.toLowerCase().includes(terminoLower)
        ),
        clientes: clientes.filter(c =>
          c.name?.toLowerCase().includes(terminoLower) ||
          c.email?.toLowerCase().includes(terminoLower) ||
          c.whatsAppName?.toLowerCase().includes(terminoLower)
        ),
        reservas: reservas.filter(r =>
          r.contactNameBooking?.toLowerCase().includes(terminoLower) ||
          r.contact?.includes(termino) ||
          r.detailsBooking?.toLowerCase().includes(terminoLower)
        ),
        usuarios: usuarios.filter(u =>
          u.email?.toLowerCase().includes(terminoLower) ||
          u.nombre?.toLowerCase().includes(terminoLower)
        )
      };

      const totalResultados = resultados.pedidos.length + resultados.clientes.length + 
                             resultados.reservas.length + resultados.usuarios.length;

      console.log(`✅ AdminService: ${totalResultados} resultados encontrados`);
      return resultados;
    } catch (error) {
      console.error('❌ Error en búsqueda global:', error);
      return { pedidos: [], clientes: [], reservas: [], usuarios: [] };
    }
  }

  private agruparPorRestaurante(items: any[]): any {
    const grupos: any = {};
    items.forEach(item => {
      const restauranteId = item.restauranteId;
      if (!grupos[restauranteId]) {
        grupos[restauranteId] = {
          nombre: item.restauranteNombre,
          cantidad: 0
        };
      }
      grupos[restauranteId].cantidad++;
    });
    return grupos;
  }

  // MÉTODOS DE UTILIDAD
  formatearFecha(fecha: any): string {
    if (!fecha) return 'N/A';
    
    if (typeof fecha === 'string') {
      return new Date(fecha).toLocaleString('es-ES');
    }
    
    if (fecha instanceof Date) {
      return fecha.toLocaleString('es-ES');
    }
    
    return 'Fecha inválida';
  }

  truncarTexto(texto: string, longitud: number = 50): string {
    if (!texto) return '';
    return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
  }

  // =====================================================
  // MÉTODOS CRUD PARA RESTAURANTES
  // =====================================================

  // CREAR - Crear nuevo restaurante con usuario Firebase Auth y logo
  async crearRestaurante(restauranteData: any, logoFile?: File): Promise<string> {
    try {
      console.log('🆕 AdminService: Creando nuevo restaurante con usuario...', {
        nombre: restauranteData.nombre,
        email: restauranteData.email,
        slug: restauranteData.slug,
        tienePassword: !!restauranteData.password
      });
      
      // Validar que email y password estén presentes
      if (!restauranteData.email || !restauranteData.password) {
        throw new Error('Email y contraseña son obligatorios para crear el restaurante');
      }

      // Generar ID único para el restaurante
      const restauranteId = `rest_${restauranteData.slug}_${Date.now().toString().slice(-6)}`;
      
      const app = getApp();
      const db = getFirestore(app);
      const auth = getAuth(app);
      
      // PASO 1: Crear usuario en Firebase Auth
      console.log('🔐 Creando usuario en Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, restauranteData.email, restauranteData.password);
      const user = userCredential.user;
      
      // Actualizar perfil del usuario
      await updateProfile(user, {
        displayName: `Admin ${restauranteData.nombre}`
      });
      
      console.log(`✅ Usuario Firebase Auth creado: ${user.uid}`);
      
      // PASO 2: Procesar logo si se proporcionó
      let logoUrl = 'assets/logo.png'; // Logo por defecto
      if (logoFile) {
        console.log('📤 Procesando logo del restaurante...');
        logoUrl = await this.convertirArchivoABase64(logoFile);
        console.log('✅ Logo procesado exitosamente como Base64');
      }
      
      // PASO 3: Crear documento del restaurante
      const nuevoRestaurante = {
        nombre: restauranteData.nombre,
        slug: restauranteData.slug,
        email: restauranteData.email,
        telefono: restauranteData.telefono || '',
        direccion: restauranteData.direccion || '',
        ciudad: restauranteData.ciudad || '',
        descripcion: restauranteData.descripcion || '',
        logo: logoUrl,
        colorPrimario: restauranteData.colorPrimario || '#004aad',
        colorSecundario: restauranteData.colorSecundario || '#d636a0',
        activo: restauranteData.activo !== undefined ? restauranteData.activo : true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        configuracion: {
          userInteractions: {
            whatsappActivo: true,
            whatsappValor: 100,
            whatsappLimite: 500,
            controllerActivo: true,
            controllerValor: 200,
            controllerLimite: 200,
            chatbotActivo: true,
            chatbotValor: 50,
            chatbotLimite: 1000,
            apiActivo: false,
            apiValor: 10,
            apiLimite: 1000,
            campaingActivo: true,
            campaingValor: 300,
            campaingLimite: 100,
            clientActivo: true,
            clientValor: 150,
            clientLimite: 300,
            othersActivo: false,
            othersValor: 50,
            othersLimite: 100,
            wappControllerActivo: true,
            wappControllerValor: 250,
            wappControllerLimite: 150,
            aiActivo: true,
            aiValor: 400,
            aiLimite: 200
          },
          whatsapp: {
            numeroBot: '',
            respuestaAutomatica: true,
            horarioBot: {
              inicio: '08:00',
              fin: '22:00'
            }
          },
          pedidos: {
            tiempoEntrega: 45,
            costoDelivery: 5000,
            montoMinimoDelivery: 25000,
            estadosPermitidos: ['pending', 'accepted', 'rejected', 'inProcess', 'inDelivery', 'deliveried'],
            tiposPermitidos: ['delivery', 'pickUp', 'insideOrder']
          }
        }
      };

      // PASO 3: Crear documento del usuario en Firestore
      const usuarioData = {
        uid: user.uid,
        email: restauranteData.email,
        nombre: `Admin ${restauranteData.nombre}`,
        rol: 'admin',
        activo: true,
        fechaCreacion: new Date(),
        ultimoAcceso: new Date(),
        restaurantePrincipal: restauranteId
      };

      // PASO 4: Crear relación usuario-restaurante
      const usuarioRestauranteData = {
        uid: user.uid,
        restauranteId: restauranteId,
        rol: 'admin',
        permisos: ['leer', 'escribir', 'eliminar', 'administrar'],
        activo: true,
        fechaAsignacion: new Date()
      };

      // PASO 5: Crear categorías por defecto
      const categoriasPorDefecto = [
        { id: 'entradas', nombre: 'Entradas', descripcion: 'Aperitivos y entradas', orden: 1, activa: true },
        { id: 'principales', nombre: 'Platos Principales', descripcion: 'Platos fuertes', orden: 2, activa: true },
        { id: 'bebidas', nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes', orden: 3, activa: true },
        { id: 'postres', nombre: 'Postres', descripcion: 'Dulces y postres', orden: 4, activa: true }
      ];

      // PASO 6: Usar batch para crear todos los documentos de manera atómica
      console.log('📝 Creando documentos en Firestore...');
      const batch = writeBatch(db);

      // Agregar restaurante
      const restauranteRef = doc(db, 'restaurantes', restauranteId);
      batch.set(restauranteRef, nuevoRestaurante);

      // Agregar usuario
      const usuarioRef = doc(db, 'usuarios', user.uid);
      batch.set(usuarioRef, usuarioData);

      // Agregar relación usuario-restaurante
      const usuarioRestauranteId = `${user.uid}_${restauranteId}`;
      const usuarioRestauranteRef = doc(db, 'usuariosRestaurantes', usuarioRestauranteId);
      batch.set(usuarioRestauranteRef, usuarioRestauranteData);

      // Agregar categorías por defecto
      categoriasPorDefecto.forEach(categoria => {
        const categoriaRef = doc(db, 'restaurantes', restauranteId, 'categorias', categoria.id);
        batch.set(categoriaRef, categoria);
      });

      // Ejecutar el batch
      await batch.commit();
      
      console.log(`✅ AdminService: Restaurante completo creado exitosamente!`);
      console.log(`📧 Email: ${restauranteData.email}`);
      console.log(`🔑 Password: ${restauranteData.password}`);
      console.log(`🏪 Restaurante ID: ${restauranteId}`);
      console.log(`👤 Usuario UID: ${user.uid}`);
      console.log(`🔗 URL: /${restauranteData.slug}/dashboard`);
      
      return restauranteId;
    } catch (error) {
      console.error('❌ Error creando restaurante completo:', error);
      
      // Proporcionar mensajes de error más específicos
      if ((error as any)?.code === 'auth/email-already-in-use') {
        throw new Error('El email ya está en uso. Por favor usa otro email.');
      } else if ((error as any)?.code === 'auth/weak-password') {
        throw new Error('La contraseña es muy débil. Debe tener al menos 6 caracteres.');
      } else if ((error as any)?.code === 'auth/invalid-email') {
        throw new Error('El formato del email no es válido.');
      }
      
      throw new Error(`Error al crear restaurante: ${(error as any)?.message || 'Error desconocido'}`);
    }
  }

  // LEER - Obtener restaurante por ID
  async obtenerRestaurantePorId(id: string): Promise<RestauranteFirestore | null> {
    try {
      console.log(`🔍 AdminService: Obteniendo restaurante ${id}...`);
      
      const app = getApp();
      const db = getFirestore(app);
      const restauranteDocRef = doc(db, 'restaurantes', id);
      const docSnap = await getDoc(restauranteDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const restaurante = { id: docSnap.id, ...data } as RestauranteFirestore;
        console.log('✅ AdminService: Restaurante encontrado:', restaurante.nombre);
        return restaurante;
      } else {
        console.log('❌ AdminService: Restaurante no encontrado');
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo restaurante:', error);
      throw new Error(`Error al obtener restaurante: ${(error as any)?.message || 'Error desconocido'}`);
    }
  }

  // ACTUALIZAR - Actualizar restaurante existente
  async actualizarRestaurante(id: string, cambios: any, logoFile?: File): Promise<RestauranteFirestore> {
    try {
      console.log(`📝 AdminService: Actualizando restaurante ${id}...`, cambios);
      
      // Procesar logo si se proporcionó
      if (logoFile) {
        console.log('📤 Procesando nuevo logo del restaurante...');
        cambios.logo = await this.convertirArchivoABase64(logoFile);
        console.log('✅ Logo actualizado exitosamente como Base64');
      }
      
      // Agregar fecha de actualización
      const datosActualizacion = {
        ...cambios,
        fechaActualizacion: new Date()
      };
      
      const app = getApp();
      const db = getFirestore(app);
      const restauranteDocRef = doc(db, 'restaurantes', id);
      await updateDoc(restauranteDocRef, datosActualizacion);
      
      // Obtener el documento actualizado
      const docActualizado = await getDoc(restauranteDocRef);
      const data = docActualizado.data();
      const restauranteActualizado = { id: docActualizado.id, ...data } as RestauranteFirestore;
      
      console.log('✅ AdminService: Restaurante actualizado exitosamente');
      return restauranteActualizado;
    } catch (error) {
      console.error('❌ Error actualizando restaurante:', error);
      throw new Error(`Error al actualizar restaurante: ${(error as any)?.message || 'Error desconocido'}`);
    }
  }

  // ELIMINAR - Eliminar restaurante (soft delete)
  async eliminarRestaurante(id: string, eliminarCompletamente: boolean = false): Promise<boolean> {
    try {
      console.log(`🗑️ AdminService: ${eliminarCompletamente ? 'Eliminando completamente' : 'Desactivando'} restaurante ${id}...`);
      
      const app = getApp();
      const db = getFirestore(app);
      const restauranteDocRef = doc(db, 'restaurantes', id);
      
      if (eliminarCompletamente) {
        // ADVERTENCIA: Eliminación completa - también debería eliminar subcollecciones
        await deleteDoc(restauranteDocRef);
        console.log('✅ AdminService: Restaurante eliminado completamente');
      } else {
        // Soft delete - solo marcar como inactivo
        await updateDoc(restauranteDocRef, {
          activo: false,
          fechaEliminacion: new Date(),
          fechaActualizacion: new Date()
        });
        console.log('✅ AdminService: Restaurante desactivado');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error eliminando restaurante:', error);
      throw new Error(`Error al eliminar restaurante: ${(error as any)?.message || 'Error desconocido'}`);
    }
  }

  // VALIDAR - Validar datos de restaurante
  validarDatosRestaurante(datos: any, esEdicion: boolean = false): { esValido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!datos.nombre || datos.nombre.trim().length < 2) {
      errores.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!datos.slug || !/^[a-z0-9-]+$/.test(datos.slug)) {
      errores.push('El slug solo puede contener letras minúsculas, números y guiones');
    }

    if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      errores.push('El email es obligatorio y debe tener un formato válido');
    }

    // En modo edición, la contraseña es opcional (solo si se quiere cambiar)
    if (!esEdicion) {
      if (!datos.password || datos.password.length < 6) {
        errores.push('La contraseña es obligatoria y debe tener al menos 6 caracteres');
      }
    } else {
      // En modo edición, si se proporciona contraseña, debe ser válida
      if (datos.password && datos.password.length < 6) {
        errores.push('Si proporciona una nueva contraseña, debe tener al menos 6 caracteres');
      }
    }

    if (datos.colorPrimario && !/^#[0-9A-Fa-f]{6}$/.test(datos.colorPrimario)) {
      errores.push('El color primario debe ser un código hexadecimal válido');
    }

    if (datos.colorSecundario && !/^#[0-9A-Fa-f]{6}$/.test(datos.colorSecundario)) {
      errores.push('El color secundario debe ser un código hexadecimal válido');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  // VERIFICAR - Verificar si slug está disponible
  async verificarSlugDisponible(slug: string, restauranteIdExcluir?: string): Promise<boolean> {
    try {
      console.log(`🔍 AdminService: Verificando disponibilidad del slug "${slug}"...`);
      
      const restaurantes = await this.obtenerTodosRestaurantes();
      const slugExiste = restaurantes.some(r => 
        r.slug === slug && r.id !== restauranteIdExcluir
      );
      
      console.log(`${slugExiste ? '❌' : '✅'} Slug "${slug}" ${slugExiste ? 'no disponible' : 'disponible'}`);
      return !slugExiste;
    } catch (error) {
      console.error('❌ Error verificando slug:', error);
      return false;
    }
  }

  // GENERAR - Generar slug automático desde nombre
  generarSlugDesdeNombre(nombre: string): string {
    return nombre
      .toLowerCase()
      .trim()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // =====================================================
  // MÉTODOS PARA MANEJO DE LOGOS
  // =====================================================

  // Nuevo método: Convertir archivo a Base64 para almacenar en Firestore
  async convertirArchivoABase64(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log('✅ Archivo convertido a Base64, tamaño:', result.length);
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error('❌ Error convirtiendo archivo a Base64:', error);
        reject(error);
      };
      reader.readAsDataURL(archivo);
    });
  }

  // Método existente de Firebase Storage (mantenido para compatibilidad)
  async subirLogoRestaurante(archivo: File, restauranteId: string): Promise<string> {
    try {
      console.log('📤 AdminService: Subiendo logo a Firebase Storage...', {
        nombre: archivo.name,
        tamaño: archivo.size,
        tipo: archivo.type,
        restauranteId
      });

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const extension = archivo.name.split('.').pop();
      const nombreArchivo = `logo_${restauranteId}_${timestamp}.${extension}`;

      // Crear referencia en Firebase Storage
      const app = getApp();
      const storage = getStorage(app);
      const logoRef = ref(storage, `restaurantes/${restauranteId}/logos/${nombreArchivo}`);

      // Subir archivo
      console.log('⬆️ Subiendo archivo a Firebase Storage...');
      const snapshot = await uploadBytes(logoRef, archivo);
      console.log('✅ Archivo subido exitosamente');

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🔗 URL de descarga obtenida:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('❌ Error subiendo logo:', error);
      throw new Error(`Error al subir logo: ${(error as any)?.message || 'Error desconocido'}`);
    }
  }

  async eliminarLogoRestaurante(logoUrl: string): Promise<void> {
    try {
      if (!logoUrl || logoUrl.includes('assets/')) {
        // No intentar eliminar logos por defecto
        return;
      }

      console.log('🗑️ AdminService: Eliminando logo anterior...');
      
      const app = getApp();
      const storage = getStorage(app);
      const logoRef = ref(storage, logoUrl);
      
      await deleteObject(logoRef);
      console.log('✅ Logo anterior eliminado');
    } catch (error) {
      console.warn('⚠️ Error eliminando logo anterior (puede que no exista):', error);
      // No lanzar error ya que es posible que el archivo no exista
    }
  }
}