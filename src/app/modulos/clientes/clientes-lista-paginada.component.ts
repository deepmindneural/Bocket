import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Cliente } from '../../modelos';
import { ClientePaginadoService, PaginationState } from '../../servicios/cliente-paginado.service';
import { Subscription } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-clientes-lista-paginada',
  templateUrl: './clientes-lista-paginada.component.html',
  styleUrls: ['./clientes-lista-paginada.component.scss'],
  standalone: false
})
export class ClientesListaPaginadaComponent implements OnInit, OnDestroy {

  // Datos y estado
  clientes: Cliente[] = [];
  paginationState!: PaginationState;
  terminoBusqueda: string = '';
  
  // Opciones de paginación
  opcionesTamanoPagina = [10, 20, 30, 50];
  
  // Suscripciones
  private clientesSub!: Subscription;
  private paginationSub!: Subscription;
  
  // Filtros
  filtroTipo: string = 'todos';
  filtrosAplicados = {
    tipo: 'todos',
    estado: 'todos',
    fechaDesde: null,
    fechaHasta: null
  };

  constructor(
    private router: Router,
    private clientePaginadoService: ClientePaginadoService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    // Suscribirse a los cambios de clientes
    this.clientesSub = this.clientePaginadoService.clientes$.subscribe(
      clientes => {
        this.clientes = clientes;
      }
    );
    
    // Suscribirse al estado de paginación
    this.paginationSub = this.clientePaginadoService.paginationState$.subscribe(
      state => {
        this.paginationState = state;
      }
    );
    
    // Cargar primera página
    await this.cargarPrimerasPagina();
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.clientesSub) {
      this.clientesSub.unsubscribe();
    }
    if (this.paginationSub) {
      this.paginationSub.unsubscribe();
    }
  }

  // Métodos de paginación
  async cargarPrimerasPagina() {
    try {
      await this.clientePaginadoService.cargarPrimerasPagina();
    } catch (error) {
      await this.mostrarError('Error al cargar clientes');
    }
  }

  async siguientePagina() {
    if (!this.paginationState.hasNext || this.paginationState.isLoading) {
      return;
    }
    
    try {
      await this.clientePaginadoService.cargarSiguientePagina();
    } catch (error) {
      await this.mostrarError('Error al cargar siguiente página');
    }
  }

  async paginaAnterior() {
    if (!this.paginationState.hasPrevious || this.paginationState.isLoading) {
      return;
    }
    
    const paginaAnterior = this.paginationState.currentPage - 1;
    try {
      await this.clientePaginadoService.irAPagina(paginaAnterior);
    } catch (error) {
      await this.mostrarError('Error al cargar página anterior');
    }
  }

  async irAPagina(numeroPagina: number) {
    try {
      await this.clientePaginadoService.irAPagina(numeroPagina);
    } catch (error) {
      await this.mostrarError('Error al navegar a la página');
    }
  }

  async cambiarTamanoPagina(event: any) {
    const nuevoTamano = parseInt(event.detail.value);
    try {
      await this.clientePaginadoService.cambiarTamanoPagina(nuevoTamano);
    } catch (error) {
      await this.mostrarError('Error al cambiar tamaño de página');
    }
  }

  // Búsqueda
  async buscarClientes(event: any) {
    const termino = event.target.value;
    this.terminoBusqueda = termino;
    
    // Debounce para evitar muchas búsquedas
    clearTimeout(this.busquedaTimeout);
    this.busquedaTimeout = setTimeout(async () => {
      try {
        await this.clientePaginadoService.buscarClientes(termino);
      } catch (error) {
        await this.mostrarError('Error al buscar clientes');
      }
    }, 300);
  }
  private busquedaTimeout: any;

  // Refrescar
  async refrescar(event?: any) {
    try {
      await this.clientePaginadoService.refrescarPaginaActual();
      await this.mostrarMensaje('Datos actualizados');
    } catch (error) {
      await this.mostrarError('Error al refrescar');
    } finally {
      if (event) {
        event.target.complete();
      }
    }
  }

  // Navegación
  verDetalleCliente(cliente: Cliente) {
    this.router.navigate(['/clientes', cliente.id]);
  }

  nuevoCliente() {
    this.router.navigate(['/clientes/nuevo']);
  }

  editarCliente(cliente: Cliente) {
    this.router.navigate(['/clientes', cliente.id, 'editar']);
  }

  async eliminarCliente(cliente: Cliente) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de eliminar a ${cliente.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              // Aquí llamarías al servicio para eliminar
              await this.mostrarMensaje('Cliente eliminado correctamente');
              await this.refrescar();
            } catch (error) {
              await this.mostrarError('Error al eliminar cliente');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Utilidades UI
  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

  // Helpers
  obtenerResumenPaginacion(): string {
    return this.clientePaginadoService.obtenerResumenPaginacion();
  }

  generarArrayPaginas(): number[] {
    const paginas: number[] = [];
    const totalPaginas = this.paginationState.totalPages;
    const paginaActual = this.paginationState.currentPage;
    
    // Mostrar máximo 5 páginas
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, paginaActual + 2);
    
    // Ajustar para siempre mostrar 5 páginas si es posible
    if (fin - inicio < 4) {
      if (inicio === 1) {
        fin = Math.min(5, totalPaginas);
      } else if (fin === totalPaginas) {
        inicio = Math.max(1, totalPaginas - 4);
      }
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  calcularTotalInteracciones(cliente: Cliente): number {
    if (!cliente.userInteractions) return 0;
    
    const interactions = cliente.userInteractions;
    return (interactions.whatsapp || 0) + 
           (interactions.controller || 0) + 
           (interactions.chatbot || 0) + 
           (interactions.api || 0) + 
           (interactions.campaing || 0) + 
           (interactions.client || 0) + 
           (interactions.others || 0) + 
           (interactions.wappController || 0) + 
           (interactions.ai || 0);
  }

  obtenerEtiquetas(labels: string): string[] {
    if (!labels) return [];
    return labels.split(',').map(l => l.trim()).filter(l => l);
  }

  obtenerColorEtiqueta(etiqueta: string): string {
    const colores: { [key: string]: string } = {
      'cliente_vip': 'warning',
      'frecuente': 'success',
      'nuevo': 'primary',
      'empresa': 'tertiary',
      'inactivo': 'medium'
    };
    
    return colores[etiqueta] || 'secondary';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO');
  }

  // Acciones rápidas
  async enviarWhatsApp(cliente: Cliente) {
    const numero = cliente.id.replace(/\D/g, '');
    const url = `https://wa.me/${numero}`;
    window.open(url, '_blank');
  }

  async enviarEmail(cliente: Cliente) {
    if (cliente.email) {
      window.location.href = `mailto:${cliente.email}`;
    }
  }

  // Aplicar filtros avanzados
  async aplicarFiltros() {
    // Implementar lógica de filtros
    await this.mostrarMensaje('Filtros aplicados');
  }

  limpiarFiltros() {
    this.filtrosAplicados = {
      tipo: 'todos',
      estado: 'todos',
      fechaDesde: null,
      fechaHasta: null
    };
    this.terminoBusqueda = '';
    this.cargarPrimerasPagina();
  }
}