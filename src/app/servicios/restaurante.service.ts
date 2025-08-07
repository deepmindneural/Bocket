import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Restaurante } from '../modelos';

// Import Firebase SDK nativo para operaciones directas
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {

  constructor(private firestore: AngularFirestore) {}

  // Obtener restaurante por ID usando Firebase SDK nativo (ARQUITECTURA CORRECTA)
  async obtenerPorId(id: string): Promise<Restaurante | null> {
    try {
      const app = getApp();
      const db = getFirestore(app);
      
      // ARQUITECTURA CORRECTA: Buscar en adminUsers primero para obtener el nombre
      const adminDocRef = doc(db, 'adminUsers', id);
      const adminDoc = await getDoc(adminDocRef);
      
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const nombreRestaurante = adminData['restauranteAsignado'];
        
        // Buscar información del restaurante por nombre
        const restauranteDocRef = doc(db, `clients/${nombreRestaurante}/info`, 'restaurante');
        const restauranteDoc = await getDoc(restauranteDocRef);
        
        if (restauranteDoc.exists()) {
          const data = restauranteDoc.data();
          // Convertir Timestamps si existen
          if (data['fechaCreacion'] && data['fechaCreacion'].toDate) {
            data['fechaCreacion'] = data['fechaCreacion'].toDate();
          }
          if (data['fechaActualizacion'] && data['fechaActualizacion'].toDate) {
            data['fechaActualizacion'] = data['fechaActualizacion'].toDate();
          }
          return { id: adminData['restauranteId'] || id, nombre: nombreRestaurante, ...data } as Restaurante;
        }
      }
      
      // COMPATIBILIDAD: Buscar en estructura antigua
      const restauranteDocRef = doc(db, 'restaurantes', id);
      const restauranteDoc = await getDoc(restauranteDocRef);
      
      if (restauranteDoc.exists()) {
        const data = restauranteDoc.data();
        // Convertir Timestamps si existen
        if (data['fechaCreacion'] && data['fechaCreacion'].toDate) {
          data['fechaCreacion'] = data['fechaCreacion'].toDate();
        }
        if (data['fechaActualizacion'] && data['fechaActualizacion'].toDate) {
          data['fechaActualizacion'] = data['fechaActualizacion'].toDate();
        }
        return { id: restauranteDoc.id, ...data } as Restaurante;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo restaurante por ID:', error);
      throw error;
    }
  }

  // Obtener restaurante por slug - versión simplificada
  async obtenerPorSlug(slug: string): Promise<Restaurante | null> {
    try {
      // Simular restaurante por ahora
      if (slug === 'principal') {
        return {
          id: 'rest_principal_123',
          slug: 'principal',
          nombre: 'Bocket CRM',
          telefono: '+57 300 123 4567',
          email: 'info@bocketcrm.com',
          direccion: 'Calle 123 #45-67',
          ciudad: 'Bogotá',
          pais: 'Colombia',
          tipoNegocio: 'restaurante' as const,
          horarioAtencion: [],
          moneda: 'COP' as const,
          idioma: 'es' as const,
          zonaHoraria: 'America/Bogota',
          colorPrimario: '#004aad',
          colorSecundario: '#d636a0',
          activo: true,
          planSuscripcion: 'profesional' as const,
          limiteUsuarios: 50,
          limiteClientes: 1000,
          limiteReservas: 500,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          creadoPor: 'sistema'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo restaurante por slug:', error);
      throw error;
    }
  }

  // Obtener todos los restaurantes (solo para super admin)
  async obtenerTodos(): Promise<Restaurante[]> {
    // Simular por ahora
    return [];
  }

  // Crear nuevo restaurante usando Firebase SDK nativo
  async crear(restaurante: Omit<Restaurante, 'id'>): Promise<Restaurante> {
    try {
      // Generar ID único
      const restauranteId = `rest_${restaurante.slug}_${Date.now()}`;
      
      const nuevoRestaurante: Restaurante = {
        ...restaurante,
        id: restauranteId,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        activo: true
      };

      const app = getApp();
      const db = getFirestore(app);
      const restauranteDocRef = doc(db, 'restaurantes', restauranteId);
      await setDoc(restauranteDocRef, nuevoRestaurante);
      
      // Crear estructura inicial de colecciones
      await this.crearEstructuraInicial(restauranteId);
      
      return nuevoRestaurante;
    } catch (error) {
      console.error('Error creando restaurante:', error);
      throw error;
    }
  }

  // Actualizar restaurante usando Firebase SDK nativo
  async actualizar(id: string, cambios: Partial<Restaurante>): Promise<Restaurante> {
    try {
      const datosActualizacion = {
        ...cambios,
        fechaActualizacion: new Date()
      };
      
      const app = getApp();
      const db = getFirestore(app);
      const restauranteDocRef = doc(db, 'restaurantes', id);
      await updateDoc(restauranteDocRef, datosActualizacion);
      
      const restauranteActualizado = await this.obtenerPorId(id);
      if (!restauranteActualizado) {
        throw new Error('No se pudo obtener el restaurante actualizado');
      }
      
      return restauranteActualizado;
    } catch (error) {
      console.error('Error actualizando restaurante:', error);
      throw error;
    }
  }

  // Desactivar restaurante (soft delete) usando Firebase SDK nativo
  async desactivar(id: string): Promise<void> {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const restauranteDocRef = doc(db, 'restaurantes', id);
      await updateDoc(restauranteDocRef, {
        activo: false,
        fechaDesactivacion: new Date(),
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error desactivando restaurante:', error);
      throw error;
    }
  }

  // Activar restaurante usando Firebase SDK nativo
  async activar(id: string): Promise<void> {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const restauranteDocRef = doc(db, 'restaurantes', id);
      await updateDoc(restauranteDocRef, {
        activo: true,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error activando restaurante:', error);
      throw error;
    }
  }

  // Eliminar restaurante permanentemente (solo super admin) usando Firebase SDK nativo
  async eliminar(id: string): Promise<void> {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const restauranteDocRef = doc(db, 'restaurantes', id);
      await deleteDoc(restauranteDocRef);
      
      // TODO: También eliminar todas las subcolecciones del restaurante
      // Esto requiere una Cloud Function para hacerlo de manera segura
      console.warn('Eliminar subcolecciones del restaurante requiere implementación adicional');
      
    } catch (error) {
      console.error('Error eliminando restaurante:', error);
      throw error;
    }
  }

  // Verificar si un slug está disponible
  async slugDisponible(slug: string, restauranteIdExcluir?: string): Promise<boolean> {
    try {
      const querySnapshot = await this.firestore
        .collection('restaurantes', ref => ref.where('slug', '==', slug))
        .get()
        .toPromise();
      
      if (querySnapshot?.empty) {
        return true;
      }
      
      // Si se proporciona un ID para excluir (para actualizaciones)
      if (restauranteIdExcluir && querySnapshot) {
        const docs = querySnapshot.docs.filter((doc: any) => doc.id !== restauranteIdExcluir);
        return docs.length === 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando disponibilidad de slug:', error);
      return false;
    }
  }

  // Obtener estadísticas del restaurante
  async obtenerEstadisticas(restauranteId: string): Promise<any> {
    try {
      // TODO: Implementar contadores de clientes, reservas, pedidos, etc.
      // Por ahora retornamos datos simulados
      return {
        totalClientes: 0,
        reservasActivas: 0,
        pedidosHoy: 0,
        ingresosMes: 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Crear estructura inicial de colecciones usando ARQUITECTURA CORRECTA
  private async crearEstructuraInicial(nombreRestaurante: string): Promise<void> {
    try {
      const app = getApp();
      const db = getFirestore(app);
      
      const colecciones = [
        'clientes',
        'reservas', 
        'pedidos',
        'productos'
      ];

      // ARQUITECTURA CORRECTA: Crear en /clients/{nombreRestaurante}/
      for (const coleccion of colecciones) {
        const coleccionRef = doc(db, `clients/${nombreRestaurante}/${coleccion}`, '_config');
        await setDoc(coleccionRef, {
          _placeholder: true,
          fechaCreacion: new Date(),
          descripcion: `Colección ${coleccion} para ${nombreRestaurante}`
        });
      }

      // Crear configuración inicial del restaurante en info
      const configRef = doc(db, `clients/${nombreRestaurante}/info`, 'configuracion');
      await setDoc(configRef, {
          notificaciones: {
            email: true,
            push: false,
            sms: false
          },
          horarios: {
            lunes: { abierto: true, apertura: '08:00', cierre: '22:00' },
            martes: { abierto: true, apertura: '08:00', cierre: '22:00' },
            miercoles: { abierto: true, apertura: '08:00', cierre: '22:00' },
            jueves: { abierto: true, apertura: '08:00', cierre: '22:00' },
            viernes: { abierto: true, apertura: '08:00', cierre: '23:00' },
            sabado: { abierto: true, apertura: '09:00', cierre: '23:00' },
            domingo: { abierto: false, apertura: '', cierre: '' }
          },
          configuracionPedidos: {
            tiempoPreparacionPromedio: 30,
            permitirPedidosOnline: true,
            minimoDelivery: 20000
          },
          fechaCreacion: new Date()
        });

    } catch (error) {
      console.error('Error creando estructura inicial:', error);
      throw error;
    }
  }

  // Aplicar tema personalizado del restaurante
  aplicarTemaPersonalizado(restaurante: Restaurante): void {
    const root = document.documentElement;
    
    // Aplicar colores principales
    if (restaurante.colorPrimario) {
      root.style.setProperty('--bocket-primary-500', restaurante.colorPrimario);
      root.style.setProperty('--bocket-primary-600', this.darkenColor(restaurante.colorPrimario, 10));
      root.style.setProperty('--bocket-primary-400', this.lightenColor(restaurante.colorPrimario, 10));
    }
    
    if (restaurante.colorSecundario) {
      root.style.setProperty('--bocket-secondary-500', restaurante.colorSecundario);
      root.style.setProperty('--bocket-secondary-600', this.darkenColor(restaurante.colorSecundario, 10));
      root.style.setProperty('--bocket-secondary-400', this.lightenColor(restaurante.colorSecundario, 10));
    }

    // Actualizar título de la página
    document.title = `${restaurante.nombre} - Bocket CRM`;
    
    // TODO: Actualizar favicon si está disponible
    // if (restaurante.favicon) {
    //   this.actualizarFavicon(restaurante.favicon);
    // }
  }

  private darkenColor(color: string, amount: number): string {
    // Implementación básica - en producción usar una librería como color2k
    return color;
  }

  private lightenColor(color: string, amount: number): string {
    // Implementación básica - en producción usar una librería como color2k
    return color;
  }

  private actualizarFavicon(faviconUrl: string): void {
    let link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}