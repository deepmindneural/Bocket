import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { Cliente } from '../modelos';
import { AuthService } from './auth.service';

// Import Firebase SDK nativo para operaciones directas
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  // Métodos usando Firebase SDK nativo para evitar NG0203
  async obtenerTodos(): Promise<Cliente[]> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      // Usar Firebase SDK nativo
      const app = getApp();
      const db = getFirestore(app);
      const clientesRef = collection(db, `restaurantes/${restauranteActual.id}/clientes`);
      const snapshot = await getDocs(clientesRef);
      
      const clientes: Cliente[] = [];
      snapshot.forEach(doc => {
        clientes.push({ id: doc.id, ...doc.data() } as Cliente);
      });
      
      return clientes;
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      return [];
    }
  }


  async obtenerPorId(id: string): Promise<Cliente | null> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const clienteDocRef = doc(db, `restaurantes/${restauranteActual.id}/clientes/${id}`);
      const clienteDoc = await getDoc(clienteDocRef);
      
      if (!clienteDoc.exists()) return null;
      
      const data = clienteDoc.data();
      // Convertir Timestamps si existen
      if (data['creation'] && data['creation'].toDate) {
        data['creation'] = data['creation'].toDate().toISOString();
      }
      if (data['lastUpdate'] && data['lastUpdate'].toDate) {
        data['lastUpdate'] = data['lastUpdate'].toDate().toISOString();
      }
      
      return { id: clienteDoc.id, ...data } as Cliente;
    } catch (error) {
      console.error('Error obteniendo cliente por ID:', error);
      return null;
    }
  }

  async crear(cliente: Partial<Cliente>): Promise<Cliente> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const nuevoCliente: Cliente = {
        ...cliente,
        id: cliente.id || Date.now().toString(),
        name: cliente.name || '',
        whatsAppName: cliente.whatsAppName || cliente.name || '',
        email: cliente.email || '',
        restauranteId: restauranteActual.id,
        isWAContact: cliente.isWAContact ?? true,
        isMyContact: cliente.isMyContact ?? true,
        sourceType: cliente.sourceType || 'manual',
        respType: cliente.respType || 'manual',
        labels: cliente.labels || 'cliente_nuevo',
        creation: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        userInteractions: cliente.userInteractions || {
          whatsapp: 0,
          controller: 0,
          chatbot: 0,
          api: 0,
          campaing: 0,
          client: 0,
          others: 0,
          wappController: 0,
          ai: 0,
          fee: 0
        }
      };
      
      // Verificar que el ID fue generado correctamente
      if (!nuevoCliente.id) {
        throw new Error('Error generando ID de cliente');
      }
      
      // Usar Firebase SDK nativo
      const app = getApp();
      const db = getFirestore(app);
      const clienteDocRef = doc(db, `restaurantes/${restauranteActual.id}/clientes/${nuevoCliente.id}`);
      await setDoc(clienteDocRef, nuevoCliente);
      
      console.log('Cliente creado en Firebase para restaurante:', restauranteActual.nombre, nuevoCliente);
      return nuevoCliente;
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  }

  async actualizar(id: string, cambios: Partial<Cliente>): Promise<Cliente> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const clienteDocRef = doc(db, `restaurantes/${restauranteActual.id}/clientes/${id}`);
      
      // Actualizar en Firebase
      await updateDoc(clienteDocRef, {
        ...cambios,
        lastUpdate: new Date().toISOString()
      });
      
      // Obtener el cliente actualizado
      const clienteActualizado = await this.obtenerPorId(id);
      if (!clienteActualizado) {
        throw new Error('Error obteniendo cliente actualizado');
      }
      
      console.log('Cliente actualizado en Firebase:', clienteActualizado);
      return clienteActualizado;
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      throw error;
    }
  }

  async eliminar(id: string): Promise<void> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const clienteDocRef = doc(db, `restaurantes/${restauranteActual.id}/clientes/${id}`);
      await deleteDoc(clienteDocRef);
      
      console.log('Cliente eliminado de Firebase:', id);
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      throw error;
    }
  }
}