import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pedido } from '../modelos/pedido.model';
import { AuthService } from './auth.service';

// Import Firebase SDK nativo para operaciones directas
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private readonly businessId = 'worldfood'; // ID del negocio estático (para compatibilidad)
  private readonly baseCollection = 'clients'; // Colección base estática
  private readonly formulariosCollection = 'Formularios'; // Colección de formularios estática (para compatibilidad)

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  /**
   * ARQUITECTURA CORRECTA: Ruta para pedidos por nombre de restaurante
   */
  private getPedidosPath(nombreRestaurante: string): string {
    const path = `${this.baseCollection}/${nombreRestaurante}/pedidos`;
    console.log(`📍 PedidoService (ARQUITECTURA CORRECTA): Usando ruta: ${path}`);
    return path;
  }

  /**
   * COMPATIBILIDAD: Obtener la ruta completa para los formularios (arquitectura multi-tenant unificada)
   * @deprecated Usar getPedidosPath en su lugar
   */
  private getFormulariosPath(): string {
    const path = `${this.baseCollection}/${this.businessId}/${this.formulariosCollection}`;
    console.log(`📍 PedidoService (COMPATIBILIDAD): Usando ruta multi-tenant antigua: ${path}`);
    return path;
  }

  /**
   * Obtener el nombre del restaurante actual para la arquitectura correcta
   */
  private getRestauranteActualNombre(): string {
    const restaurante = this.authService.obtenerRestauranteActual();
    if (!restaurante || !restaurante.nombre) {
      console.error('❌ PedidoService: No hay restaurante seleccionado o nombre de restaurante inválido');
      throw new Error('No hay restaurante seleccionado. Por favor, inicia sesión nuevamente.');
    }
    console.log(`🏪 PedidoService: Restaurante actual nombre: ${restaurante.nombre}`);
    return restaurante.nombre;
  }

  /**
   * Obtener el ID del restaurante actual para compatibilidad
   */
  private getRestauranteActualId(): string {
    const restaurante = this.authService.obtenerRestauranteActual();
    if (!restaurante || !restaurante.id) {
      console.error('❌ PedidoService: No hay restaurante seleccionado o ID de restaurante inválido');
      throw new Error('No hay restaurante seleccionado. Por favor, inicia sesión nuevamente.');
    }
    console.log(`🏪 PedidoService: Restaurante actual ID: ${restaurante.id}`);
    return restaurante.id;
  }

  /**
   * Obtener todos los pedidos (NUEVA ARQUITECTURA)
   * Los pedidos se almacenan en /clients/{restauranteId}/data/pedidos/
   */
  async obtenerTodos(): Promise<Pedido[]> {
    try {
      console.log('🔥 PedidoService.obtenerTodos() - Obteniendo pedidos con ARQUITECTURA CORRECTA...');
      
      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      const app = getApp();
      const db = getFirestore(app);
      
      // ARQUITECTURA CORRECTA: Obtener pedidos de /clients/{nombreRestaurante}/Formularios/pedidos/
      console.log(`📍 Consultando ARQUITECTURA CORRECTA: ${this.getPedidosPath(nombreRestaurante)}`);
      
      let pedidos: Pedido[] = [];
      
      try {
        const pedidosRef = collection(db, this.getPedidosPath(nombreRestaurante));
        const snapshot = await getDocs(pedidosRef);
        
        console.log(`📊 ARQUITECTURA CORRECTA - Documentos encontrados: ${snapshot.size}`);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          const pedido = this.mapearDocumentoAPedido(doc.id, data);
          if (pedido) {
            pedidos.push(pedido);
            console.log(`✅ Pedido de arquitectura correcta: ${pedido.contactNameOrder} (${pedido.id})`);
          }
        });
        
        if (pedidos.length > 0) {
          console.log(`✅ PedidoService: ${pedidos.length} pedidos encontrados en ARQUITECTURA CORRECTA`);
          return pedidos;
        }
      } catch (error) {
        console.log(`⚠️ No hay datos en arquitectura correcta, consultando estructura antigua...`);
      }
      
      // COMPATIBILIDAD: Si no hay datos en nueva arquitectura, consultar estructura antigua
      console.log(`📍 Consultando COMPATIBILIDAD: ${this.getFormulariosPath()}`);
      
      const formulariosRef = collection(db, this.getFormulariosPath());
      
      // Buscar formularios de pedidos del restaurante actual (si existen)
      const q = query(formulariosRef, 
        where('restauranteId', '==', restauranteId),
        where('typeForm', 'in', [
          'Formulario pedidos',
          'Formulario delivery',
          'Formulario takeaway'
        ])
      );
      
      console.log(`📡 Realizando consulta de compatibilidad para restaurante: ${restauranteId}...`);
      const snapshot = await getDocs(q);
      
      // Si no hay formularios de pedidos, devolver lista vacía 
      if (snapshot.empty) {
        console.log('📝 No se encontraron formularios de pedidos para este restaurante');
        console.log('💡 Para ver pedidos, crea algunos usando la función "Crear Pedido" en la interfaz');
        return [];
      }
      
      // Procesar formularios de pedidos existentes
      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        
        // Parsear ID del documento: {timestamp}_{typeForm}_{chatId}
        const parts = docId.split('_');
        if (parts.length >= 3) {
          const chatId = parts[parts.length - 1]; // Chat ID
          const typeForm = parts.slice(1, -1).join('_'); // Tipo de formulario
          const timestamp = parseInt(parts[0]); // Timestamp
          
          // Extraer información del pedido del formulario
          const pedidoInfo = this.extraerInfoPedido(data, typeForm, chatId, timestamp, docId);
          
          if (pedidoInfo) {
            pedidos.push(pedidoInfo);
            console.log(`✅ Pedido de compatibilidad: ${pedidoInfo.contactNameOrder} (${pedidoInfo.id})`);
          }
        }
      });
      
      console.log(`✅ PedidoService.obtenerTodos() - ${pedidos.length} pedidos encontrados`);
      return pedidos;
    } catch (error) {
      console.error('❌ Error obteniendo pedidos:', error);
      // En caso de error, devolver lista vacía
      return [];
    }
  }

  // Método eliminado: generarPedidosEjemplo
  // Ya no se generan pedidos ficticios para evitar errores al intentar actualizarlos

  /**
   * NUEVA ARQUITECTURA: Mapear documento de pedido a objeto Pedido
   */
  private mapearDocumentoAPedido(docId: string, data: any): Pedido | null {
    try {
      return {
        id: data.id || docId,
        contact: data.contact || '',
        contactNameOrder: data.contactNameOrder || '',
        orderType: data.orderType || 'delivery',
        resumeOrder: data.resumeOrder || '',
        addressToDelivery: data.addressToDelivery || '',
        statusBooking: data.statusBooking || 'pending',
        fechaCreacion: data.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: data.fechaActualizacion || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error mapeando documento de pedido:', error);
      return null;
    }
  }

  /**
   * COMPATIBILIDAD: Extraer información del pedido desde los datos del formulario
   */
  private extraerInfoPedido(data: any, typeForm: string, chatId: string, timestamp: number, docId: string): Pedido | null {
    try {
      let contactNameOrder = '';
      let resumeOrder = '';
      let orderType: 'delivery' | 'pickUp' | 'insideOrder' = 'delivery';
      let addressToDelivery = '';
      let statusBooking: 'pending' | 'accepted' | 'rejected' | 'inProcess' | 'inDelivery' | 'deliveried' = 'pending';
      
      // Extraer información según el tipo de formulario
      if (typeForm.includes('pedidos') || typeForm.includes('delivery') || typeForm.includes('takeaway')) {
        // Buscar nombre del cliente
        const nombreField = Object.keys(data).find(key => 
          key.toLowerCase().includes('nombre')
        );
        if (nombreField) {
          contactNameOrder = data[nombreField] || '';
        }
        
        // Buscar detalles del pedido
        const pedidoField = Object.keys(data).find(key => 
          key.toLowerCase().includes('pedido') || key.toLowerCase().includes('orden')
        );
        if (pedidoField) {
          resumeOrder = data[pedidoField] || '';
        }
        
        // Determinar tipo de pedido
        if (typeForm.includes('delivery')) {
          orderType = 'delivery';
          
          // Buscar dirección
          const direccionField = Object.keys(data).find(key => 
            key.toLowerCase().includes('dirección') || key.toLowerCase().includes('direccion')
          );
          if (direccionField) {
            addressToDelivery = data[direccionField] || '';
          }
        } else if (typeForm.includes('takeaway')) {
          orderType = 'pickUp';
        } else {
          orderType = 'insideOrder';
        }
      }
      
      // Leer el estado actual del pedido desde el documento
      if (data['status']) {
        statusBooking = data['status'];
        console.log(`📊 Estado del pedido leído desde Firebase: ${statusBooking}`);
      } else {
        console.log(`⚠️ No se encontró campo 'status' en pedido, usando estado por defecto: ${statusBooking}`);
      }
      
      if (!contactNameOrder && !resumeOrder) return null;
      
      const pedido: Pedido = {
        id: docId,
        contact: chatId,
        contactNameOrder: contactNameOrder,
        orderType: orderType,
        resumeOrder: resumeOrder || 'Pedido personalizado',
        addressToDelivery: addressToDelivery,
        statusBooking: statusBooking,
        fechaCreacion: new Date(timestamp).toISOString(),
        fechaActualizacion: new Date().toISOString()
      };
      
      return pedido;
    } catch (error) {
      console.error('Error extrayendo info del pedido:', error);
      return null;
    }
  }

  // CRUD: Obtener pedidos como Observable (para tiempo real)
  obtenerTodosObservable(): Observable<Pedido[]> {
    // Para la nueva arquitectura, convertir el método async a Observable
    return from(this.obtenerTodos());
  }

  // CRUD: Obtener pedido por ID (NUEVA ARQUITECTURA)
  async obtenerPorId(id: string): Promise<Pedido | null> {
    try {
      console.log(`🔍 PedidoService.obtenerPorId() - Buscando pedido: ${id}`);
      
      const nombreRestaurante = this.getRestauranteActualNombre();
      const app = getApp();
      const db = getFirestore(app);
      
      // ARQUITECTURA CORRECTA: Buscar directamente en /clients/{nombreRestaurante}/Formularios/pedidos/
      try {
        const pedidosPath = this.getPedidosPath(nombreRestaurante);
        const pedidoDocRef = doc(db, pedidosPath, id);
        const docSnap = await getDoc(pedidoDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const pedido = this.mapearDocumentoAPedido(id, data);
          if (pedido) {
            console.log(`✅ Pedido encontrado en ARQUITECTURA CORRECTA: ${pedido.contactNameOrder}`);
            return pedido;
          }
        }
      } catch (error) {
        console.log(`⚠️ No encontrado en arquitectura correcta, buscando en compatibilidad...`);
      }
      
      // COMPATIBILIDAD: Buscar en la colección de formularios
      const formulariosPath = this.getFormulariosPath();
      const pedidoDocRef = doc(db, formulariosPath, id);
      const pedidoDoc = await getDoc(pedidoDocRef);
      
      if (!pedidoDoc.exists()) {
        console.log(`❌ Pedido no encontrado en ninguna estructura: ${id}`);
        return null;
      }
      
      const data = pedidoDoc.data();
      const docId = pedidoDoc.id;
      
      console.log(`📄 COMPATIBILIDAD - Documento encontrado: ${docId}`);
      
      // Parsear ID del documento para extraer información
      const parts = docId.split('_');
      if (parts.length >= 3) {
        const chatId = parts[parts.length - 1];
        const typeForm = parts.slice(1, -1).join('_');
        const timestamp = parseInt(parts[0]);
        
        // Extraer información del pedido del formulario
        const pedidoInfo = this.extraerInfoPedido(data, typeForm, chatId, timestamp, docId);
        
        if (pedidoInfo) {
          console.log(`✅ Pedido extraído de compatibilidad: ${pedidoInfo.contactNameOrder}`);
          return pedidoInfo;
        }
      }
      
      console.log(`❌ No se pudo extraer información del pedido del documento`);
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo pedido por ID:', error);
      return null;
    }
  }

  /**
   * Crear nuevo pedido (NUEVA ARQUITECTURA)
   * Se almacena directamente en /clients/{restauranteId}/data/pedidos/
   */
  async crear(pedido: Partial<Pedido>): Promise<Pedido> {
    try {
      console.log('🔥 PedidoService.crear() - Creando pedido con ARQUITECTURA CORRECTA...');

      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      const nuevoPedido: Pedido = {
        ...pedido,
        id: this.generarId(),
        contact: pedido.contact || Date.now().toString(),
        contactNameOrder: pedido.contactNameOrder || '',
        orderType: pedido.orderType || 'delivery',
        resumeOrder: pedido.resumeOrder || '',
        addressToDelivery: pedido.addressToDelivery || '',
        statusBooking: pedido.statusBooking || 'pending',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      const app = getApp();
      const db = getFirestore(app);
      
      // ARQUITECTURA CORRECTA: Guardar en /clients/{nombreRestaurante}/Formularios/pedidos/
      const pedidosPath = this.getPedidosPath(nombreRestaurante);
      const pedidoDocRef = doc(db, pedidosPath, nuevoPedido.id);
      
      console.log(`📍 ARQUITECTURA CORRECTA - Guardando en: ${this.getPedidosPath(nombreRestaurante)}/${nuevoPedido.id}`);
      await setDoc(pedidoDocRef, nuevoPedido);
      
      // COMPATIBILIDAD: También crear en estructura antigua para migración gradual
      const timestamp = Date.now();
      const docIdCompatibilidad = `${timestamp}_Formulario pedidos_${nuevoPedido.contact}`;
      
      const datosFormularioCompatibilidad = {
        'Por favor escribe tu nombre': nuevoPedido.contactNameOrder,
        'Describe tu pedido': nuevoPedido.resumeOrder,
        'Tipo de pedido': this.obtenerEtiquetaTipoPedido(nuevoPedido.orderType),
        'Dirección de entrega': nuevoPedido.addressToDelivery || 'No aplica',
        typeForm: 'Formulario pedidos',
        restauranteId: restauranteId,
        chatId: nuevoPedido.contact,
        timestamp: timestamp,
        createdAt: new Date().toISOString(),
        source: 'manual_creation',
        status: nuevoPedido.statusBooking,
        orderType: nuevoPedido.orderType
      };

      const formulariosPath = this.getFormulariosPath();
      const pedidoCompatibilidadRef = doc(db, formulariosPath, docIdCompatibilidad);
      await setDoc(pedidoCompatibilidadRef, datosFormularioCompatibilidad);
      
      console.log('✅ Pedido creado exitosamente en AMBAS ESTRUCTURAS');
      console.log(`   🏗️ ARQUITECTURA CORRECTA: ${this.getPedidosPath(nombreRestaurante)}/${nuevoPedido.id}`);
      console.log(`   🔄 COMPATIBILIDAD: ${this.getFormulariosPath()}/${docIdCompatibilidad}`);
      console.log(`   👤 Contacto: ${nuevoPedido.contactNameOrder}`);
      
      return nuevoPedido;
    } catch (error) {
      console.error('❌ Error creando pedido:', error);
      throw error;
    }
  }

  /**
   * Obtener etiqueta legible para el tipo de pedido
   */
  private obtenerEtiquetaTipoPedido(tipo: 'delivery' | 'pickUp' | 'insideOrder'): string {
    const etiquetas = {
      'delivery': 'Entrega a domicilio',
      'pickUp': 'Recoger en tienda',
      'insideOrder': 'Consumo en local'
    };
    return etiquetas[tipo] || tipo;
  }

  /**
   * Actualizar pedido existente (ARQUITECTURA CORRECTA)
   */
  async actualizar(id: string, cambios: Partial<Pedido>): Promise<Pedido> {
    try {
      console.log('🔥 PedidoService.actualizar() - Actualizando pedido con ARQUITECTURA CORRECTA:', id);

      const nombreRestaurante = this.getRestauranteActualNombre();
      const app = getApp();
      const db = getFirestore(app);
      
      // Obtener pedido actual
      const pedidoActual = await this.obtenerPorId(id);
      if (!pedidoActual) {
        throw new Error(`No se encontró pedido con ID: ${id}`);
      }
      
      // Crear pedido actualizado
      const pedidoActualizado: Pedido = {
        ...pedidoActual,
        ...cambios,
        fechaActualizacion: new Date().toISOString(),
        id: id // Mantener el ID original
      };
      
      let actualizado = false;
      
      // ARQUITECTURA CORRECTA: Actualizar en /clients/{nombreRestaurante}/Formularios/pedidos/
      try {
        const pedidosPath = this.getPedidosPath(nombreRestaurante);
        const pedidoDocRef = doc(db, pedidosPath, id);
        const docSnap = await getDoc(pedidoDocRef);
        
        if (docSnap.exists()) {
          await setDoc(pedidoDocRef, pedidoActualizado);
          console.log(`✅ Pedido actualizado en ARQUITECTURA CORRECTA`);
          actualizado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error actualizando en arquitectura correcta:`, error);
      }
      
      // COMPATIBILIDAD: Actualizar también en estructura antigua si existe
      try {
        const formulariosPath = this.getFormulariosPath();
        const pedidoCompatibilidadRef = doc(db, formulariosPath, id);
        const docSnap = await getDoc(pedidoCompatibilidadRef);
        
        if (docSnap.exists()) {
          console.log('🔄 COMPATIBILIDAD - Actualizando estructura antigua...');
          
          const datosActuales = docSnap.data();
          const datosActualizados: any = {
            lastUpdate: new Date().toISOString()
          };

          // Actualizar campos específicos
          if (cambios.contactNameOrder) {
            const nombreField = Object.keys(datosActuales).find(key => 
              key.toLowerCase().includes('nombre')
            );
            if (nombreField) {
              datosActualizados[nombreField] = cambios.contactNameOrder;
            }
          }

          if (cambios.resumeOrder) {
            const pedidoField = Object.keys(datosActuales).find(key => 
              key.toLowerCase().includes('pedido') || key.toLowerCase().includes('describe')
            );
            if (pedidoField) {
              datosActualizados[pedidoField] = cambios.resumeOrder;
            }
          }

          if (cambios.orderType) {
            const tipoField = Object.keys(datosActuales).find(key => 
              key.toLowerCase().includes('tipo')
            );
            if (tipoField) {
              datosActualizados[tipoField] = this.obtenerEtiquetaTipoPedido(cambios.orderType);
            }
            datosActualizados.orderType = cambios.orderType;
          }

          if (cambios.addressToDelivery) {
            const direccionField = Object.keys(datosActuales).find(key => 
              key.toLowerCase().includes('dirección') || key.toLowerCase().includes('entrega')
            );
            if (direccionField) {
              datosActualizados[direccionField] = cambios.addressToDelivery;
            }
          }

          if (cambios.statusBooking) {
            console.log(`📝 Actualizando estado del pedido a: ${cambios.statusBooking}`);
            datosActualizados.status = cambios.statusBooking;
          }

          await updateDoc(pedidoCompatibilidadRef, datosActualizados);
          console.log(`✅ COMPATIBILIDAD - Pedido actualizado en estructura antigua`);
          actualizado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error actualizando compatibilidad:`, error);
      }
      
      if (!actualizado) {
        throw new Error('No se pudo actualizar el pedido en ninguna estructura');
      }
      
      console.log('✅ Pedido actualizado exitosamente en todas las estructuras disponibles');
      return pedidoActualizado;
    } catch (error) {
      console.error('❌ Error actualizando pedido:', error);
      throw error;
    }
  }

  /**
   * Eliminar pedido (ARQUITECTURA CORRECTA)
   */
  async eliminar(id: string): Promise<void> {
    try {
      console.log('🔥 PedidoService.eliminar() - Eliminando pedido con ARQUITECTURA CORRECTA:', id);

      const nombreRestaurante = this.getRestauranteActualNombre();
      const app = getApp();
      const db = getFirestore(app);
      
      let eliminado = false;
      
      // ARQUITECTURA CORRECTA: Eliminar de /clients/{nombreRestaurante}/Formularios/pedidos/
      try {
        const pedidosPath = this.getPedidosPath(nombreRestaurante);
        const pedidoDocRef = doc(db, pedidosPath, id);
        const docSnap = await getDoc(pedidoDocRef);
        
        if (docSnap.exists()) {
          await deleteDoc(pedidoDocRef);
          console.log(`✅ Pedido eliminado de ARQUITECTURA CORRECTA`);
          eliminado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error eliminando de arquitectura correcta:`, error);
      }
      
      // COMPATIBILIDAD: Eliminar también de estructura antigua
      try {
        const formulariosPath = this.getFormulariosPath();
        const pedidoCompatibilidadRef = doc(db, formulariosPath, id);
        const docSnap = await getDoc(pedidoCompatibilidadRef);
        
        if (docSnap.exists()) {
          await deleteDoc(pedidoCompatibilidadRef);
          console.log(`✅ COMPATIBILIDAD - Pedido eliminado de estructura antigua`);
          eliminado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error eliminando compatibilidad:`, error);
      }
      
      if (!eliminado) {
        throw new Error(`No se encontró pedido para eliminar con ID: ${id}`);
      }
      
      console.log(`✅ Pedido eliminado completamente de todas las estructuras: ${id}`);
    } catch (error) {
      console.error('❌ Error eliminando pedido:', error);
      throw error;
    }
  }

  // Métodos de consulta específicos para pedidos

  // Obtener pedidos por tipo
  async obtenerPorTipo(tipo: 'delivery' | 'pickUp' | 'insideOrder'): Promise<Pedido[]> {
    try {
      const todosPedidos = await this.obtenerTodos();
      return todosPedidos.filter(p => p.orderType === tipo);
    } catch (error) {
      console.error('Error obteniendo pedidos por tipo:', error);
      return [];
    }
  }

  // Obtener pedidos por estado
  async obtenerPorEstado(estado: 'pending' | 'accepted' | 'rejected' | 'inProcess' | 'inDelivery' | 'deliveried'): Promise<Pedido[]> {
    try {
      const todosPedidos = await this.obtenerTodos();
      return todosPedidos.filter(p => p.statusBooking === estado);
    } catch (error) {
      console.error('Error obteniendo pedidos por estado:', error);
      return [];
    }
  }

  // Obtener pedidos por contacto WhatsApp
  async obtenerPorContacto(contact: string): Promise<Pedido[]> {
    try {
      const todosPedidos = await this.obtenerTodos();
      return todosPedidos.filter(p => p.contact === contact);
    } catch (error) {
      console.error('Error obteniendo pedidos por contacto:', error);
      return [];
    }
  }

  // Obtener pedidos activos (en proceso o en delivery)
  async obtenerPedidosActivos(): Promise<Pedido[]> {
    try {
      const todosPedidos = await this.obtenerTodos();
      return todosPedidos.filter(p => 
        ['accepted', 'inProcess', 'inDelivery'].includes(p.statusBooking)
      );
    } catch (error) {
      console.error('Error obteniendo pedidos activos:', error);
      return [];
    }
  }

  // Métodos de cambio de estado específicos

  // Aceptar pedido
  async aceptarPedido(id: string): Promise<Pedido> {
    return this.actualizar(id, { statusBooking: 'accepted' });
  }

  // Rechazar pedido
  async rechazarPedido(id: string): Promise<Pedido> {
    return this.actualizar(id, { statusBooking: 'rejected' });
  }

  // Marcar pedido como en proceso
  async marcarEnProceso(id: string): Promise<Pedido> {
    return this.actualizar(id, { statusBooking: 'inProcess' });
  }

  // Marcar pedido como en delivery
  async marcarEnDelivery(id: string): Promise<Pedido> {
    return this.actualizar(id, { statusBooking: 'inDelivery' });
  }

  // Marcar pedido como entregado
  async marcarEntregado(id: string): Promise<Pedido> {
    return this.actualizar(id, { statusBooking: 'deliveried' });
  }

  // Buscar pedidos por texto (en el resumen del pedido)
  async buscarPorTexto(texto: string): Promise<Pedido[]> {
    try {
      const todosPedidos = await this.obtenerTodos();
      const textoBusqueda = texto.toLowerCase();
      
      return todosPedidos.filter(pedido => 
        pedido.resumeOrder.toLowerCase().includes(textoBusqueda) ||
        pedido.contactNameOrder?.toLowerCase().includes(textoBusqueda) ||
        pedido.contact.includes(texto)
      );
    } catch (error) {
      console.error('Error buscando pedidos por texto:', error);
      return [];
    }
  }

  // Obtener estadísticas de pedidos
  async obtenerEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    aceptados: number;
    enProceso: number;
    enDelivery: number;
    entregados: number;
    rechazados: number;
    porTipo: {
      delivery: number;
      pickUp: number;
      insideOrder: number;
    };
  }> {
    try {
      const todosPedidos = await this.obtenerTodos();
      
      return {
        total: todosPedidos.length,
        pendientes: todosPedidos.filter(p => p.statusBooking === 'pending').length,
        aceptados: todosPedidos.filter(p => p.statusBooking === 'accepted').length,
        enProceso: todosPedidos.filter(p => p.statusBooking === 'inProcess').length,
        enDelivery: todosPedidos.filter(p => p.statusBooking === 'inDelivery').length,
        entregados: todosPedidos.filter(p => p.statusBooking === 'deliveried').length,
        rechazados: todosPedidos.filter(p => p.statusBooking === 'rejected').length,
        porTipo: {
          delivery: todosPedidos.filter(p => p.orderType === 'delivery').length,
          pickUp: todosPedidos.filter(p => p.orderType === 'pickUp').length,
          insideOrder: todosPedidos.filter(p => p.orderType === 'insideOrder').length
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de pedidos:', error);
      return {
        total: 0,
        pendientes: 0,
        aceptados: 0,
        enProceso: 0,
        enDelivery: 0,
        entregados: 0,
        rechazados: 0,
        porTipo: { delivery: 0, pickUp: 0, insideOrder: 0 }
      };
    }
  }

  // Obtener pedidos de hoy
  async obtenerPedidosHoy(): Promise<Pedido[]> {
    try {
      const todosPedidos = await this.obtenerTodos();
      const hoy = new Date().toDateString();
      return todosPedidos.filter(p => {
        if (!p.fechaCreacion) return false;
        const fechaCreacion = new Date(p.fechaCreacion);
        return fechaCreacion.toDateString() === hoy;
      });
    } catch (error) {
      console.error('Error obteniendo pedidos de hoy:', error);
      return [];
    }
  }


  // Generar ID único
  private generarId(): string {
    return 'pedido_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}