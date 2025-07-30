import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reserva } from '../modelos/reserva.model';
import { AuthService } from './auth.service';

// Import Firebase SDK nativo para operaciones directas
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

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
    return `restaurantes/${restauranteActual.id}/reservas`;
  }

  // CRUD: Obtener todas las reservas usando Firebase SDK nativo
  async obtenerTodos(): Promise<Reserva[]> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const reservasRef = collection(db, `restaurantes/${restauranteActual.id}/reservas`);
      const snapshot = await getDocs(reservasRef);
      
      const reservas: Reserva[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Convertir Timestamps de Firestore a strings de fecha
        if (data['dateBooking'] && data['dateBooking'].toDate) {
          data['dateBooking'] = data['dateBooking'].toDate().toISOString();
        }
        if (data['reconfirmDate'] && data['reconfirmDate'].toDate) {
          data['reconfirmDate'] = data['reconfirmDate'].toDate().toISOString();
        }
        reservas.push({ id: doc.id, ...data } as Reserva);
      });
      
      return reservas;
    } catch (error) {
      console.error('Error obteniendo reservas:', error);
      return [];
    }
  }

  // CRUD: Obtener reservas como Observable (para tiempo real)
  obtenerTodasObservable(): Observable<Reserva[]> {
    const collectionPath = this.getCollectionPath();
    return this.firestore.collection(collectionPath)
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data } as Reserva;
        }))
      );
  }

  // CRUD: Obtener reserva por ID usando Firebase SDK nativo
  async obtenerPorId(id: string): Promise<Reserva | null> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const reservaDocRef = doc(db, `restaurantes/${restauranteActual.id}/reservas/${id}`);
      const reservaDoc = await getDoc(reservaDocRef);
      
      if (!reservaDoc.exists()) return null;
      
      const data = reservaDoc.data();
      // Convertir Timestamps si existen
      if (data['dateBooking'] && data['dateBooking'].toDate) {
        data['dateBooking'] = data['dateBooking'].toDate().toISOString();
      }
      if (data['reconfirmDate'] && data['reconfirmDate'].toDate) {
        data['reconfirmDate'] = data['reconfirmDate'].toDate().toISOString();
      }
      
      return { id: reservaDoc.id, ...data } as Reserva;
    } catch (error) {
      console.error('Error obteniendo reserva por ID:', error);
      return null;
    }
  }

  // CRUD: Crear nueva reserva usando Firebase SDK nativo
  async crear(reserva: Partial<Reserva>): Promise<Reserva> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const nuevaReserva: Reserva = {
        ...reserva,
        id: this.generarId(),
        contact: reserva.contact || '',
        contactNameBooking: reserva.contactNameBooking || '',
        peopleBooking: reserva.peopleBooking || '',
        finalPeopleBooking: reserva.finalPeopleBooking || 1,
        dateBooking: reserva.dateBooking || new Date().toISOString(),
        statusBooking: reserva.statusBooking || 'pending',
        detailsBooking: reserva.detailsBooking || '',
        reconfirmDate: reserva.reconfirmDate || '',
        reconfirmStatus: reserva.reconfirmStatus || undefined
      };

      // Verificar que el ID fue generado correctamente
      if (!nuevaReserva.id) {
        throw new Error('Error generando ID de reserva');
      }
      
      console.log('🔥 ReservaService.crear - Datos a crear:', {
        restauranteId: restauranteActual.id,
        reservaId: nuevaReserva.id,
        path: `restaurantes/${restauranteActual.id}/reservas/${nuevaReserva.id}`
      });

      const app = getApp();
      const db = getFirestore(app);
      const reservaDocRef = doc(db, `restaurantes/${restauranteActual.id}/reservas/${nuevaReserva.id}`);
      await setDoc(reservaDocRef, nuevaReserva);
      
      console.log('Reserva creada exitosamente:', nuevaReserva);
      return nuevaReserva;
    } catch (error) {
      console.error('Error creando reserva:', error);
      throw error;
    }
  }

  // CRUD: Actualizar reserva existente usando Firebase SDK nativo
  async actualizar(id: string, cambios: Partial<Reserva>): Promise<Reserva> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const reservaDocRef = doc(db, `restaurantes/${restauranteActual.id}/reservas/${id}`);
      
      // Actualizar en Firebase
      await updateDoc(reservaDocRef, {
        ...cambios,
        fechaActualizacion: new Date().toISOString()
      });
      
      // Obtener la reserva actualizada
      const reservaActualizada = await this.obtenerPorId(id);
      if (!reservaActualizada) {
        throw new Error('Error obteniendo reserva actualizada');
      }
      
      console.log('Reserva actualizada exitosamente:', reservaActualizada);
      return reservaActualizada;
    } catch (error) {
      console.error('Error actualizando reserva:', error);
      throw error;
    }
  }

  // CRUD: Eliminar reserva usando Firebase SDK nativo
  async eliminar(id: string): Promise<void> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const reservaDocRef = doc(db, `restaurantes/${restauranteActual.id}/reservas/${id}`);
      await deleteDoc(reservaDocRef);
      
      console.log('Reserva eliminada exitosamente:', id);
    } catch (error) {
      console.error('Error eliminando reserva:', error);
      throw error;
    }
  }

  // Métodos de consulta específicos para reservas
  
  // Obtener reservas por estado
  async obtenerPorEstado(estado: 'pending' | 'accepted' | 'rejected'): Promise<Reserva[]> {
    const collectionPath = this.getCollectionPath();
    const snapshot = await this.firestore.collection(collectionPath, ref => 
      ref.where('statusBooking', '==', estado)
    ).get().toPromise();
    
    if (!snapshot) return [];
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    } as Reserva));
  }

  // Obtener reservas por fecha
  async obtenerPorFecha(fecha: Date): Promise<Reserva[]> {
    try {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      
      const collectionPath = this.getCollectionPath();
      const snapshot = await this.firestore.collection(collectionPath, ref => 
        ref.where('dateBooking', '>=', fechaInicio.toISOString())
           .where('dateBooking', '<=', fechaFin.toISOString())
      ).get().toPromise();
      
      if (!snapshot) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Reserva));
    } catch (error) {
      console.error('Error obteniendo reservas por fecha:', error);
      const todasReservas = await this.obtenerTodos();
      return todasReservas.filter(r => {
        const fechaReserva = new Date(r.dateBooking);
        return fechaReserva.toDateString() === fecha.toDateString();
      });
    }
  }

  // Obtener reservas por contacto WhatsApp
  async obtenerPorContacto(contact: string): Promise<Reserva[]> {
    try {
      const collectionPath = this.getCollectionPath();
      const snapshot = await this.firestore.collection(collectionPath, ref => 
        ref.where('contact', '==', contact)
      ).get().toPromise();
      
      if (!snapshot) return [];
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Reserva));
    } catch (error) {
      console.error('Error obteniendo reservas por contacto:', error);
      const todasReservas = await this.obtenerTodos();
      return todasReservas.filter(r => r.contact === contact);
    }
  }

  // Confirmar reserva
  async confirmarReserva(id: string): Promise<Reserva> {
    return this.actualizar(id, { 
      statusBooking: 'accepted',
      reconfirmDate: new Date().toISOString(),
      reconfirmStatus: 'accepted'
    });
  }

  // Cancelar/Rechazar reserva
  async cancelarReserva(id: string): Promise<Reserva> {
    return this.actualizar(id, { 
      statusBooking: 'rejected',
      reconfirmDate: new Date().toISOString(),
      reconfirmStatus: 'rejected'
    });
  }

  // Obtener estadísticas de reservas
  async obtenerEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    confirmadas: number;
    rechazadas: number;
    hoy: number;
  }> {
    try {
      const todasReservas = await this.obtenerTodos();
      const hoy = new Date();
      
      return {
        total: todasReservas.length,
        pendientes: todasReservas.filter(r => r.statusBooking === 'pending').length,
        confirmadas: todasReservas.filter(r => r.statusBooking === 'accepted').length,
        rechazadas: todasReservas.filter(r => r.statusBooking === 'rejected').length,
        hoy: todasReservas.filter(r => {
          const fechaReserva = new Date(r.dateBooking);
          return fechaReserva.toDateString() === hoy.toDateString();
        }).length
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de reservas:', error);
      return { total: 0, pendientes: 0, confirmadas: 0, rechazadas: 0, hoy: 0 };
    }
  }


  // Generar ID único
  private generarId(): string {
    return 'reserva_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}