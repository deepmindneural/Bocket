import { Injectable } from '@angular/core';
import { Cliente } from '../modelos';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

// Import Firebase SDK nativo
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  DocumentSnapshot,
  QueryConstraint,
  where,
  DocumentData
} from 'firebase/firestore';
import { getApp } from 'firebase/app';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientePaginadoService {
  
  private clientesSubject = new BehaviorSubject<Cliente[]>([]);
  public clientes$ = this.clientesSubject.asObservable();
  
  private paginationStateSubject = new BehaviorSubject<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    isLoading: false
  });
  public paginationState$ = this.paginationStateSubject.asObservable();
  
  private lastDocuments: Map<number, DocumentSnapshot> = new Map();
  private allClientes: Cliente[] = []; // Cache para búsqueda
  
  constructor(
    private authService: AuthService
  ) {}

  /**
   * Carga la primera página de clientes (ARQUITECTURA CORRECTA)
   */
  async cargarPrimerasPagina(pageSize: number = 10): Promise<void> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.nombre) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      this.actualizarEstadoPaginacion({ isLoading: true, pageSize });

      const app = getApp();
      const db = getFirestore(app);
      // ARQUITECTURA CORRECTA: usar nombre del restaurante
      const clientesRef = collection(db, `clients/${restauranteActual.nombre}/clientes`);
      
      // Query con límite y ordenamiento
      const q = query(
        clientesRef,
        orderBy('creation', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      const clientes: Cliente[] = [];
      
      snapshot.forEach(doc => {
        clientes.push({ id: doc.id, ...doc.data() } as Cliente);
      });
      
      // Guardar el último documento para paginación
      if (!snapshot.empty) {
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        this.lastDocuments.set(1, lastDoc);
      }
      
      // Obtener total de items para calcular páginas
      const totalSnapshot = await getDocs(clientesRef);
      const totalItems = totalSnapshot.size;
      
      this.clientesSubject.next(clientes);
      this.actualizarEstadoPaginacion({
        currentPage: 1,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        hasNext: clientes.length === pageSize,
        hasPrevious: false,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Error cargando primera página:', error);
      this.actualizarEstadoPaginacion({ isLoading: false });
      throw error;
    }
  }

  /**
   * Carga la siguiente página
   */
  async cargarSiguientePagina(): Promise<void> {
    const currentState = this.paginationStateSubject.value;
    
    if (!currentState.hasNext || currentState.isLoading) {
      return;
    }

    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.nombre) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      this.actualizarEstadoPaginacion({ isLoading: true });

      const app = getApp();
      const db = getFirestore(app);
      // ARQUITECTURA CORRECTA: usar nombre del restaurante
      const clientesRef = collection(db, `clients/${restauranteActual.nombre}/clientes`);
      
      const lastDoc = this.lastDocuments.get(currentState.currentPage);
      if (!lastDoc) {
        throw new Error('No se encontró el documento de referencia');
      }
      
      const q = query(
        clientesRef,
        orderBy('creation', 'desc'),
        startAfter(lastDoc),
        limit(currentState.pageSize)
      );
      
      const snapshot = await getDocs(q);
      const clientes: Cliente[] = [];
      
      snapshot.forEach(doc => {
        clientes.push({ id: doc.id, ...doc.data() } as Cliente);
      });
      
      if (!snapshot.empty) {
        const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
        const nextPage = currentState.currentPage + 1;
        this.lastDocuments.set(nextPage, newLastDoc);
      }
      
      this.clientesSubject.next(clientes);
      this.actualizarEstadoPaginacion({
        currentPage: currentState.currentPage + 1,
        hasNext: clientes.length === currentState.pageSize,
        hasPrevious: true,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Error cargando siguiente página:', error);
      this.actualizarEstadoPaginacion({ isLoading: false });
      throw error;
    }
  }

  /**
   * Ir a una página específica
   */
  async irAPagina(pageNumber: number): Promise<void> {
    const currentState = this.paginationStateSubject.value;
    
    if (pageNumber < 1 || pageNumber > currentState.totalPages) {
      return;
    }
    
    if (pageNumber === 1) {
      await this.cargarPrimerasPagina(currentState.pageSize);
      return;
    }
    
    // Para ir a una página específica, necesitamos cargar desde el inicio
    // hasta esa página (limitación de Firestore)
    try {
      this.actualizarEstadoPaginacion({ isLoading: true });
      
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.nombre) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      // ARQUITECTURA CORRECTA: usar nombre del restaurante
      const clientesRef = collection(db, `clients/${restauranteActual.nombre}/clientes`);
      
      // Calcular cuántos documentos saltar
      const skipCount = (pageNumber - 1) * currentState.pageSize;
      
      // Cargar todos los documentos hasta la página deseada
      const q = query(
        clientesRef,
        orderBy('creation', 'desc'),
        limit(skipCount + currentState.pageSize)
      );
      
      const snapshot = await getDocs(q);
      
      // Extraer solo los documentos de la página deseada
      const allDocs = snapshot.docs;
      const pageDocs = allDocs.slice(skipCount, skipCount + currentState.pageSize);
      
      const clientes: Cliente[] = pageDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Cliente));
      
      // Guardar el último documento
      if (pageDocs.length > 0) {
        const lastDoc = pageDocs[pageDocs.length - 1];
        this.lastDocuments.set(pageNumber, lastDoc);
      }
      
      this.clientesSubject.next(clientes);
      this.actualizarEstadoPaginacion({
        currentPage: pageNumber,
        hasNext: pageDocs.length === currentState.pageSize,
        hasPrevious: pageNumber > 1,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Error navegando a página:', error);
      this.actualizarEstadoPaginacion({ isLoading: false });
      throw error;
    }
  }

  /**
   * Buscar clientes con paginación
   */
  async buscarClientes(termino: string, pageSize: number = 10): Promise<void> {
    if (!termino.trim()) {
      await this.cargarPrimerasPagina(pageSize);
      return;
    }

    try {
      this.actualizarEstadoPaginacion({ isLoading: true });
      
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.nombre) {
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      // ARQUITECTURA CORRECTA: usar nombre del restaurante
      const clientesRef = collection(db, `clients/${restauranteActual.nombre}/clientes`);
      
      // Firestore no soporta búsqueda de texto completo nativamente
      // Necesitamos cargar todos y filtrar localmente
      const snapshot = await getDocs(clientesRef);
      const todosClientes: Cliente[] = [];
      
      snapshot.forEach(doc => {
        todosClientes.push({ id: doc.id, ...doc.data() } as Cliente);
      });
      
      // Filtrar localmente
      const terminoLower = termino.toLowerCase();
      const clientesFiltrados = todosClientes.filter(cliente => 
        cliente.name?.toLowerCase().includes(terminoLower) ||
        cliente.email?.toLowerCase().includes(terminoLower) ||
        cliente.phone?.includes(termino) ||
        cliente.whatsAppName?.toLowerCase().includes(terminoLower)
      );
      
      // Paginar resultados filtrados
      const totalItems = clientesFiltrados.length;
      const paginados = clientesFiltrados.slice(0, pageSize);
      
      this.clientesSubject.next(paginados);
      this.actualizarEstadoPaginacion({
        currentPage: 1,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        hasNext: paginados.length === pageSize,
        hasPrevious: false,
        isLoading: false
      });
      
      // Guardar para navegación posterior
      this.allClientes = clientesFiltrados;
      
    } catch (error) {
      console.error('Error buscando clientes:', error);
      this.actualizarEstadoPaginacion({ isLoading: false });
      throw error;
    }
  }

  /**
   * Cambiar tamaño de página
   */
  async cambiarTamanoPagina(nuevoTamano: number): Promise<void> {
    const currentState = this.paginationStateSubject.value;
    
    if (nuevoTamano === currentState.pageSize) {
      return;
    }
    
    // Recargar desde la primera página con el nuevo tamaño
    await this.cargarPrimerasPagina(nuevoTamano);
  }

  /**
   * Actualizar estado de paginación
   */
  private actualizarEstadoPaginacion(cambios: Partial<PaginationState>): void {
    const currentState = this.paginationStateSubject.value;
    this.paginationStateSubject.next({
      ...currentState,
      ...cambios
    });
  }

  /**
   * Refrescar página actual
   */
  async refrescarPaginaActual(): Promise<void> {
    const currentState = this.paginationStateSubject.value;
    await this.irAPagina(currentState.currentPage);
  }

  /**
   * Obtener resumen de paginación
   */
  obtenerResumenPaginacion(): string {
    const state = this.paginationStateSubject.value;
    const inicio = (state.currentPage - 1) * state.pageSize + 1;
    const fin = Math.min(state.currentPage * state.pageSize, state.totalItems);
    
    return `Mostrando ${inicio} - ${fin} de ${state.totalItems} clientes`;
  }

  /**
   * Resetear paginación
   */
  resetearPaginacion(): void {
    this.lastDocuments.clear();
    this.allClientes = [];
    this.clientesSubject.next([]);
    this.paginationStateSubject.next({
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
      isLoading: false
    });
  }
}