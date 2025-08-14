import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reserva } from '../modelos/reserva.model';
import { AuthService } from './auth.service';

// Import Firebase SDK nativo para operaciones directas

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private readonly businessId = 'worldfood'; // ID del negocio estático (para compatibilidad)
  private readonly baseCollection = 'clients'; // Colección base estática
  private readonly formulariosCollection = 'Formularios'; // Colección de formularios estática (para compatibilidad)

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  /**
   * Limpiar campos undefined de un objeto para Firebase
   * Firebase no permite campos undefined
   */
  private limpiarCamposUndefined(objeto: any): any {
    const objetoLimpio: any = {};
    for (const [key, value] of Object.entries(objeto)) {
      if (value !== undefined) {
        objetoLimpio[key] = value;
      }
    }
    return objetoLimpio;
  }

  /**
   * ARQUITECTURA CORRECTA: Ruta para reservas por nombre de restaurante
   */
  private getReservasPath(nombreRestaurante: string): string {
    const path = `${this.baseCollection}/${nombreRestaurante}/reservas`;
    console.log(`📍 ReservaService (ARQUITECTURA CORRECTA): Usando ruta: ${path}`);
    return path;
  }

  /**
   * ESTRUCTURA FINAL: Obtener la ruta para formularios de reservas organizados
   */
  private getFormulariosReservasPath(nombreRestaurante: string): string {
    const path = `${this.baseCollection}/${nombreRestaurante}/formularios/reservas/datos`;
    console.log(`📍 ReservaService (ESTRUCTURA FINAL): Usando ruta formularios reservas: ${path}`);
    return path;
  }

  /**
   * COMPATIBILIDAD: Obtener la ruta completa para los formularios (arquitectura multi-tenant unificada)
   * @deprecated Usar getFormulariosReservasPath en su lugar
   */
  private getFormulariosPath(): string {
    const path = `${this.baseCollection}/${this.businessId}/${this.formulariosCollection}`;
    console.log(`📍 ReservaService (COMPATIBILIDAD): Usando ruta multi-tenant antigua: ${path}`);
    return path;
  }

  /**
   * Obtener el nombre del restaurante actual para la arquitectura correcta
   */
  private getRestauranteActualNombre(): string {
    const restaurante = this.authService.obtenerRestauranteActual();
    if (!restaurante || !restaurante.nombre) {
      console.error('❌ ReservaService: No hay restaurante seleccionado o nombre de restaurante inválido');
      throw new Error('No hay restaurante seleccionado. Por favor, inicia sesión nuevamente.');
    }
    console.log(`🏪 ReservaService: Restaurante actual nombre: ${restaurante.nombre}`);
    return restaurante.nombre;
  }

  /**
   * Obtener el ID del restaurante actual para compatibilidad
   */
  private getRestauranteActualId(): string {
    const restaurante = this.authService.obtenerRestauranteActual();
    if (!restaurante || !restaurante.id) {
      console.error('❌ ReservaService: No hay restaurante seleccionado o ID de restaurante inválido');
      throw new Error('No hay restaurante seleccionado. Por favor, inicia sesión nuevamente.');
    }
    console.log(`🏪 ReservaService: Restaurante actual ID: ${restaurante.id}`);
    return restaurante.id;
  }

  /**
   * Obtener todas las reservas (NUEVA ARQUITECTURA)
   * Las reservas se almacenan en /clients/{restauranteId}/data/reservas/
   */
  async obtenerTodos(): Promise<Reserva[]> {
    try {
      console.log('🔥 ReservaService.obtenerTodos() - Obteniendo reservas con ARQUITECTURA CORRECTA...');
      
      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      
      // ARQUITECTURA CORRECTA: Obtener reservas de /clients/{nombreRestaurante}/Formularios/reservas/
      console.log(`📍 Consultando ARQUITECTURA CORRECTA: ${this.getReservasPath(nombreRestaurante)}`);
      
      let reservas: Reserva[] = [];
      
      try {
        const snapshot = await this.firestore.collection(this.getReservasPath(nombreRestaurante)).get().toPromise();
        
        console.log(`📊 ARQUITECTURA CORRECTA - Documentos encontrados: ${snapshot?.size || 0}`);
        
        if (snapshot) {
          snapshot.forEach(doc => {
            const data = doc.data() as any;
            const reserva = this.mapearDocumentoAReserva(doc.id, data);
            if (reserva) {
              reservas.push(reserva);
              console.log(`✅ Reserva de arquitectura correcta: ${reserva.contactNameBooking} (${reserva.id})`);
            }
          });
        }
        
        if (reservas.length > 0) {
          console.log(`✅ ReservaService: ${reservas.length} reservas encontradas en ARQUITECTURA CORRECTA`);
          return reservas;
        }
      } catch (error) {
        console.log(`⚠️ No hay datos en arquitectura correcta, consultando estructura antigua...`);
      }
      
      // COMPATIBILIDAD: Si no hay datos en arquitectura correcta, consultar estructura antigua
      console.log(`📍 Consultando COMPATIBILIDAD: ${this.getFormulariosPath()}`);
      
      // Filtrar solo documentos del restaurante actual con typeForm de reservas
      console.log(`📡 Realizando consulta de compatibilidad para restaurante: ${restauranteId}...`);
      const snapshot = await this.firestore.collection(this.getFormulariosPath(), ref => 
        ref.where('restauranteId', '==', restauranteId)
           .where('typeForm', 'in', [
             'Formulario reservas particulares',
             'Formulario reservas eventos'
           ])
      ).get().toPromise();
      
      console.log(`📊 COMPATIBILIDAD - Total documentos encontrados: ${snapshot?.size || 0}`);
      
      if (snapshot) {
        snapshot.forEach(doc => {
          const data = doc.data() as any;
          const docId = doc.id;
          
          // Parsear ID del documento: {timestamp}_{typeForm}_{chatId}
          const parts = docId.split('_');
          if (parts.length >= 3) {
            const chatId = parts[parts.length - 1]; // Chat ID
            const typeForm = parts.slice(1, -1).join('_'); // Tipo de formulario
            const timestamp = parseInt(parts[0]); // Timestamp
            
            // Extraer información de la reserva del formulario
            const reservaInfo = this.extraerInfoReserva(data, typeForm, chatId, timestamp, docId);
            
            if (reservaInfo) {
              reservas.push(reservaInfo);
              console.log(`✅ Reserva de compatibilidad: ${reservaInfo.contactNameBooking} (${reservaInfo.id})`);
            }
          }
        });
      }
      
      console.log(`✅ ReservaService.obtenerTodos() - ${reservas.length} reservas encontradas`);
      return reservas;
    } catch (error) {
      console.error('❌ Error obteniendo reservas:', error);
      return [];
    }
  }

  /**
   * NUEVA ARQUITECTURA: Mapear documento de reserva a objeto Reserva
   */
  private mapearDocumentoAReserva(docId: string, data: any): Reserva | null {
    try {
      return {
        id: data.id || docId,
        contact: data.contact || '',
        contactNameBooking: data.contactNameBooking || '',
        peopleBooking: data.peopleBooking || '1',
        finalPeopleBooking: data.finalPeopleBooking || 1,
        dateBooking: data.dateBooking || new Date().toISOString(),
        statusBooking: data.statusBooking || 'pending',
        detailsBooking: data.detailsBooking || '',
        reconfirmDate: data.reconfirmDate || '',
        reconfirmStatus: data.reconfirmStatus
      };
    } catch (error) {
      console.error('Error mapeando documento de reserva:', error);
      return null;
    }
  }

  /**
   * COMPATIBILIDAD: Extraer información de la reserva desde los datos del formulario
   */
  private extraerInfoReserva(data: any, typeForm: string, chatId: string, timestamp: number, docId: string): Reserva | null {
    try {
      let contactNameBooking = '';
      let peopleBooking = '';
      let finalPeopleBooking = 1;
      let dateBooking = '';
      let detailsBooking = '';
      let statusBooking: 'pending' | 'accepted' | 'rejected' = 'pending';
      
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
          dateBooking = this.parsearFechaReserva(data[fechaField]);
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
          dateBooking = this.parsearFechaReserva(data[fechaField]);
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
      
      // Leer el estado actual de la reserva desde el documento
      if (data['status']) {
        statusBooking = data['status'];
        console.log(`📊 Estado leído desde Firebase: ${statusBooking}`);
      } else {
        console.log(`⚠️ No se encontró campo 'status', usando estado por defecto: ${statusBooking}`);
      }
      
      if (!contactNameBooking) return null;
      
      const reserva: Reserva = {
        id: docId,
        contact: chatId,
        contactNameBooking: contactNameBooking,
        peopleBooking: peopleBooking,
        finalPeopleBooking: finalPeopleBooking,
        dateBooking: dateBooking || new Date(timestamp).toISOString(),
        statusBooking: statusBooking,
        detailsBooking: detailsBooking,
        reconfirmDate: '',
        // No asignar reconfirmStatus si no tiene valor
      };
      
      return reserva;
    } catch (error) {
      console.error('Error extrayendo info de reserva:', error);
      return null;
    }
  }

  /**
   * Parsear fecha de reserva desde texto
   */
  private parsearFechaReserva(fechaTexto: string): string {
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

  // CRUD: Obtener reservas como Observable (para tiempo real)
  obtenerTodasObservable(): Observable<Reserva[]> {
    // Para la nueva arquitectura, convertir el método async a Observable
    return from(this.obtenerTodos());
  }

  // CRUD: Obtener reserva por ID (NUEVA ARQUITECTURA)
  async obtenerPorId(id: string): Promise<Reserva | null> {
    try {
      console.log(`🔍 ReservaService.obtenerPorId() - Buscando reserva: ${id}`);
      
      const nombreRestaurante = this.getRestauranteActualNombre();
      
      // ARQUITECTURA CORRECTA: Buscar directamente en /clients/{nombreRestaurante}/Formularios/reservas/
      try {
        const reservasPath = this.getReservasPath(nombreRestaurante);
        const docSnap = await this.firestore.doc(`${reservasPath}/${id}`).get().toPromise();
        
        if (docSnap && docSnap.exists) {
          const data = docSnap.data() as any;
          const reserva = this.mapearDocumentoAReserva(id, data);
          if (reserva) {
            console.log(`✅ Reserva encontrada en ARQUITECTURA CORRECTA: ${reserva.contactNameBooking}`);
            return reserva;
          }
        }
      } catch (error) {
        console.log(`⚠️ No encontrado en arquitectura correcta, buscando en compatibilidad...`);
      }
      
      // COMPATIBILIDAD: Buscar en la colección de formularios
      const reservaDoc = await this.firestore.doc(`${this.getFormulariosPath()}/${id}`).get().toPromise();
      
      if (!reservaDoc || !reservaDoc.exists) {
        console.log(`❌ Reserva no encontrada en ninguna estructura: ${id}`);
        return null;
      }
      
      const data = reservaDoc.data() as any;
      const docId = reservaDoc.id;
      
      console.log(`📄 COMPATIBILIDAD - Documento encontrado: ${docId}`);
      
      // Parsear ID del documento para extraer información
      const parts = docId.split('_');
      if (parts.length >= 3) {
        const chatId = parts[parts.length - 1];
        const typeForm = parts.slice(1, -1).join('_');
        const timestamp = parseInt(parts[0]);
        
        // Extraer información de la reserva del formulario
        const reservaInfo = this.extraerInfoReserva(data, typeForm, chatId, timestamp, docId);
        
        if (reservaInfo) {
          console.log(`✅ Reserva extraída de compatibilidad: ${reservaInfo.contactNameBooking}`);
          return reservaInfo;
        }
      }
      
      console.log(`❌ No se pudo extraer información de la reserva del documento`);
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo reserva por ID:', error);
      return null;
    }
  }

  /**
   * Crear nueva reserva (NUEVA ARQUITECTURA)
   * Se almacena directamente en /clients/{restauranteId}/data/reservas/
   */
  async crear(reserva: Partial<Reserva>): Promise<Reserva> {
    try {
      console.log('🔥 ReservaService.crear() - Creando reserva con ARQUITECTURA CORRECTA...');

      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      // Construir objeto sin spread operator para evitar undefined
      const nuevaReserva: any = {
        id: this.generarId(),
        contact: reserva.contact || Date.now().toString(),
        contactNameBooking: reserva.contactNameBooking || '',
        peopleBooking: reserva.peopleBooking || '1',
        finalPeopleBooking: reserva.finalPeopleBooking || 1,
        dateBooking: reserva.dateBooking || new Date().toISOString(),
        statusBooking: reserva.statusBooking || 'pending',
        detailsBooking: reserva.detailsBooking || '',
        reconfirmDate: reserva.reconfirmDate || ''
      };

      // Solo agregar reconfirmStatus si tiene un valor válido
      if (reserva.reconfirmStatus && ['pending', 'accepted', 'rejected'].includes(reserva.reconfirmStatus)) {
        nuevaReserva.reconfirmStatus = reserva.reconfirmStatus;
      }

      // ARQUITECTURA CORRECTA: Guardar usando AngularFirestore
      const reservasPath = this.getReservasPath(nombreRestaurante);
      const reservaDocRef = this.firestore.doc(`${reservasPath}/${nuevaReserva.id}`);
      
      console.log(`📍 ARQUITECTURA CORRECTA - Guardando en: ${this.getReservasPath(nombreRestaurante)}/${nuevaReserva.id}`);
      
      // Limpiar campos undefined antes de enviar a Firebase
      const datosLimpios = this.limpiarCamposUndefined(nuevaReserva);
      await reservaDocRef.set(datosLimpios);
      
      // ESTRUCTURA FINAL: También crear en formularios de reservas organizados
      const rutaFormulariosReservas = this.getFormulariosReservasPath(nombreRestaurante);
      const timestamp = Date.now();
      const docIdFormulario = `${timestamp}_reserva_${nuevaReserva.contact}`;
      
      const datosFormularioReserva = {
        id: docIdFormulario,
        tipoFormulario: 'reservas',
        restauranteSlug: nombreRestaurante,
        restauranteId: restauranteId,
        chatId: nuevaReserva.contact,
        timestamp: timestamp,
        nombreCliente: nuevaReserva.contactNameBooking,
        numeroPersonas: nuevaReserva.peopleBooking,
        fechaHora: this.formatearFechaParaFormulario(nuevaReserva.dateBooking),
        areaPreferencia: nuevaReserva.detailsBooking || 'Sin preferencia',
        status: nuevaReserva.statusBooking,
        fechaCreacion: new Date().toISOString(),
        source: 'manual_creation'
      };

      const reservaFormularioRef = this.firestore.doc(`${rutaFormulariosReservas}/${docIdFormulario}`);
      await reservaFormularioRef.set(datosFormularioReserva);

      // COMPATIBILIDAD: También crear en estructura antigua para migración gradual
      const docIdCompatibilidad = `${timestamp}_Formulario reservas particulares_${nuevaReserva.contact}`;
      
      const datosFormularioCompatibilidad = {
        'Indícame el nombre y apellido de la persona para la cual será la reserva.': nuevaReserva.contactNameBooking,
        '¿Para cuántas personas deseas reservar?': nuevaReserva.peopleBooking,
        '*TEN EN CUENTA* debes reservar con 1 dia de anticipación y que tomamos reservas hasta las 7:30 pm. Después de esa hora es por orden de llegada.\nPor favor escribe el *día y hora* en que deseas reservar.': this.formatearFechaParaFormulario(nuevaReserva.dateBooking),
        'Indique el *área de preferencia*\nTen en cuenta que el Rooftop solo de jueves a domingo a partir de las 5:30 pm, no incluye servicio del restaurante Brazzeiro (Rodizio) y dependemos del clima.': nuevaReserva.detailsBooking || 'Sin preferencia',
        typeForm: 'Formulario reservas particulares',
        restauranteId: restauranteId,
        chatId: nuevaReserva.contact,
        timestamp: timestamp,
        createdAt: new Date().toISOString(),
        source: 'manual_creation',
        status: nuevaReserva.statusBooking
      };

      const formulariosPath = this.getFormulariosPath();
      const reservaCompatibilidadRef = this.firestore.doc(`${formulariosPath}/${docIdCompatibilidad}`);
      await reservaCompatibilidadRef.set(datosFormularioCompatibilidad);
      
      console.log('✅ Reserva creada exitosamente en TODAS LAS ESTRUCTURAS');
      console.log(`   🏗️ ARQUITECTURA CORRECTA: ${this.getReservasPath(nombreRestaurante)}/${nuevaReserva.id}`);
      console.log(`   📋 ESTRUCTURA FINAL: ${rutaFormulariosReservas}/${docIdFormulario}`);
      console.log(`   🔄 COMPATIBILIDAD: ${this.getFormulariosPath()}/${docIdCompatibilidad}`);
      console.log(`   👤 Contacto: ${nuevaReserva.contactNameBooking}`);
      
      return nuevaReserva;
    } catch (error) {
      console.error('❌ Error creando reserva:', error);
      throw error;
    }
  }

  /**
   * Formatear fecha para mostrar en formulario
   */
  private formatearFechaParaFormulario(fechaISO: string): string {
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return fechaISO;
    }
  }

  /**
   * Actualizar reserva existente (NUEVA ARQUITECTURA)
   */
  async actualizar(id: string, cambios: Partial<Reserva>): Promise<Reserva> {
    try {
      console.log('🔥 ReservaService.actualizar() - Actualizando reserva con ARQUITECTURA CORRECTA:', id);

      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      // Usar AngularFirestore en lugar de Firebase SDK nativo
      
      // Obtener reserva actual
      const reservaActual = await this.obtenerPorId(id);
      if (!reservaActual) {
        throw new Error(`No se encontró reserva con ID: ${id}`);
      }
      
      // Crear reserva actualizada
      const reservaActualizada: Reserva = {
        ...reservaActual,
        ...cambios,
        id: id // Mantener el ID original
      };
      
      let actualizado = false;
      
      // ARQUITECTURA CORRECTA: Actualizar usando AngularFirestore
      try {
        const reservasPath = this.getReservasPath(nombreRestaurante);
        const reservaDocRef = this.firestore.doc(`${reservasPath}/${id}`);
        const docSnap = await reservaDocRef.get().toPromise();
        
        if (docSnap && docSnap.exists) {
          await reservaDocRef.set(reservaActualizada);
          console.log(`✅ Reserva actualizada en ARQUITECTURA CORRECTA`);
          actualizado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error actualizando en arquitectura correcta:`, error);
      }
      
      // COMPATIBILIDAD: Actualizar también en estructura antigua si existe
      try {
        const formulariosPath = this.getFormulariosPath();
        const reservaCompatibilidadRef = this.firestore.doc(`${formulariosPath}/${id}`);
        const docSnap = await reservaCompatibilidadRef.get().toPromise();
        
        if (docSnap && docSnap.exists) {
          console.log('🔄 COMPATIBILIDAD - Actualizando estructura antigua...');
          
          const datosActuales = docSnap.data() as any;
          const datosActualizados: any = {
            lastUpdate: new Date().toISOString()
          };

          // Actualizar campos específicos en la estructura de formulario
          if (cambios.contactNameBooking) {
            const nombreField = Object.keys(datosActuales).find(key => 
              key.toLowerCase().includes('nombre') && key.toLowerCase().includes('apellido')
            );
            if (nombreField) {
              datosActualizados[nombreField] = cambios.contactNameBooking;
            }
          }

          if (cambios.peopleBooking || cambios.finalPeopleBooking) {
            const personasField = Object.keys(datosActuales).find(key => 
              key.toLowerCase().includes('cuántas personas')
            );
            if (personasField) {
              datosActualizados[personasField] = cambios.peopleBooking || cambios.finalPeopleBooking?.toString();
            }
          }

          if (cambios.dateBooking) {
            const fechaField = Object.keys(datosActuales).find(key => 
              key.toLowerCase().includes('día y hora')
            );
            if (fechaField) {
              datosActualizados[fechaField] = this.formatearFechaParaFormulario(cambios.dateBooking);
            }
          }

          if (cambios.statusBooking) {
            console.log(`📝 Actualizando estado de ${cambios.statusBooking}`);
            datosActualizados.status = cambios.statusBooking;
          }

          if (cambios.detailsBooking) {
            const areaField = Object.keys(datosActuales).find(key => 
              key.toLowerCase().includes('área') || key.toLowerCase().includes('preferencia')
            );
            if (areaField) {
              datosActualizados[areaField] = cambios.detailsBooking;
            }
          }

          await reservaCompatibilidadRef.update(datosActualizados);
          console.log(`✅ COMPATIBILIDAD - Reserva actualizada en estructura antigua`);
          actualizado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error actualizando compatibilidad:`, error);
      }
      
      if (!actualizado) {
        throw new Error('No se pudo actualizar la reserva en ninguna estructura');
      }
      
      console.log('✅ Reserva actualizada exitosamente en todas las estructuras disponibles');
      return reservaActualizada;
    } catch (error) {
      console.error('❌ Error actualizando reserva:', error);
      throw error;
    }
  }

  /**
   * Eliminar reserva (NUEVA ARQUITECTURA)
   */
  async eliminar(id: string): Promise<void> {
    try {
      console.log('🔥 ReservaService.eliminar() - Eliminando reserva con ARQUITECTURA CORRECTA:', id);

      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      
      let eliminado = false;
      
      // ARQUITECTURA CORRECTA: Eliminar de /clients/{nombreRestaurante}/Formularios/reservas/
      try {
        const reservasPath = this.getReservasPath(nombreRestaurante);
        const docSnap = await this.firestore.doc(`${reservasPath}/${id}`).get().toPromise();
        
        if (docSnap && docSnap.exists) {
          await this.firestore.doc(`${reservasPath}/${id}`).delete();
          console.log(`✅ Reserva eliminada de ARQUITECTURA CORRECTA`);
          eliminado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error eliminando de arquitectura correcta:`, error);
      }
      
      // COMPATIBILIDAD: Eliminar también de estructura antigua
      try {
        const formulariosPath = this.getFormulariosPath();
        const docSnap = await this.firestore.doc(`${formulariosPath}/${id}`).get().toPromise();
        
        if (docSnap && docSnap.exists) {
          await this.firestore.doc(`${formulariosPath}/${id}`).delete();
          console.log(`✅ COMPATIBILIDAD - Reserva eliminada de estructura antigua`);
          eliminado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error eliminando compatibilidad:`, error);
      }
      
      if (!eliminado) {
        throw new Error(`No se encontró reserva para eliminar con ID: ${id}`);
      }
      
      console.log(`✅ Reserva eliminada completamente de todas las estructuras: ${id}`);
    } catch (error) {
      console.error('❌ Error eliminando reserva:', error);
      throw error;
    }
  }

  // Métodos de consulta específicos para reservas
  
  // Obtener reservas por estado
  async obtenerPorEstado(estado: 'pending' | 'accepted' | 'rejected'): Promise<Reserva[]> {
    try {
      const todasReservas = await this.obtenerTodos();
      return todasReservas.filter(r => r.statusBooking === estado);
    } catch (error) {
      console.error('Error obteniendo reservas por estado:', error);
      return [];
    }
  }

  // Obtener reservas por fecha
  async obtenerPorFecha(fecha: Date): Promise<Reserva[]> {
    try {
      const todasReservas = await this.obtenerTodos();
      return todasReservas.filter(r => {
        const fechaReserva = new Date(r.dateBooking);
        return fechaReserva.toDateString() === fecha.toDateString();
      });
    } catch (error) {
      console.error('Error obteniendo reservas por fecha:', error);
      return [];
    }
  }

  // Obtener reservas por contacto WhatsApp
  async obtenerPorContacto(contact: string): Promise<Reserva[]> {
    try {
      const todasReservas = await this.obtenerTodos();
      return todasReservas.filter(r => r.contact === contact);
    } catch (error) {
      console.error('Error obteniendo reservas por contacto:', error);
      return [];
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