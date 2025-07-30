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

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  // Obtener la ruta de la colección basada en el restaurante actual
  private getCollectionPath(): string {
    const restauranteActual = this.authService.obtenerRestauranteActual();
    if (!restauranteActual?.id) {
      throw new Error('No hay restaurante actual seleccionado');
    }
    return `restaurantes/${restauranteActual.id}/pedidos`;
  }

  // CRUD: Obtener todos los pedidos usando Firebase SDK nativo
  async obtenerTodos(): Promise<Pedido[]> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const pedidosRef = collection(db, `restaurantes/${restauranteActual.id}/pedidos`);
      const snapshot = await getDocs(pedidosRef);
      
      const pedidos: Pedido[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Convertir Timestamps de Firestore a strings de fecha si existen
        if (data['fechaCreacion'] && data['fechaCreacion'].toDate) {
          data['fechaCreacion'] = data['fechaCreacion'].toDate().toISOString();
        }
        if (data['fechaActualizacion'] && data['fechaActualizacion'].toDate) {
          data['fechaActualizacion'] = data['fechaActualizacion'].toDate().toISOString();
        }
        pedidos.push({ id: doc.id, ...data } as Pedido);
      });
      
      return pedidos;
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      return [];
    }
  }

  // CRUD: Obtener pedidos como Observable (para tiempo real)
  obtenerTodosObservable(): Observable<Pedido[]> {
    const collectionPath = this.getCollectionPath();
    return this.firestore.collection(collectionPath)
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data } as Pedido;
        }))
      );
  }

  // CRUD: Obtener pedido por ID usando Firebase SDK nativo
  async obtenerPorId(id: string): Promise<Pedido | null> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const pedidoDocRef = doc(db, `restaurantes/${restauranteActual.id}/pedidos/${id}`);
      const pedidoDoc = await getDoc(pedidoDocRef);
      
      if (!pedidoDoc.exists()) return null;
      
      const data = pedidoDoc.data();
      // Convertir Timestamps si existen
      if (data['fechaCreacion'] && data['fechaCreacion'].toDate) {
        data['fechaCreacion'] = data['fechaCreacion'].toDate().toISOString();
      }
      if (data['fechaActualizacion'] && data['fechaActualizacion'].toDate) {
        data['fechaActualizacion'] = data['fechaActualizacion'].toDate().toISOString();
      }
      
      return { id: pedidoDoc.id, ...data } as Pedido;
    } catch (error) {
      console.error('Error obteniendo pedido por ID:', error);
      return null;
    }
  }

  // CRUD: Crear nuevo pedido usando Firebase SDK nativo
  async crear(pedido: Partial<Pedido>): Promise<Pedido> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const nuevoPedido: Pedido = {
        ...pedido,
        id: this.generarId(),
        contact: pedido.contact || '',
        contactNameOrder: pedido.contactNameOrder || '',
        orderType: pedido.orderType || 'delivery',
        resumeOrder: pedido.resumeOrder || '',
        addressToDelivery: pedido.addressToDelivery || '',
        statusBooking: pedido.statusBooking || 'pending',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      // Verificar que el ID fue generado correctamente
      if (!nuevoPedido.id) {
        throw new Error('Error generando ID de pedido');
      }
      
      console.log('🔥 PedidoService.crear - Datos a crear:', {
        restauranteId: restauranteActual.id,
        pedidoId: nuevoPedido.id,
        path: `restaurantes/${restauranteActual.id}/pedidos/${nuevoPedido.id}`
      });

      const app = getApp();
      const db = getFirestore(app);
      const pedidoDocRef = doc(db, `restaurantes/${restauranteActual.id}/pedidos/${nuevoPedido.id}`);
      await setDoc(pedidoDocRef, nuevoPedido);
      
      console.log('Pedido creado exitosamente:', nuevoPedido);
      return nuevoPedido;
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  }

  // CRUD: Actualizar pedido existente usando Firebase SDK nativo
  async actualizar(id: string, cambios: Partial<Pedido>): Promise<Pedido> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const pedidoDocRef = doc(db, `restaurantes/${restauranteActual.id}/pedidos/${id}`);
      
      // Actualizar en Firebase
      await updateDoc(pedidoDocRef, {
        ...cambios,
        fechaActualizacion: new Date().toISOString()
      });
      
      // Obtener el pedido actualizado
      const pedidoActualizado = await this.obtenerPorId(id);
      if (!pedidoActualizado) {
        throw new Error('Error obteniendo pedido actualizado');
      }
      
      console.log('Pedido actualizado exitosamente:', pedidoActualizado);
      return pedidoActualizado;
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      throw error;
    }
  }

  // CRUD: Eliminar pedido usando Firebase SDK nativo
  async eliminar(id: string): Promise<void> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const pedidoDocRef = doc(db, `restaurantes/${restauranteActual.id}/pedidos/${id}`);
      await deleteDoc(pedidoDocRef);
      
      console.log('Pedido eliminado exitosamente:', id);
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      throw error;
    }
  }

  // Métodos de consulta específicos para pedidos

  // Obtener pedidos por tipo
  async obtenerPorTipo(tipo: 'delivery' | 'pickUp' | 'insideOrder'): Promise<Pedido[]> {
    try {
      const collectionPath = this.getCollectionPath();
      const snapshot = await this.firestore.collection(collectionPath, ref => 
        ref.where('orderType', '==', tipo)
      ).get().toPromise();
      
      if (!snapshot) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Pedido));
    } catch (error) {
      console.error('Error obteniendo pedidos por tipo:', error);
      const todosPedidos = await this.obtenerTodos();
      return todosPedidos.filter(p => p.orderType === tipo);
    }
  }

  // Obtener pedidos por estado
  async obtenerPorEstado(estado: 'pending' | 'accepted' | 'rejected' | 'inProcess' | 'inDelivery' | 'deliveried'): Promise<Pedido[]> {
    try {
      const collectionPath = this.getCollectionPath();
      const snapshot = await this.firestore.collection(collectionPath, ref => 
        ref.where('statusBooking', '==', estado)
      ).get().toPromise();
      
      if (!snapshot) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Pedido));
    } catch (error) {
      console.error('Error obteniendo pedidos por estado:', error);
      const todosPedidos = await this.obtenerTodos();
      return todosPedidos.filter(p => p.statusBooking === estado);
    }
  }

  // Obtener pedidos por contacto WhatsApp
  async obtenerPorContacto(contact: string): Promise<Pedido[]> {
    try {
      const collectionPath = this.getCollectionPath();
      const snapshot = await this.firestore.collection(collectionPath, ref => 
        ref.where('contact', '==', contact)
      ).get().toPromise();
      
      if (!snapshot) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Pedido));
    } catch (error) {
      console.error('Error obteniendo pedidos por contacto:', error);
      const todosPedidos = await this.obtenerTodos();
      return todosPedidos.filter(p => p.contact === contact);
    }
  }

  // Obtener pedidos activos (en proceso o en delivery)
  async obtenerPedidosActivos(): Promise<Pedido[]> {
    try {
      const collectionPath = this.getCollectionPath();
      const snapshot = await this.firestore.collection(collectionPath, ref => 
        ref.where('statusBooking', 'in', ['accepted', 'inProcess', 'inDelivery'])
      ).get().toPromise();
      
      if (!snapshot) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Pedido));
    } catch (error) {
      console.error('Error obteniendo pedidos activos:', error);
      const todosPedidos = await this.obtenerTodos();
      return todosPedidos.filter(p => 
        ['accepted', 'inProcess', 'inDelivery'].includes(p.statusBooking)
      );
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
      const hoy = new Date();
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
      
      const collectionPath = this.getCollectionPath();
      const snapshot = await this.firestore.collection(collectionPath, ref => 
        ref.where('fechaCreacion', '>=', inicioHoy)
           .where('fechaCreacion', '<', finHoy)
      ).get().toPromise();
      
      if (!snapshot) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Pedido));
    } catch (error) {
      console.error('Error obteniendo pedidos de hoy:', error);
      const todosPedidos = await this.obtenerTodos();
      const hoy = new Date().toDateString();
      return todosPedidos.filter(p => {
        // Simular fecha de creación si no existe
        const fechaCreacion = new Date();
        return fechaCreacion.toDateString() === hoy;
      });
    }
  }


  // Generar ID único
  private generarId(): string {
    return 'pedido_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}