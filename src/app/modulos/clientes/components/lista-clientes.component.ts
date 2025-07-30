import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../../servicios/cliente.service';
import { Cliente } from '../../../modelos';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss'],
  standalone: false
})
export class ListaClientesComponent implements OnInit {

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  cargando = true;
  error: string | null = null;
  
  // Filtros
  terminoBusqueda = '';
  filtroEstado = 'todos';
  filtroTipo = 'todos';
  
  // Paginación
  paginaActual = 1;
  clientesPorPagina = 10;
  totalClientes = 0;

  // Getters para el template
  get clientesActivos(): number {
    return this.clientes.filter(c => c.isWAContact).length;
  }

  get clientesVIP(): number {
    return this.clientes.filter(c => this.getClienteType(c) === 'vip').length;
  }

  // Math para el template
  Math = Math;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarClientes();
  }

  async cargarClientes() {
    try {
      this.cargando = true;
      this.clientes = await this.clienteService.obtenerTodos();
      this.totalClientes = this.clientes.length;
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando clientes:', error);
      this.error = 'Error al cargar los clientes';
    } finally {
      this.cargando = false;
    }
  }

  aplicarFiltros() {
    let clientesFiltrados = [...this.clientes];

    // Filtro por búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        (cliente.name && cliente.name.toLowerCase().includes(termino)) ||
        (cliente.whatsAppName && cliente.whatsAppName.toLowerCase().includes(termino)) ||
        (cliente.email && cliente.email.toLowerCase().includes(termino)) ||
        (cliente.id && cliente.id.includes(termino))
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        cliente.isWAContact === (this.filtroEstado === 'activo')
      );
    }

    // Filtro por tipo
    if (this.filtroTipo !== 'todos') {
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        this.getClienteType(cliente) === this.filtroTipo
      );
    }

    this.clientesFiltrados = clientesFiltrados;
    this.totalClientes = clientesFiltrados.length;
    this.paginaActual = 1; // Resetear paginación
  }

  obtenerClientesPagina(): Cliente[] {
    const inicio = (this.paginaActual - 1) * this.clientesPorPagina;
    const fin = inicio + this.clientesPorPagina;
    return this.clientesFiltrados.slice(inicio, fin);
  }

  obtenerTotalPaginas(): number {
    return Math.ceil(this.totalClientes / this.clientesPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.obtenerTotalPaginas()) {
      this.paginaActual = pagina;
    }
  }

  verDetalleCliente(cliente: Cliente) {
    this.router.navigate(['/clientes', cliente.id]);
  }

  editarCliente(cliente: Cliente) {
    this.router.navigate(['/clientes', cliente.id, 'editar']);
  }

  async eliminarCliente(cliente: Cliente) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de eliminar al cliente ${cliente.name || cliente.whatsAppName}?`,
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
              await this.clienteService.eliminar(cliente.id!);
              await this.cargarClientes();
              await this.presentToast('Cliente eliminado correctamente', 'success');
            } catch (error) {
              console.error('Error eliminando cliente:', error);
              await this.presentToast('Error al eliminar el cliente', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  nuevoCliente() {
    this.router.navigate(['/clientes/nuevo']);
  }

  exportarClientes() {
    // TODO: Implementar exportación a Excel/CSV
    console.log('Exportar clientes:', this.clientesFiltrados);
  }

  formatearFecha(fecha: Date | string): string {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-CO');
  }

  getClienteType(cliente: Cliente): string {
    if (cliente.isEnterprise || cliente.isBusiness) return 'corporativo';
    if (cliente.userInteractions && cliente.userInteractions.fee && cliente.userInteractions.fee > 100000) return 'vip';
    return 'regular';
  }

  obtenerClaseTipo(tipo: string): string {
    return `tipo-${tipo}`;
  }

  obtenerEtiquetaTipoCliente(tipo: string): string {
    const etiquetas = {
      'vip': 'VIP',
      'corporativo': 'Corporativo',
      'regular': 'Regular'
    };
    return etiquetas[tipo as keyof typeof etiquetas] || 'Regular';
  }

  obtenerClaseEstado(activo: boolean | undefined): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
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