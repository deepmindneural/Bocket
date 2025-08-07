import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../modelos';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  // Obtener la ruta de la colección basada en el restaurante actual (ARQUITECTURA CORRECTA)
  private getCollectionPath(): string {
    const restauranteActual = this.authService.obtenerRestauranteActual();
    if (!restauranteActual?.nombre) {
      throw new Error('No hay restaurante actual seleccionado');
    }
    // ARQUITECTURA CORRECTA: usar nombre del restaurante
    return `clients/${restauranteActual.nombre}/productos`;
  }

  // CRUD: Obtener todos los productos
  async obtenerTodos(): Promise<Producto[]> {
    const collectionPath = this.getCollectionPath();
    const snapshot = await this.firestore.collection(collectionPath).get().toPromise();
    
    if (!snapshot) return [];
    
    const productosFirebase = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    } as Producto));
    
    return productosFirebase;
  }

  // CRUD: Obtener productos como Observable (para tiempo real)
  obtenerTodosObservable(): Observable<Producto[]> {
    const collectionPath = this.getCollectionPath();
    return this.firestore.collection(collectionPath)
      .valueChanges({ idField: 'id' }) as Observable<Producto[]>;
  }

  // CRUD: Obtener producto por ID
  async obtenerPorId(id: string): Promise<Producto | null> {
    const collectionPath = this.getCollectionPath();
    const doc = await this.firestore.collection(collectionPath).doc(id).get().toPromise();
    
    if (doc && doc.exists) {
      return { id: doc.id, ...(doc.data() as any) } as Producto;
    }
    
    return null;
  }

  // CRUD: Crear nuevo producto
  async crear(producto: Partial<Producto>): Promise<Producto> {
    const restauranteActual = this.authService.obtenerRestauranteActual();
    if (!restauranteActual?.nombre) {
      throw new Error('No hay restaurante actual seleccionado');
    }

    const nuevoProducto: Producto = {
      id: producto.id || Date.now().toString(),
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio || 0,
      categoria: producto.categoria || { id: 'general', nombre: 'General', orden: 1, activa: true },
      disponible: producto.disponible ?? true,
      enStock: producto.enStock ?? true,
      requierePreparacion: producto.requierePreparacion ?? true,
      permiteModificaciones: producto.permiteModificaciones ?? false,
      imagen: producto.imagen || '',
      ingredientes: producto.ingredientes || [],
      tiempoPreparacion: producto.tiempoPreparacion || 15,
      calorias: producto.calorias || 0,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      creadoPor: 'sistema',
      activo: true,
      ...producto
    };

    const collectionPath = this.getCollectionPath();
    await this.firestore.collection(collectionPath).doc(nuevoProducto.id).set(nuevoProducto);
    console.log('Producto creado en Firebase:', nuevoProducto);

    return nuevoProducto;
  }

  // CRUD: Actualizar producto
  async actualizar(id: string, cambios: Partial<Producto>): Promise<Producto> {
    const producto = await this.obtenerPorId(id);
    if (!producto) throw new Error('Producto no encontrado');

    const productoActualizado = {
      ...producto,
      ...cambios,
      fechaActualizacion: new Date()
    };

    const collectionPath = this.getCollectionPath();
    await this.firestore.collection(collectionPath).doc(id).update({
      ...cambios,
      fechaActualizacion: new Date().toISOString()
    });
    console.log('Producto actualizado en Firebase:', productoActualizado);

    return productoActualizado;
  }

  // CRUD: Eliminar producto
  async eliminar(id: string): Promise<void> {
    const collectionPath = this.getCollectionPath();
    await this.firestore.collection(collectionPath).doc(id).delete();
    console.log('Producto eliminado de Firebase:', id);
  }


  // Métodos auxiliares
  async obtenerPorCategoria(categoriaId: string): Promise<Producto[]> {
    const productos = await this.obtenerTodos();
    return productos.filter(p => p.categoria.id === categoriaId);
  }

  async buscarProductos(termino: string): Promise<Producto[]> {
    const productos = await this.obtenerTodos();
    const terminoLower = termino.toLowerCase();
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(terminoLower) ||
      p.descripcion.toLowerCase().includes(terminoLower) ||
      p.categoria.nombre.toLowerCase().includes(terminoLower)
    );
  }

  async obtenerCategorias(): Promise<string[]> {
    const productos = await this.obtenerTodos();
    const categorias = [...new Set(productos.map(p => p.categoria.nombre))];
    return categorias.sort();
  }
}