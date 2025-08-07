import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { Cliente } from '../modelos';
import { AuthService } from './auth.service';

// Import Firebase SDK nativo para operaciones directas
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private readonly businessId = 'worldfood'; // ID del negocio estático (para compatibilidad)
  private readonly baseCollection = 'clients'; // Colección base estática
  private readonly formulariosCollection = 'Formularios'; // Colección de formularios estática (para compatibilidad)

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  /**
   * ARQUITECTURA CORRECTA: Ruta para clientes por nombre de restaurante
   */
  private getClientesPath(nombreRestaurante: string): string {
    const path = `${this.baseCollection}/${nombreRestaurante}/clientes`;
    console.log(`📍 ClienteService (ARQUITECTURA CORRECTA): Usando ruta: ${path}`);
    return path;
  }

  /**
   * COMPATIBILIDAD: Obtener la ruta completa para los formularios (arquitectura multi-tenant unificada)
   * @deprecated Usar getClientesPath en su lugar
   */
  private getFormulariosPath(): string {
    const path = `${this.baseCollection}/${this.businessId}/${this.formulariosCollection}`;
    console.log(`📍 ClienteService (COMPATIBILIDAD): Usando ruta multi-tenant antigua: ${path}`);
    return path;
  }

  /**
   * Obtener el ID del restaurante actual para filtrar datos
   */
  /**
   * Obtener el nombre del restaurante actual para la nueva arquitectura
   */
  private getRestauranteActualNombre(): string {
    const restaurante = this.authService.obtenerRestauranteActual();
    if (!restaurante || !restaurante.nombre) {
      console.error('❌ ClienteService: No hay restaurante seleccionado o nombre de restaurante inválido');
      throw new Error('No hay restaurante seleccionado. Por favor, inicia sesión nuevamente.');
    }
    console.log(`🏪 ClienteService: Restaurante actual nombre: ${restaurante.nombre}`);
    return restaurante.nombre;
  }

  private getRestauranteActualId(): string {
    const restaurante = this.authService.obtenerRestauranteActual();
    if (!restaurante || !restaurante.id) {
      console.error('❌ ClienteService: No hay restaurante seleccionado o ID de restaurante inválido');
      throw new Error('No hay restaurante seleccionado. Por favor, inicia sesión nuevamente.');
    }
    console.log(`🏪 ClienteService: Restaurante actual ID: ${restaurante.id}`);
    return restaurante.id;
  }

  /**
   * Obtener todos los clientes (NUEVA ARQUITECTURA)
   * Los clientes se almacenan en /clients/{restauranteId}/data/clientes/
   */
  async obtenerTodos(): Promise<Cliente[]> {
    try {
      console.log('🔥 ClienteService.obtenerTodos() - Iniciando obtención de clientes con ARQUITECTURA CORRECTA...');
      
      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      const app = getApp();
      const db = getFirestore(app);
      
      // ARQUITECTURA CORRECTA: Obtener clientes de /clients/{nombreRestaurante}/Formularios/clientes/
      console.log(`📍 Consultando ARQUITECTURA CORRECTA: ${this.getClientesPath(nombreRestaurante)}`);
      
      let clientes: Cliente[] = [];
      
      try {
        const clientesRef = collection(db, this.getClientesPath(nombreRestaurante));
        const snapshot = await getDocs(clientesRef);
        
        console.log(`📊 ARQUITECTURA CORRECTA - Documentos encontrados: ${snapshot.size}`);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          const cliente = this.mapearDocumentoACliente(doc.id, data);
          if (cliente) {
            clientes.push(cliente);
            console.log(`✅ Cliente de arquitectura correcta: ${cliente.name} (${cliente.id})`);
          }
        });
        
        if (clientes.length > 0) {
          console.log(`✅ ClienteService: ${clientes.length} clientes encontrados en ARQUITECTURA CORRECTA`);
          return clientes;
        }
      } catch (error) {
        console.log(`⚠️ No hay datos en arquitectura correcta, consultando estructura antigua...`);
      }
      
      // COMPATIBILIDAD: Si no hay datos en arquitectura correcta, consultar estructura antigua
      console.log(`📍 Consultando COMPATIBILIDAD: ${this.getFormulariosPath()}`);
      
      const formulariosRef = collection(db, this.getFormulariosPath());
      const clientesQuery = query(formulariosRef, where('restauranteId', '==', restauranteId));
      
      console.log(`📡 Realizando consulta de compatibilidad para restaurante: ${restauranteId}...`);
      const snapshot = await getDocs(clientesQuery);
      
      console.log(`📊 COMPATIBILIDAD - Total documentos encontrados: ${snapshot.size}`);
      
      if (snapshot.empty) {
        console.log('⚠️ No se encontraron documentos en ninguna estructura');
        console.log('💡 Verificar:');
        console.log('   1. Que los datos se estén guardando correctamente');
        console.log('   2. Nueva ruta: /clients/{restauranteId}/data/clientes');
        console.log('   3. Ruta antigua: /clients/worldfood/Formularios');
        console.log('   4. Que haya autenticación correcta en Firebase');
        return [];
      }
      
      // Procesar documentos de estructura antigua (formularios)
      const clientesMap = new Map<string, Cliente>();
      let documentosProcesados = 0;
      let clientesExtraidos = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        documentosProcesados++;
        
        console.log(`📄 COMPATIBILIDAD - Procesando documento ${documentosProcesados}: ${docId}`);
        console.log(`   TypeForm: ${data['typeForm'] || 'Sin tipo'}`);
        
        // Parsear ID del documento: {timestamp}_{typeForm}_{chatId}
        const parts = docId.split('_');
        if (parts.length >= 3) {
          const chatId = parts[parts.length - 1]; // Chat ID es el último elemento
          const typeForm = parts.slice(1, -1).join('_'); // Tipo de formulario
          const timestamp = parseInt(parts[0]); // Timestamp
          
          console.log(`   → ChatId: ${chatId}, TypeForm: ${typeForm}, Timestamp: ${timestamp}`);
          
          // Extraer información del cliente del formulario
          let clienteInfo = this.extraerInfoCliente(data, typeForm, chatId, timestamp);
          
          if (clienteInfo && chatId) {
            clientesExtraidos++;
            console.log(`   ✅ Cliente extraído de compatibilidad: ${clienteInfo.name} (${chatId})`);
            
            // Si ya existe un cliente con este chatId, actualizar información
            if (clientesMap.has(chatId)) {
              const clienteExistente = clientesMap.get(chatId)!;
              // Mantener la información más reciente
              if (timestamp > parseInt(clienteExistente.creation || '0')) {
                console.log(`   🔄 Actualizando cliente existente con datos más recientes`);
                clientesMap.set(chatId, { ...clienteExistente, ...clienteInfo });
              } else {
                console.log(`   ⏭️ Manteniendo datos existentes (más recientes)`);
              }
            } else {
              console.log(`   ➕ Agregando nuevo cliente al mapa`);
              clientesMap.set(chatId, clienteInfo);
            }
          } else {
            console.log(`   ⚠️ No se pudo extraer información del cliente de este documento`);
          }
        } else {
          console.log(`   ❌ Formato de ID de documento inválido: ${docId}`);
        }
      });
      
      clientes = Array.from(clientesMap.values());
      console.log(`✅ ClienteService.obtenerTodos() - Resumen final:`);
      console.log(`   📄 Documentos procesados: ${documentosProcesados}`);
      console.log(`   👤 Clientes extraídos: ${clientesExtraidos}`);
      console.log(`   🆔 Clientes únicos: ${clientes.length}`);
      
      clientes.forEach((cliente, index) => {
        console.log(`   ${index + 1}. ${cliente.name} (${cliente.id}) - ${cliente.labels}`);
      });
      
      return clientes;
    } catch (error) {
      console.error('❌ Error obteniendo clientes desde formularios:', error);
      console.error('🔍 Detalles del error:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      return [];
    }
  }

  /**
   * NUEVA ARQUITECTURA: Mapear documento de cliente a objeto Cliente
   */
  private mapearDocumentoACliente(docId: string, data: any): Cliente | null {
    try {
      return {
        id: data.id || docId,
        name: data.name || '',
        whatsAppName: data.whatsAppName || data.name || '',
        email: data.email || '',
        isWAContact: data.isWAContact ?? true,
        isMyContact: data.isMyContact ?? true,
        isEnterprise: data.isEnterprise || false,
        isBusiness: data.isBusiness || false,
        sourceType: data.sourceType || 'manual',
        respType: data.respType || 'manual',
        labels: data.labels || '',
        creation: data.creation || new Date().toISOString(),
        lastUpdate: data.lastUpdate || new Date().toISOString(),
        userInteractions: data.userInteractions || {
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
    } catch (error) {
      console.error('Error mapeando documento de cliente:', error);
      return null;
    }
  }

  /**
   * COMPATIBILIDAD: Extraer información del cliente desde los datos del formulario
   */
  private extraerInfoCliente(data: any, typeForm: string, chatId: string, timestamp: number): Cliente | null {
    try {
      let nombre = '';
      let email = '';
      let tipoInteraccion = '';
      
      // Verificar primero si hay campos actualizados (tienen prioridad)
      if (data['cliente_nombre_actualizado']) {
        nombre = data['cliente_nombre_actualizado'];
        console.log(`🔄 Usando nombre actualizado: ${nombre}`);
      }
      
      if (data['cliente_email_actualizado']) {
        email = data['cliente_email_actualizado'];
        console.log(`🔄 Usando email actualizado: ${email}`);
      }
      
      // Si no hay campos actualizados, extraer según el tipo de formulario
      if (!nombre) {
        if (typeForm === 'cliente') {
          // Nuevo formato simplificado para clientes creados manualmente
          nombre = data['nombre'] || '';
          email = data['email'] || '';
          tipoInteraccion = 'manual';
          console.log(`✅ Cliente manual (nuevo formato) extraído: ${nombre}, email: ${email}`);
        } else if (typeForm.includes('cliente manual') || typeForm.includes('Formulario cliente manual')) {
          // Buscar campo de nombre en clientes manuales (formato anterior)
          const nombreField = Object.keys(data).find(key => 
            key.toLowerCase().includes('por favor escribe tu nombre') || 
            key.toLowerCase().includes('nombre')
          );
          if (nombreField) {
            nombre = data[nombreField] || '';
          }
          
          // Buscar email en clientes manuales si no está actualizado
          if (!email) {
            const emailField = Object.keys(data).find(key => 
              key.toLowerCase().includes('email')
            );
            if (emailField) {
              email = data[emailField] || '';
            }
          }
          tipoInteraccion = 'manual';
          console.log(`✅ Cliente manual (formato anterior) extraído: ${nombre}, email: ${email}`);
        } else if (typeForm.includes('reservas particulares')) {
          // Buscar campo de nombre en reservas
          const nombreField = Object.keys(data).find(key => 
            key.toLowerCase().includes('nombre') && key.toLowerCase().includes('apellido')
          );
          if (nombreField) {
            nombre = data[nombreField] || '';
          }
          tipoInteraccion = 'reserva';
        } else if (typeForm.includes('hablar con una asesora')) {
          // Buscar campo de nombre en asesorías
          const nombreField = Object.keys(data).find(key => 
            key.toLowerCase().includes('nombre')
          );
          if (nombreField) {
            nombre = data[nombreField] || '';
          }
          tipoInteraccion = 'asesoria';
        } else if (typeForm.includes('reservas eventos')) {
          // Buscar campo de nombre en eventos
          const nombreField = Object.keys(data).find(key => 
            key.toLowerCase().includes('nombre') && key.toLowerCase().includes('apellido')
          );
          if (nombreField) {
            nombre = data[nombreField] || '';
          }
          
          // Buscar email en eventos si no está actualizado
          if (!email) {
            const emailField = Object.keys(data).find(key => 
              key.toLowerCase().includes('email')
            );
            if (emailField) {
              email = data[emailField] || '';
            }
          }
          tipoInteraccion = 'evento';
        }
      }
      
      if (!nombre) {
        console.log(`⚠️ No se pudo extraer nombre del formulario tipo: ${typeForm}`);
        console.log('📋 Campos disponibles:', Object.keys(data));
        return null;
      }
      
      // Determinar tipo de cliente basado en sus interacciones o campos actualizados
      let tipoCliente = 'regular';
      let labels = '';
      
      // Verificar en orden de prioridad: labels estándar > tipo actualizado > lógica original
      if (data['labels']) {
        labels = data['labels'];
        if (labels.includes('vip')) tipoCliente = 'vip';
        else if (labels.includes('corporativo')) tipoCliente = 'corporativo';
        console.log(`✅ Usando labels estándar: ${tipoCliente} (${labels})`);
      } else if (data['cliente_tipo_actualizado']) {
        labels = data['cliente_tipo_actualizado'];
        if (labels.includes('vip')) tipoCliente = 'vip';
        else if (labels.includes('corporativo')) tipoCliente = 'corporativo';
        console.log(`🔄 Usando tipo actualizado: ${tipoCliente} (${labels})`);
      } else {
        // Usar lógica original
        if (typeForm.includes('eventos')) tipoCliente = 'corporativo';
        else if (tipoInteraccion === 'reserva') tipoCliente = 'vip';
        else if (tipoInteraccion === 'manual') tipoCliente = 'regular';
        labels = `cliente_${tipoCliente},${tipoInteraccion}`;
        console.log(`📋 Usando lógica original: ${tipoCliente} (${labels})`);
      }
      
      // Verificar estado activo/inactivo
      let isActive = true;
      if (data.hasOwnProperty('cliente_activo')) {
        isActive = data['cliente_activo'] === true;
        console.log(`📊 Estado del cliente: ${isActive ? 'Activo' : 'Inactivo'}`);
      }

      const cliente: Cliente = {
        id: chatId,
        name: nombre,
        whatsAppName: nombre,
        email: email || '',
        isWAContact: isActive, // Usar estado activo para isWAContact
        isMyContact: true,
        sourceType: 'chatBot',
        respType: 'bot',
        labels: labels || `cliente_${tipoCliente},${tipoInteraccion}`,
        creation: new Date(timestamp).toISOString(),
        lastUpdate: new Date().toISOString(),
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
          fee: this.calcularFee(tipoInteraccion)
        }
      };
      
      // Agregar campos específicos según el tipo
      if (typeForm.includes('eventos')) {
        cliente.isEnterprise = true;
        cliente.isBusiness = true;
      }
      
      return cliente;
    } catch (error) {
      console.error('Error extrayendo info del cliente:', error);
      return null;
    }
  }

  /**
   * Calcular fee aproximado basado en el tipo de interacción
   */
  private calcularFee(tipoInteraccion: string): number {
    switch (tipoInteraccion) {
      case 'evento': return Math.floor(Math.random() * 5000) + 10000; // 10,000 - 15,000
      case 'reserva': return Math.floor(Math.random() * 3000) + 2000; // 2,000 - 5,000
      case 'asesoria': return Math.floor(Math.random() * 1000) + 500; // 500 - 1,500
      default: return 0;
    }
  }


  /**
   * Obtener cliente por ID (NUEVA ARQUITECTURA)
   */
  async obtenerPorId(id: string): Promise<Cliente | null> {
    try {
      console.log(`🔍 ClienteService.obtenerPorId() - Buscando cliente: ${id}`);
      
      const nombreRestaurante = this.getRestauranteActualNombre();
      const app = getApp();
      const db = getFirestore(app);
      
      // ARQUITECTURA CORRECTA: Buscar directamente en /clients/{nombreRestaurante}/Formularios/clientes/
      try {
        const clientesPath = this.getClientesPath(nombreRestaurante);
        const clienteDocRef = doc(db, clientesPath, id);
        const docSnap = await getDoc(clienteDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const cliente = this.mapearDocumentoACliente(id, data);
          if (cliente) {
            console.log(`✅ Cliente encontrado en ARQUITECTURA CORRECTA: ${cliente.name}`);
            return cliente;
          }
        }
      } catch (error) {
        console.log(`⚠️ No encontrado en arquitectura correcta, buscando en compatibilidad...`);
      }
      
      // COMPATIBILIDAD: Buscar entre todos los clientes de estructura antigua
      console.log(`🔄 Buscando en estructura de compatibilidad...`);
      const clientes = await this.obtenerTodos();
      const clienteEncontrado = clientes.find(cliente => cliente.id === id) || null;
      
      if (clienteEncontrado) {
        console.log(`✅ Cliente encontrado en COMPATIBILIDAD: ${clienteEncontrado.name}`);
      } else {
        console.log(`❌ Cliente no encontrado en ninguna estructura`);
      }
      
      return clienteEncontrado;
    } catch (error) {
      console.error('Error obteniendo cliente por ID:', error);
      return null;
    }
  }

  /**
   * Crear nuevo cliente (NUEVA ARQUITECTURA)
   * Se almacena directamente en /clients/{restauranteId}/data/clientes/
   */
  async crear(cliente: Partial<Cliente>): Promise<Cliente> {
    try {
      console.log('🔥 ClienteService.crear() - Creando cliente con ARQUITECTURA CORRECTA...');
      console.log('📝 Datos recibidos:', cliente);

      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      const nuevoCliente: Cliente = {
        ...cliente,
        id: cliente.id || Date.now().toString(),
        name: cliente.name || '',
        whatsAppName: cliente.whatsAppName || cliente.name || '',
        email: cliente.email || '',
        isWAContact: cliente.isWAContact ?? true,
        isMyContact: cliente.isMyContact ?? true,
        sourceType: cliente.sourceType || 'manual',
        respType: cliente.respType || 'manual',
        labels: cliente.labels || 'cliente_nuevo',
        creation: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        userInteractions: cliente.userInteractions || {
          whatsapp: 0,
          controller: 1,
          chatbot: 0,
          api: 0,
          campaing: 0,
          client: 1,
          others: 0,
          wappController: 1,
          ai: 0,
          fee: 0
        }
      };

      const app = getApp();
      const db = getFirestore(app);
      
      // ARQUITECTURA CORRECTA: Guardar en /clients/{nombreRestaurante}/Formularios/clientes/
      const clientesPath = this.getClientesPath(nombreRestaurante);
      const clienteId = nuevoCliente.id!; // Using non-null assertion since we guarantee id exists above
      const clienteDocRef = doc(db, clientesPath, clienteId);
      
      console.log(`📍 ARQUITECTURA CORRECTA - Guardando en: ${this.getClientesPath(nombreRestaurante)}/${nuevoCliente.id}`);
      await setDoc(clienteDocRef, nuevoCliente);
      
      // COMPATIBILIDAD: También crear en estructura antigua para migración gradual
      const rutaCompatibilidad = this.getFormulariosPath();
      const timestamp = Date.now();
      const docIdCompatibilidad = `${timestamp}_cliente_${nuevoCliente.id}`;
      
      const datosFormularioCompatibilidad = {
        typeForm: 'cliente',
        restauranteId: restauranteId,
        chatId: nuevoCliente.id,
        timestamp: timestamp,
        nombre: nuevoCliente.name,
        email: nuevoCliente.email || '',
        tipoCliente: nuevoCliente.labels?.includes('vip') ? 'VIP' : 'Regular',
        labels: nuevoCliente.labels,
        activo: true,
        fechaCreacion: new Date(),
        source: 'manual_creation'
      };

      const clienteCompatibilidadRef = doc(db, rutaCompatibilidad, docIdCompatibilidad);
      await setDoc(clienteCompatibilidadRef, datosFormularioCompatibilidad);
      
      console.log('✅ Cliente creado exitosamente en AMBAS ESTRUCTURAS');
      console.log(`   🏗️ ARQUITECTURA CORRECTA: ${this.getClientesPath(nombreRestaurante)}/${nuevoCliente.id}`);
      console.log(`   🔄 COMPATIBILIDAD: ${rutaCompatibilidad}/${docIdCompatibilidad}`);
      console.log(`   👤 Nombre: ${nuevoCliente.name}`);
      
      return nuevoCliente;
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      console.error('🔍 Detalles del error:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      throw error;
    }
  }

  /**
   * Actualizar cliente existente (NUEVA ARQUITECTURA)
   */
  async actualizar(id: string, cambios: Partial<Cliente>): Promise<Cliente> {
    try {
      console.log('🔥 ClienteService.actualizar() - Actualizando cliente con ARQUITECTURA CORRECTA:', id);
      console.log('📝 Cambios solicitados:', cambios);

      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      const app = getApp();
      const db = getFirestore(app);
      
      // Obtener cliente actual
      const clienteActual = await this.obtenerPorId(id);
      if (!clienteActual) {
        throw new Error(`No se encontró cliente con ID: ${id}`);
      }
      
      // Crear cliente actualizado
      const clienteActualizado: Cliente = {
        ...clienteActual,
        ...cambios,
        lastUpdate: new Date().toISOString()
      };
      
      let actualizado = false;
      
      // ARQUITECTURA CORRECTA: Actualizar en /clients/{nombreRestaurante}/Formularios/clientes/
      try {
        const clientesPath = this.getClientesPath(nombreRestaurante);
        const clienteDocRef = doc(db, clientesPath, id);
        const docSnap = await getDoc(clienteDocRef);
        
        if (docSnap.exists()) {
          await setDoc(clienteDocRef, clienteActualizado);
          console.log(`✅ Cliente actualizado en ARQUITECTURA CORRECTA`);
          actualizado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error actualizando en arquitectura correcta:`, error);
      }
      
      // COMPATIBILIDAD: Actualizar también en estructura antigua si existe
      try {
        const formulariosRef = collection(db, this.getFormulariosPath());
        const snapshot = await getDocs(formulariosRef);
        
        let documentoCompatibilidad: any = null;
        
        snapshot.forEach(doc => {
          const docId = doc.id;
          const parts = docId.split('_');
          if (parts.length >= 3) {
            const chatId = parts[parts.length - 1];
            if (chatId === id) {
              documentoCompatibilidad = { id: docId, data: doc.data() };
            }
          }
        });

        if (documentoCompatibilidad) {
          console.log('🔄 COMPATIBILIDAD - Actualizando estructura antigua...');
          
          const datosActualizados = { ...documentoCompatibilidad.data };
          datosActualizados.lastUpdate = new Date().toISOString();
          
          // Actualizar campos según el tipo de formulario
          if (documentoCompatibilidad.data.typeForm === 'cliente') {
            if (cambios.name) datosActualizados['nombre'] = cambios.name;
            if (cambios.email) datosActualizados['email'] = cambios.email;
            if (cambios.labels) {
              const tipoCliente = cambios.labels.includes('vip') ? 'VIP' : 
                                 cambios.labels.includes('corporativo') ? 'Corporativo' : 'Regular';
              datosActualizados['tipoCliente'] = tipoCliente;
              datosActualizados['labels'] = cambios.labels;
            }
          } else {
            // Enfoque conservador para otros tipos
            if (cambios.name) datosActualizados['cliente_nombre_actualizado'] = cambios.name;
            if (cambios.email) datosActualizados['cliente_email_actualizado'] = cambios.email;
            if (cambios.labels) {
              datosActualizados['cliente_tipo_actualizado'] = cambios.labels;
              datosActualizados['labels'] = cambios.labels;
            }
          }

          const formulariosPath = this.getFormulariosPath();
          const clienteCompatibilidadRef = doc(db, formulariosPath, documentoCompatibilidad.id);
          await setDoc(clienteCompatibilidadRef, datosActualizados);
          console.log(`✅ COMPATIBILIDAD - Cliente actualizado en estructura antigua`);
          actualizado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error actualizando compatibilidad:`, error);
      }
      
      if (!actualizado) {
        throw new Error('No se pudo actualizar el cliente en ninguna estructura');
      }
      
      console.log('✅ Cliente actualizado exitosamente en todas las estructuras disponibles');
      return clienteActualizado;
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      throw error;
    }
  }

  /**
   * Eliminar cliente (NUEVA ARQUITECTURA)
   */
  async eliminar(id: string): Promise<void> {
    try {
      console.log('🔥 ClienteService.eliminar() - Eliminando cliente con ARQUITECTURA CORRECTA:', id);

      const nombreRestaurante = this.getRestauranteActualNombre();
      const restauranteId = this.getRestauranteActualId(); // Para compatibilidad
      const app = getApp();
      const db = getFirestore(app);
      
      let eliminado = false;
      
      // ARQUITECTURA CORRECTA: Eliminar de /clients/{nombreRestaurante}/Formularios/clientes/
      try {
        const clientesPath = this.getClientesPath(nombreRestaurante);
        const clienteDocRef = doc(db, clientesPath, id);
        const docSnap = await getDoc(clienteDocRef);
        
        if (docSnap.exists()) {
          await deleteDoc(clienteDocRef);
          console.log(`✅ Cliente eliminado de ARQUITECTURA CORRECTA`);
          eliminado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error eliminando de arquitectura correcta:`, error);
      }
      
      // COMPATIBILIDAD: Eliminar también de estructura antigua
      try {
        const formulariosRef = collection(db, this.getFormulariosPath());
        const snapshot = await getDocs(formulariosRef);
        
        const documentosAEliminar: string[] = [];
        
        snapshot.forEach(doc => {
          const docId = doc.id;
          const parts = docId.split('_');
          if (parts.length >= 3) {
            const chatId = parts[parts.length - 1];
            if (chatId === id) {
              documentosAEliminar.push(docId);
            }
          }
        });

        // Eliminar todos los documentos asociados en estructura antigua
        for (const docId of documentosAEliminar) {
          const formulariosPath = this.getFormulariosPath();
          const clienteDocRef = doc(db, formulariosPath, docId);
          await deleteDoc(clienteDocRef);
          console.log(`✅ COMPATIBILIDAD - Documento eliminado: ${docId}`);
          eliminado = true;
        }
      } catch (error) {
        console.log(`⚠️ Error eliminando compatibilidad:`, error);
      }
      
      if (!eliminado) {
        throw new Error(`No se encontró cliente para eliminar con ID: ${id}`);
      }
      
      console.log(`✅ Cliente eliminado completamente de todas las estructuras: ${id}`);
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      throw error;
    }
  }

  /**
   * Obtener clientes filtrados por tipo específico de formulario
   */
  async obtenerPorTipoFormulario(tipoFormulario: string): Promise<Cliente[]> {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const formulariosRef = collection(db, this.getFormulariosPath());
      const q = query(formulariosRef, where('typeForm', '==', tipoFormulario));
      const snapshot = await getDocs(q);
      
      const clientes: Cliente[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        const parts = docId.split('_');
        
        if (parts.length >= 3) {
          const chatId = parts[parts.length - 1];
          const typeForm = parts.slice(1, -1).join('_');
          const timestamp = parseInt(parts[0]);
          
          const clienteInfo = this.extraerInfoCliente(data, typeForm, chatId, timestamp);
          if (clienteInfo) {
            clientes.push(clienteInfo);
          }
        }
      });
      
      return clientes;
    } catch (error) {
      console.error('Error obteniendo clientes por tipo de formulario:', error);
      return [];
    }
  }

  /**
   * Métodos específicos para gestión de clientes
   */

  /**
   * Convertir cliente a VIP
   */
  async convertirAVip(id: string): Promise<Cliente> {
    try {
      console.log('🌟 Convirtiendo cliente a VIP:', id);
      return await this.actualizar(id, {
        labels: 'cliente_vip,premium'
      });
    } catch (error) {
      console.error('❌ Error convirtiendo cliente a VIP:', error);
      throw error;
    }
  }

  /**
   * Convertir cliente a corporativo
   */
  async convertirACorporativo(id: string): Promise<Cliente> {
    try {
      console.log('🏢 Convirtiendo cliente a corporativo:', id);
      return await this.actualizar(id, {
        labels: 'cliente_corporativo,empresa'
      });
    } catch (error) {
      console.error('❌ Error convirtiendo cliente a corporativo:', error);
      throw error;
    }
  }

  /**
   * Inactivar cliente (no eliminarlo, sino marcarlo como inactivo)
   */
  async inactivarCliente(id: string): Promise<Cliente> {
    try {
      console.log('⏸️ Inactivando cliente:', id);
      
      // Buscar el documento del formulario
      const app = getApp();
      const db = getFirestore(app);
      const formulariosRef = collection(db, this.getFormulariosPath());
      const snapshot = await getDocs(formulariosRef);
      
      let documentoEncontrado: any = null;
      
      snapshot.forEach(doc => {
        const docId = doc.id;
        const parts = docId.split('_');
        if (parts.length >= 3) {
          const chatId = parts[parts.length - 1];
          if (chatId === id) {
            documentoEncontrado = { id: docId, data: doc.data() };
          }
        }
      });

      if (!documentoEncontrado) {
        throw new Error(`No se encontró formulario para el cliente con ID: ${id}`);
      }

      // Marcar como inactivo
      const datosActualizados = { ...documentoEncontrado.data };
      datosActualizados.cliente_activo = false;
      datosActualizados.fecha_inactivacion = new Date().toISOString();
      datosActualizados.lastUpdate = new Date().toISOString();

      const formulariosPath = this.getFormulariosPath();
      const clienteDocRef = doc(db, formulariosPath, documentoEncontrado.id);
      await setDoc(clienteDocRef, datosActualizados);
      
      console.log('✅ Cliente inactivado exitosamente');
      
      // Retornar cliente actualizado
      const clienteActualizado = await this.obtenerPorId(id);
      if (!clienteActualizado) {
        throw new Error('Error obteniendo cliente actualizado');
      }
      return clienteActualizado;
    } catch (error) {
      console.error('❌ Error inactivando cliente:', error);
      throw error;
    }
  }

  /**
   * Reactivar cliente
   */
  async reactivarCliente(id: string): Promise<Cliente> {
    try {
      console.log('▶️ Reactivando cliente:', id);
      
      // Buscar el documento del formulario
      const app = getApp();
      const db = getFirestore(app);
      const formulariosRef = collection(db, this.getFormulariosPath());
      const snapshot = await getDocs(formulariosRef);
      
      let documentoEncontrado: any = null;
      
      snapshot.forEach(doc => {
        const docId = doc.id;
        const parts = docId.split('_');
        if (parts.length >= 3) {
          const chatId = parts[parts.length - 1];
          if (chatId === id) {
            documentoEncontrado = { id: docId, data: doc.data() };
          }
        }
      });

      if (!documentoEncontrado) {
        throw new Error(`No se encontró formulario para el cliente con ID: ${id}`);
      }

      // Marcar como activo
      const datosActualizados = { ...documentoEncontrado.data };
      datosActualizados.cliente_activo = true;
      datosActualizados.fecha_reactivacion = new Date().toISOString();
      datosActualizados.lastUpdate = new Date().toISOString();
      
      // Remover fecha de inactivación si existe
      if (datosActualizados.fecha_inactivacion) {
        delete datosActualizados.fecha_inactivacion;
      }

      const formulariosPath = this.getFormulariosPath();
      const clienteDocRef = doc(db, formulariosPath, documentoEncontrado.id);
      await setDoc(clienteDocRef, datosActualizados);
      
      console.log('✅ Cliente reactivado exitosamente');
      
      // Retornar cliente actualizado
      const clienteActualizado = await this.obtenerPorId(id);
      if (!clienteActualizado) {
        throw new Error('Error obteniendo cliente actualizado');
      }
      return clienteActualizado;
    } catch (error) {
      console.error('❌ Error reactivando cliente:', error);
      throw error;
    }
  }
}