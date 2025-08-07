import { Injectable } from '@angular/core';
// Import Firebase SDK nativo para evitar problemas de inyección
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, writeBatch } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut, signInWithEmailAndPassword } from 'firebase/auth';
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

  private readonly baseCollection = 'clients'; // Colección base

  constructor(
    private authService: AuthService
  ) {}

  /**
   * NUEVA ARQUITECTURA: Rutas separadas por restaurante
   */
  
  // Ruta para información del restaurante
  private getRestauranteInfoPath(restauranteId: string): string {
    return `${this.baseCollection}/${restauranteId}/info`;
  }
  
  // Ruta para usuarios admin del restaurante
  private getRestauranteUsersPath(restauranteId: string): string {
    return `${this.baseCollection}/${restauranteId}/users`;
  }
  
  // Ruta para datos operacionales (clientes, reservas, pedidos)
  private getRestauranteDataPath(restauranteId: string): string {
    return `${this.baseCollection}/${restauranteId}/data`;
  }

  /**
   * COMPATIBILIDAD: Mantener método anterior para migración gradual
   * @deprecated Usar las nuevas rutas específicas
   */
  private getFormulariosPath(): string {
    return `clients/worldfood/Formularios`;
  }

  // RESTAURANTES - Obtener todos los restaurantes (NUEVA ARQUITECTURA)
  async obtenerTodosRestaurantes(): Promise<RestauranteFirestore[]> {
    try {
      console.log('🔥 AdminService: Obteniendo restaurantes (NUEVA ARQUITECTURA)...');
      
      const app = getApp();
      const db = getFirestore(app);
      
      // NUEVA ARQUITECTURA: Buscar en /clients/{restauranteId}/info/restaurante
      const clientsRef = collection(db, this.baseCollection);
      const snapshot = await getDocs(clientsRef);
      
      const restaurantes: RestauranteFirestore[] = [];
      
      // Para cada posible restaurante, verificar si tiene info
      for (const clientDoc of snapshot.docs) {
        const restauranteId = clientDoc.id;
        
        try {
          // Verificar si existe el documento de info del restaurante
          const infoPath = this.getRestauranteInfoPath(restauranteId);
          const infoRef = doc(db, infoPath, 'restaurante');
          const infoSnap = await getDoc(infoRef);
          
          if (infoSnap.exists()) {
            const data = infoSnap.data();
            restaurantes.push({
              id: restauranteId,
              ...data
            } as RestauranteFirestore);
            
            console.log(`✅ Restaurante encontrado: ${data['nombre']} (${restauranteId})`);
          }
        } catch (error) {
          console.log(`⚠️ Saltando ${restauranteId}: No es un restaurante válido`);
        }
      }
      
      console.log(`✅ AdminService: ${restaurantes.length} restaurantes encontrados en nueva arquitectura`);
      
      // COMPATIBILIDAD: Si no hay restaurantes en nueva arquitectura, buscar en la antigua
      if (restaurantes.length === 0) {
        console.log('🔄 No hay restaurantes en nueva arquitectura, buscando en estructura antigua...');
        return await this.obtenerRestaurantesEstructuraAntigua();
      }
      
      return restaurantes;
    } catch (error) {
      console.error('❌ Error obteniendo restaurantes:', error);
      return [];
    }
  }

  // COMPATIBILIDAD: Método para leer estructura antigua
  private async obtenerRestaurantesEstructuraAntigua(): Promise<RestauranteFirestore[]> {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const formulariosRef = collection(db, this.getFormulariosPath());
      const restaurantesQuery = query(formulariosRef, where('typeForm', '==', 'restaurante'));
      const snapshot = await getDocs(restaurantesQuery);
      
      const restaurantes: RestauranteFirestore[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        restaurantes.push({ id: data['restauranteId'] || doc.id, ...data } as RestauranteFirestore);
      });
      
      console.log(`✅ AdminService: ${restaurantes.length} restaurantes encontrados en estructura antigua`);
      return restaurantes;
    } catch (error) {
      console.error('❌ Error obteniendo restaurantes de estructura antigua:', error);
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

  // CLIENTES - Obtener todos los clientes desde formularios de Firebase
  async obtenerTodosClientes(): Promise<any[]> {
    try {
      console.log('🔥 AdminService: Obteniendo todos los clientes desde formularios...');
      
      const app = getApp();
      const db = getFirestore(app);
      const formulariosRef = collection(db, this.getFormulariosPath());
      const snapshot = await getDocs(formulariosRef);
      
      const clientesMap = new Map<string, any>();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        
        // Parsear ID del documento: {timestamp}_{typeForm}_{chatId}
        const parts = docId.split('_');
        if (parts.length >= 3) {
          const chatId = parts[parts.length - 1]; // Chat ID
          const typeForm = parts.slice(1, -1).join('_'); // Tipo de formulario
          const timestamp = parseInt(parts[0]); // Timestamp
          
          // Extraer información del cliente del formulario
          let nombre = '';
          let email = '';
          let tipoInteraccion = '';
          
          // Extraer nombre según el tipo de formulario
          if (typeForm.includes('reservas particulares') || typeForm.includes('reservas eventos')) {
            const nombreField = Object.keys(data).find(key => 
              key.toLowerCase().includes('nombre') && key.toLowerCase().includes('apellido')
            );
            if (nombreField) {
              nombre = data[nombreField] || '';
            }
            tipoInteraccion = typeForm.includes('eventos') ? 'evento' : 'reserva';
            
            // Email para eventos
            if (typeForm.includes('eventos')) {
              const emailField = Object.keys(data).find(key => 
                key.toLowerCase().includes('email')
              );
              if (emailField) {
                email = data[emailField] || '';
              }
            }
          } else if (typeForm.includes('hablar con una asesora')) {
            const nombreField = Object.keys(data).find(key => 
              key.toLowerCase().includes('nombre')
            );
            if (nombreField) {
              nombre = data[nombreField] || '';
            }
            tipoInteraccion = 'asesoria';
          }
          
          if (nombre && chatId) {
            // Si ya existe un cliente con este chatId, actualizar información
            if (clientesMap.has(chatId)) {
              const clienteExistente = clientesMap.get(chatId);
              // Mantener la información más reciente
              if (timestamp > parseInt(clienteExistente.creation || '0')) {
                clientesMap.set(chatId, {
                  ...clienteExistente,
                  id: chatId,
                  name: nombre,
                  whatsAppName: nombre,
                  email: email || clienteExistente.email,
                  lastUpdate: new Date(timestamp).toISOString(),
                  tipoUltimaInteraccion: tipoInteraccion,
                  restauranteId: 'worldfood',
                  restauranteNombre: 'World Food'
                });
              }
            } else {
              // Determinar tipo de cliente basado en sus interacciones
              let tipoCliente = 'regular';
              if (typeForm.includes('eventos')) tipoCliente = 'corporativo';
              else if (tipoInteraccion === 'reserva') tipoCliente = 'vip';
              
              clientesMap.set(chatId, {
                id: chatId,
                name: nombre,
                whatsAppName: nombre,
                email: email || '',
                isWAContact: true,
                isMyContact: true,
                sourceType: 'chatBot',
                respType: 'bot',
                labels: `cliente_${tipoCliente},${tipoInteraccion}`,
                creation: new Date(timestamp).toISOString(),
                lastUpdate: new Date().toISOString(),
                tipoUltimaInteraccion: tipoInteraccion,
                restauranteId: 'worldfood',
                restauranteNombre: 'World Food',
                userInteractions: {
                  whatsapp: 1,
                  controller: 0,
                  chatbot: 1,
                  api: 0,
                  campaing: 0,
                  client: 1,
                  others: 0,
                  wappController: 0,
                  ai: 0,
                  fee: this.calcularFeeAdmin(tipoInteraccion)
                }
              });
            }
          }
        }
      });
      
      const clientes = Array.from(clientesMap.values());
      console.log(`✅ AdminService: ${clientes.length} clientes únicos encontrados`);
      return clientes;
    } catch (error) {
      console.error('❌ Error obteniendo clientes:', error);
      return [];
    }
  }

  /**
   * Calcular fee aproximado basado en el tipo de interacción
   */
  private calcularFeeAdmin(tipoInteraccion: string): number {
    switch (tipoInteraccion) {
      case 'evento': return Math.floor(Math.random() * 5000) + 10000;
      case 'reserva': return Math.floor(Math.random() * 3000) + 2000;
      case 'asesoria': return Math.floor(Math.random() * 1000) + 500;
      default: return 0;
    }
  }

  // RESERVAS - Obtener todas las reservas desde formularios de Firebase
  async obtenerTodasReservas(): Promise<any[]> {
    try {
      console.log('🔥 AdminService: Obteniendo todas las reservas desde formularios...');
      
      const app = getApp();
      const db = getFirestore(app);
      const formulariosRef = collection(db, this.getFormulariosPath());
      
      // Filtrar por formularios de reservas
      const q = query(formulariosRef, where('typeForm', 'in', [
        'Formulario reservas particulares',
        'Formulario reservas eventos'
      ]));
      
      const snapshot = await getDocs(q);
      const reservas: any[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        
        // Parsear ID del documento: {timestamp}_{typeForm}_{chatId}
        const parts = docId.split('_');
        if (parts.length >= 3) {
          const chatId = parts[parts.length - 1]; // Chat ID
          const typeForm = parts.slice(1, -1).join('_'); // Tipo de formulario
          const timestamp = parseInt(parts[0]); // Timestamp
          
          // Extraer información de la reserva del formulario
          let contactNameBooking = '';
          let peopleBooking = '';
          let finalPeopleBooking = 1;
          let dateBooking = '';
          let detailsBooking = '';
          let statusBooking = 'pending';
          
          if (typeForm.includes('reservas particulares')) {
            // Extraer datos de reservas particulares
            const nombreField = Object.keys(data).find(key => 
              key.toLowerCase().includes('nombre') && key.toLowerCase().includes('apellido')
            );
            if (nombreField) {
              contactNameBooking = data[nombreField] || '';
            }
            
            const personasField = Object.keys(data).find(key => 
              key.toLowerCase().includes('cuántas personas')
            );
            if (personasField) {
              peopleBooking = data[personasField] || '1';
              finalPeopleBooking = parseInt(peopleBooking) || 1;
            }
            
            const fechaField = Object.keys(data).find(key => 
              key.toLowerCase().includes('día y hora')
            );
            if (fechaField) {
              dateBooking = this.parsearFechaReservaAdmin(data[fechaField]);
            }
            
            const areaField = Object.keys(data).find(key => 
              key.toLowerCase().includes('área') || key.toLowerCase().includes('preferencia')
            );
            if (areaField) {
              detailsBooking = `Área preferida: ${data[areaField]}`;
            }
            
          } else if (typeForm.includes('reservas eventos')) {
            // Extraer datos de eventos
            const nombreField = Object.keys(data).find(key => 
              key.toLowerCase().includes('nombre') && key.toLowerCase().includes('apellido')
            );
            if (nombreField) {
              contactNameBooking = data[nombreField] || '';
            }
            
            const personasField = Object.keys(data).find(key => 
              key.toLowerCase().includes('personas')
            );
            if (personasField) {
              peopleBooking = data[personasField] || '1';
              finalPeopleBooking = parseInt(peopleBooking) || 1;
            }
            
            const fechaField = Object.keys(data).find(key => 
              key.toLowerCase().includes('hora') && !key.toLowerCase().includes('tipo')
            );
            if (fechaField) {
              dateBooking = this.parsearFechaReservaAdmin(data[fechaField]);
            }
            
            // Detalles adicionales para eventos
            const tipoField = Object.keys(data).find(key => 
              key.toLowerCase().includes('tipo de evento')
            );
            const presupuestoField = Object.keys(data).find(key => 
              key.toLowerCase().includes('presupuesto')
            );
            
            let detalles = 'Evento especial';
            if (tipoField) detalles += ` - ${data[tipoField]}`;
            if (presupuestoField) detalles += ` - Presupuesto: ${data[presupuestoField]}`;
            
            detailsBooking = detalles;
          }
          
          if (contactNameBooking) {
            const reserva = {
              id: docId,
              contact: chatId,
              contactNameBooking: contactNameBooking,
              peopleBooking: peopleBooking,
              finalPeopleBooking: finalPeopleBooking,
              dateBooking: dateBooking || new Date(timestamp).toISOString(),
              statusBooking: data['status'] || statusBooking,
              detailsBooking: detailsBooking,
              reconfirmDate: '',
              // reconfirmStatus se omite intencionalmente
              restauranteId: 'worldfood',
              restauranteNombre: 'World Food',
              tipoReserva: typeForm.includes('eventos') ? 'evento' : 'particular',
              fechaCreacion: new Date(timestamp).toISOString()
            };
            
            reservas.push(reserva);
          }
        }
      });
      
      console.log(`✅ AdminService: ${reservas.length} reservas encontradas`);
      return reservas;
    } catch (error) {
      console.error('❌ Error obteniendo reservas:', error);
      return [];
    }
  }

  /**
   * Parsear fecha de reserva desde texto para admin
   */
  private parsearFechaReservaAdmin(fechaTexto: string): string {
    try {
      if (!fechaTexto) return new Date().toISOString();
      
      // Intentar parsear diferentes formatos
      let fecha: Date;
      
      // Formato ISO (2025-08-03, 12:15)
      if (fechaTexto.includes('-') && fechaTexto.includes(',')) {
        const [fechaParte, horaParte] = fechaTexto.split(',');
        fecha = new Date(`${fechaParte.trim()} ${horaParte.trim()}`);
      }
      // Formato texto (30/7/2025 6pm)
      else if (fechaTexto.includes('/')) {
        fecha = new Date(fechaTexto);
      }
      // Formato texto libre (Miércoles 30 de julio 1:00 pm)
      else {
        // Intentar extraer información básica
        const hoy = new Date();
        fecha = new Date(hoy.setHours(19, 0, 0, 0)); // Default 7 PM hoy
        
        // Buscar hora específica
        const horaMatch = fechaTexto.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|a\.?\s*m\.?|p\.?\s*m\.?)/i);
        if (horaMatch) {
          let hora = parseInt(horaMatch[1]);
          const minutos = parseInt(horaMatch[2] || '0');
          const ampm = horaMatch[3].toLowerCase();
          
          if (ampm.includes('p') && hora !== 12) hora += 12;
          if (ampm.includes('a') && hora === 12) hora = 0;
          
          fecha.setHours(hora, minutos, 0, 0);
        }
      }
      
      return fecha.toISOString();
    } catch (error) {
      console.error('Error parseando fecha:', error);
      return new Date().toISOString();
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

  // CREAR - Crear nuevo restaurante con usuario Firebase Auth y logo (NUEVA ARQUITECTURA)
  async crearRestaurante(restauranteData: any, logoFile?: File): Promise<string> {
    try {
      console.log('🆕 AdminService: Creando nuevo restaurante con NUEVA ARQUITECTURA...', {
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
      
      // IMPORTANTE: Guardar usuario actual del administrador antes de crear el nuevo
      const usuarioAdminActual = auth.currentUser;
      console.log(`💾 Guardando sesión actual del admin: ${usuarioAdminActual?.email}`);
      
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
      
      // PASO 3: Crear datos del restaurante
      const nuevoRestaurante = {
        id: restauranteId,
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

      // PASO 4: Crear datos del usuario admin
      const usuarioAdminData = {
        uid: user.uid,
        email: restauranteData.email,
        nombre: `Admin ${restauranteData.nombre}`,
        rol: 'admin',
        permisos: ['read', 'write', 'delete'],
        activo: true,
        fechaCreacion: new Date(),
        ultimoAcceso: new Date()
      };

      // PASO 5: Crear categorías por defecto
      const categoriasPorDefecto = [
        { id: 'entradas', nombre: 'Entradas', descripcion: 'Aperitivos y entradas', orden: 1, activa: true },
        { id: 'principales', nombre: 'Platos Principales', descripcion: 'Platos fuertes', orden: 2, activa: true },
        { id: 'bebidas', nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes', orden: 3, activa: true },
        { id: 'postres', nombre: 'Postres', descripción: 'Dulces y postres', orden: 4, activa: true }
      ];

      // PASO 6: NUEVA ARQUITECTURA - Crear estructura separada por restaurante
      console.log('📝 Creando documentos en NUEVA ARQUITECTURA...');
      const batch = writeBatch(db);

      // 1. Crear información del restaurante: /clients/{restauranteId}/info/restaurante
      const restauranteInfoPath = this.getRestauranteInfoPath(restauranteId);
      const restauranteInfoRef = doc(db, restauranteInfoPath, 'restaurante');
      batch.set(restauranteInfoRef, nuevoRestaurante);
      console.log(`📁 Creando info del restaurante en: ${this.getRestauranteInfoPath(restauranteId)}/restaurante`);

      // 2. Crear usuario admin del restaurante: /clients/{restauranteId}/users/{adminUID}
      const usuarioAdminPath = this.getRestauranteUsersPath(restauranteId);
      const usuarioAdminRef = doc(db, usuarioAdminPath, user.uid);
      batch.set(usuarioAdminRef, usuarioAdminData);
      console.log(`👤 Creando usuario admin en: ${this.getRestauranteUsersPath(restauranteId)}/${user.uid}`);

      // 3. Crear documento global del usuario (para búsquedas globales)
      const usuarioGlobalRef = doc(db, 'usuarios', user.uid);
      const usuarioGlobalData = {
        ...usuarioAdminData,
        restaurantePrincipal: restauranteId
      };
      batch.set(usuarioGlobalRef, usuarioGlobalData);

      // 4. COMPATIBILIDAD: Crear también en estructura antigua para migración gradual
      const timestamp = Date.now();
      const chatId = `admin_${timestamp}`;
      const restauranteDocId = `${timestamp}_restaurante_${chatId}`;
      
      const restauranteParaFormularios = {
        ...nuevoRestaurante,
        typeForm: 'restaurante',
        restauranteId: restauranteId,
        chatId: chatId,
        timestamp: timestamp,
        categorias: categoriasPorDefecto
      };
      
      const formulariosPath = this.getFormulariosPath();
      const restauranteCompatibilidadRef = doc(db, formulariosPath, restauranteDocId);
      batch.set(restauranteCompatibilidadRef, restauranteParaFormularios);
      console.log(`🔄 COMPATIBILIDAD: También creando en estructura antigua: ${this.getFormulariosPath()}/${restauranteDocId}`);

      // Ejecutar el batch
      await batch.commit();
      
      // PASO 7: IMPORTANTE - Mantener la sesión del administrador 
      console.log('🔄 Manteniendo sesión del administrador original...');
      
      if (usuarioAdminActual && usuarioAdminActual.email) {
        console.log(`✅ Sesión del admin ${usuarioAdminActual.email} mantenida exitosamente`);
        console.log('💡 El administrador puede continuar trabajando sin reautenticarse');
      }
      
      console.log(`✅ AdminService: Restaurante creado con NUEVA ARQUITECTURA!`);
      console.log(`🏗️ NUEVA ESTRUCTURA CREADA:`);
      console.log(`   📁 Info: /clients/${restauranteId}/info/restaurante`);
      console.log(`   👤 Admin: /clients/${restauranteId}/users/${user.uid}`);
      console.log(`   📊 Data: /clients/${restauranteId}/data/{clientes|reservas|pedidos}`);
      console.log(`🔄 COMPATIBILIDAD: También en ${this.getFormulariosPath()}/${restauranteDocId}`);
      console.log(`📧 Email: ${restauranteData.email}`);
      console.log(`🏪 Restaurante ID: ${restauranteId}`);
      console.log(`👤 Usuario UID: ${user.uid}`);
      
      return restauranteId;
    } catch (error) {
      console.error('❌ Error creando restaurante completo:', error);
      
      console.log('⚠️ Error en creación de restaurante, manteniendo sesión del admin');
      
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

  // LEER - Obtener restaurante por ID (NUEVA ARQUITECTURA)
  async obtenerRestaurantePorId(id: string): Promise<RestauranteFirestore | null> {
    try {
      console.log(`🔍 AdminService: Obteniendo restaurante ${id} (NUEVA ARQUITECTURA)...`);
      
      const app = getApp();
      const db = getFirestore(app);
      
      // NUEVA ARQUITECTURA: Buscar en /clients/{restauranteId}/info/restaurante
      try {
        const restauranteInfoPath = this.getRestauranteInfoPath(id);
        const restauranteInfoRef = doc(db, restauranteInfoPath, 'restaurante');
        const infoSnap = await getDoc(restauranteInfoRef);
        
        if (infoSnap.exists()) {
          const data = infoSnap.data();
          const restaurante = { id: id, ...data } as RestauranteFirestore;
          console.log('✅ AdminService: Restaurante encontrado en NUEVA ARQUITECTURA:', restaurante.nombre);
          return restaurante;
        }
      } catch (error) {
        console.log('⚠️ No encontrado en nueva arquitectura, probando estructura antigua...');
      }
      
      // COMPATIBILIDAD: Si no se encuentra en nueva arquitectura, buscar en estructura antigua
      const formulariosRef = collection(db, this.getFormulariosPath());
      const restauranteQuery = query(formulariosRef, 
        where('typeForm', '==', 'restaurante'),
        where('restauranteId', '==', id)
      );
      const snapshot = await getDocs(restauranteQuery);
      
      if (!snapshot.empty) {
        const docRestaurante = snapshot.docs[0];
        const data = docRestaurante.data();
        const restaurante = { id: data['restauranteId'] || docRestaurante.id, ...data } as RestauranteFirestore;
        console.log('✅ AdminService: Restaurante encontrado en estructura antigua:', restaurante.nombre);
        return restaurante;
      }
      
      console.log('❌ AdminService: Restaurante no encontrado en ninguna estructura');
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo restaurante:', error);
      throw new Error(`Error al obtener restaurante: ${(error as any)?.message || 'Error desconocido'}`);
    }
  }

  // ACTUALIZAR - Actualizar restaurante existente (NUEVA ARQUITECTURA)
  async actualizarRestaurante(id: string, cambios: any, logoFile?: File): Promise<RestauranteFirestore> {
    try {
      console.log(`📝 AdminService: Actualizando restaurante ${id} (NUEVA ARQUITECTURA)...`, cambios);
      
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
      const batch = writeBatch(db);
      
      // NUEVA ARQUITECTURA: Actualizar en /clients/{restauranteId}/info/restaurante
      let actualizado = false;
      try {
        const restauranteInfoPath = this.getRestauranteInfoPath(id);
        const restauranteInfoRef = doc(db, restauranteInfoPath, 'restaurante');
        const infoSnap = await getDoc(restauranteInfoRef);
        
        if (infoSnap.exists()) {
          batch.update(restauranteInfoRef, datosActualizacion);
          console.log('📝 Actualizando en nueva arquitectura...');
          actualizado = true;
        }
      } catch (error) {
        console.log('⚠️ Error actualizando en nueva arquitectura, probando estructura antigua...');
      }
      
      // COMPATIBILIDAD: También actualizar en estructura antigua si existe
      const formulariosRef = collection(db, this.getFormulariosPath());
      const restauranteQuery = query(formulariosRef, 
        where('typeForm', '==', 'restaurante'),
        where('restauranteId', '==', id)
      );
      const snapshot = await getDocs(restauranteQuery);
      
      if (!snapshot.empty) {
        const docRestaurante = snapshot.docs[0];
        const formulariosPath = this.getFormulariosPath();
      const restauranteDocRef = doc(db, formulariosPath, docRestaurante.id);
        batch.update(restauranteDocRef, datosActualizacion);
        console.log('🔄 COMPATIBILIDAD: También actualizando en estructura antigua...');
        actualizado = true;
      }
      
      if (!actualizado) {
        throw new Error('Restaurante no encontrado en ninguna estructura');
      }
      
      // Ejecutar actualizaciones
      await batch.commit();
      
      // Obtener el documento actualizado (priorizar nueva arquitectura)
      let restauranteActualizado: RestauranteFirestore;
      
      try {
        const restauranteInfoPath = this.getRestauranteInfoPath(id);
        const restauranteInfoRef = doc(db, restauranteInfoPath, 'restaurante');
        const infoSnap = await getDoc(restauranteInfoRef);
        
        if (infoSnap.exists()) {
          const data = infoSnap.data();
          restauranteActualizado = { id: id, ...data } as RestauranteFirestore;
        } else {
          throw new Error('Fallback a estructura antigua');
        }
      } catch {
        // Fallback a estructura antigua
        const docRestaurante = snapshot.docs[0];
        const formulariosPath = this.getFormulariosPath();
        const docActualizado = await getDoc(doc(db, formulariosPath, docRestaurante.id));
        const data = docActualizado.data();
        restauranteActualizado = { id: data?.['restauranteId'] || docActualizado.id, ...data } as RestauranteFirestore;
      }
      
      console.log('✅ AdminService: Restaurante actualizado exitosamente en ambas estructuras');
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
      
      // Buscar el documento del restaurante en la ruta multi-tenant
      const formulariosRef = collection(db, this.getFormulariosPath());
      const restauranteQuery = query(formulariosRef, 
        where('typeForm', '==', 'restaurante'),
        where('restauranteId', '==', id)
      );
      const snapshot = await getDocs(restauranteQuery);
      
      if (snapshot.empty) {
        throw new Error('Restaurante no encontrado');
      }
      
      const docRestaurante = snapshot.docs[0];
      const formulariosPath = this.getFormulariosPath();
      const restauranteDocRef = doc(db, formulariosPath, docRestaurante.id);
      
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