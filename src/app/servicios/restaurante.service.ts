import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Restaurante } from '../modelos';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {

  constructor(private firestore: AngularFirestore) {}

  // Obtener restaurante por ID usando AngularFirestore (ARQUITECTURA CORRECTA)
  async obtenerPorId(id: string): Promise<Restaurante | null> {
    try {
      console.log('🔍 RestauranteService: Buscando restaurante por ID:', id);
      
      // ARQUITECTURA CORRECTA: Buscar en adminUsers primero para obtener el nombre
      const adminDoc = await this.firestore.doc(`adminUsers/${id}`).get().toPromise();
      
      if (adminDoc && adminDoc.exists) {
        const adminData = adminDoc.data() as any;
        const nombreRestaurante = adminData['restauranteAsignado'];
        console.log('✅ RestauranteService: Admin encontrado, restaurante asignado:', nombreRestaurante);
        
        // Buscar información del restaurante por nombre (ESTRUCTURA CORRECTA)
        const restauranteDoc = await this.firestore.doc(`clients/${nombreRestaurante}/configuracion/restaurante`).get().toPromise();
        
        if (restauranteDoc && restauranteDoc.exists) {
          const data = restauranteDoc.data() as any;
          console.log('✅ RestauranteService: Configuración de restaurante encontrada');
          
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
      const restauranteDoc = await this.firestore.doc(`restaurantes/${id}`).get().toPromise();
      
      if (restauranteDoc && restauranteDoc.exists) {
        const data = restauranteDoc.data() as any;
        console.log('✅ RestauranteService: Restaurante encontrado en estructura antigua');
        
        // Convertir Timestamps si existen
        if (data['fechaCreacion'] && data['fechaCreacion'].toDate) {
          data['fechaCreacion'] = data['fechaCreacion'].toDate();
        }
        if (data['fechaActualizacion'] && data['fechaActualizacion'].toDate) {
          data['fechaActualizacion'] = data['fechaActualizacion'].toDate();
        }
        return { id: restauranteDoc.id, ...data } as Restaurante;
      }
      
      console.log('❌ RestauranteService: No se encontró restaurante para ID:', id);
      return null;
    } catch (error) {
      console.error('❌ RestauranteService: Error obteniendo restaurante por ID:', error);
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

  // Crear nuevo restaurante usando AngularFirestore
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

      await this.firestore.doc(`restaurantes/${restauranteId}`).set(nuevoRestaurante);
      
      // Crear estructura inicial de colecciones
      await this.crearEstructuraInicial(restaurante.slug);
      
      return nuevoRestaurante;
    } catch (error) {
      console.error('Error creando restaurante:', error);
      throw error;
    }
  }

  // Actualizar restaurante usando AngularFirestore (ARQUITECTURA CORRECTA)
  async actualizar(id: string, cambios: Partial<Restaurante>): Promise<Restaurante> {
    try {
      console.log('🔄 RestauranteService: Actualizando restaurante ID:', id);
      
      const datosActualizacion = {
        ...cambios,
        fechaActualizacion: new Date()
      };
      
      // ARQUITECTURA CORRECTA: Buscar en adminUsers primero para obtener el nombre del restaurante
      const adminDoc = await this.firestore.doc(`adminUsers/${id}`).get().toPromise();
      
      if (adminDoc && adminDoc.exists) {
        const adminData = adminDoc.data() as any;
        const nombreRestaurante = adminData['restauranteAsignado'];
        console.log('✅ RestauranteService: Actualizando en nueva arquitectura:', nombreRestaurante);
        
        // Actualizar en la nueva estructura: /clients/{nombreRestaurante}/configuracion/restaurante
        await this.firestore.doc(`clients/${nombreRestaurante}/configuracion/restaurante`).set(datosActualizacion, { merge: true });
        console.log('✅ RestauranteService: Configuración actualizada en nueva arquitectura');
      } else {
        console.log('⚠️ RestauranteService: Admin no encontrado, intentando estructura antigua');
        // COMPATIBILIDAD: Usar estructura antigua como fallback
        await this.firestore.doc(`restaurantes/${id}`).set(datosActualizacion, { merge: true });
        console.log('✅ RestauranteService: Actualizado en estructura antigua');
      }
      
      const restauranteActualizado = await this.obtenerPorId(id);
      if (!restauranteActualizado) {
        throw new Error('No se pudo obtener el restaurante actualizado');
      }
      
      return restauranteActualizado;
    } catch (error) {
      console.error('❌ RestauranteService: Error actualizando restaurante:', error);
      throw error;
    }
  }

  // Desactivar restaurante (soft delete) usando AngularFirestore
  async desactivar(id: string): Promise<void> {
    try {
      await this.firestore.doc(`restaurantes/${id}`).update({
        activo: false,
        fechaDesactivacion: new Date(),
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error desactivando restaurante:', error);
      throw error;
    }
  }

  // Activar restaurante usando AngularFirestore
  async activar(id: string): Promise<void> {
    try {
      await this.firestore.doc(`restaurantes/${id}`).update({
        activo: true,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error activando restaurante:', error);
      throw error;
    }
  }

  // Eliminar restaurante permanentemente (solo super admin) usando AngularFirestore
  async eliminar(id: string): Promise<void> {
    try {
      await this.firestore.doc(`restaurantes/${id}`).delete();
      
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
      const colecciones = [
        'clientes',
        'reservas', 
        'pedidos',
        'productos'
      ];

      // ARQUITECTURA CORRECTA: Crear en /clients/{nombreRestaurante}/
      for (const coleccion of colecciones) {
        await this.firestore.doc(`clients/${nombreRestaurante}/${coleccion}/_config`).set({
          _placeholder: true,
          fechaCreacion: new Date(),
          descripcion: `Colección ${coleccion} para ${nombreRestaurante}`
        });
      }

      // Crear configuración inicial del restaurante en configuracion
      await this.firestore.doc(`clients/${nombreRestaurante}/configuracion/restaurante`).set({
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