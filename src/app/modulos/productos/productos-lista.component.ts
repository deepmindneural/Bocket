import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../modelos';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-productos-lista',
  templateUrl: './productos-lista.component.html',
  styleUrls: ['./productos-lista.component.scss'],
  standalone: false
})
export class ProductosListaComponent implements OnInit {

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  cargando = true;
  error: string | null = null;
  
  // Filtros
  terminoBusqueda = '';
  filtroCategoria = 'todas';
  filtroDisponible = 'todos';
  
  // Paginación
  paginaActual = 1;
  productosPorPagina = 12;
  totalProductos = 0;

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarProductos();
  }

  async cargarProductos() {
    try {
      this.cargando = true;
      this.productos = await this.productoService.obtenerTodos();
      this.totalProductos = this.productos.length;
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando productos:', error);
      this.error = 'Error al cargar los productos';
    } finally {
      this.cargando = false;
    }
  }

  aplicarFiltros() {
    let productosFiltrados = [...this.productos];

    // Filtro por búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.nombre.toLowerCase().includes(termino) ||
        producto.descripcion.toLowerCase().includes(termino) ||
        producto.categoria.nombre.toLowerCase().includes(termino)
      );
    }

    // Filtro por categoría
    if (this.filtroCategoria !== 'todas') {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.categoria.id === this.filtroCategoria
      );
    }

    // Filtro por disponibilidad
    if (this.filtroDisponible !== 'todos') {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.disponible === (this.filtroDisponible === 'disponible')
      );
    }

    this.productosFiltrados = productosFiltrados;
    this.totalProductos = productosFiltrados.length;
    this.paginaActual = 1; // Resetear paginación
  }

  obtenerProductosPagina(): Producto[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  obtenerTotalPaginas(): number {
    return Math.ceil(this.totalProductos / this.productosPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.obtenerTotalPaginas()) {
      this.paginaActual = pagina;
    }
  }

  nuevoProducto() {
    this.router.navigate(['/productos/nuevo']);
  }

  editarProducto(producto: Producto) {
    this.router.navigate(['/productos', producto.id, 'editar']);
  }

  async eliminarProducto(producto: Producto) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de eliminar el producto "${producto.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.productoService.eliminar(producto.id!);
              await this.cargarProductos();
              await this.presentToast('Producto eliminado correctamente', 'success');
            } catch (error) {
              console.error('Error eliminando producto:', error);
              await this.presentToast('Error al eliminar el producto', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleDisponibilidad(producto: Producto) {
    try {
      await this.productoService.actualizar(producto.id!, { 
        disponible: !producto.disponible 
      });
      await this.cargarProductos();
      await this.presentToast(
        `Producto ${producto.disponible ? 'desactivado' : 'activado'} correctamente`,
        'success'
      );
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      await this.presentToast('Error al actualizar la disponibilidad', 'danger');
    }
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  obtenerClaseDisponibilidad(disponible: boolean): string {
    return disponible ? 'disponible' : 'no-disponible';
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }
}