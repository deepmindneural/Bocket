import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cliente } from '../../modelos';
import { ClienteService } from '../../servicios/cliente.service';

@Component({
  selector: 'app-clientes-lista',
  templateUrl: './clientes-lista.component.html',
  styleUrls: ['./clientes-lista.component.scss'],
  standalone: false
})
export class ClientesListaComponent implements OnInit {

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  terminoBusqueda: string = '';
  filtroTipo: string = 'todos';
  clientesActivos: number = 0;
  clientesNuevosEsteMes: number = 0;

  // Datos usando interface finalUser (WhatsApp)
  clientesEjemplo: Cliente[] = [
    {
      id: '573001234567',
      name: 'María González',
      whatsAppName: 'María G.',
      email: 'maria.gonzalez@email.com',
      isWAContact: true,
      isMyContact: true,
      sourceType: 'chatBot',
      respType: 'bot',
      labels: 'cliente_vip,frecuente',
      creation: '2024-01-15T00:00:00.000Z',
      lastUpdate: new Date().toISOString(),
      userInteractions: {
        whatsapp: 45,
        controller: 12,
        chatbot: 23,
        api: 8,
        campaing: 3,
        client: 67,
        others: 2,
        wappController: 15,
        ai: 7,
        fee: 2450
      }
    },
    {
      id: '573109876543',
      name: 'Carlos Rodríguez',
      whatsAppName: 'Carlos R.',
      email: 'carlos.rodriguez@email.com',
      isWAContact: true,
      isMyContact: true,
      sourceType: 'manual',
      respType: 'manual',
      labels: 'cliente_regular',
      creation: '2024-02-10T00:00:00.000Z',
      lastUpdate: new Date().toISOString(),
      userInteractions: {
        whatsapp: 32,
        controller: 8,
        chatbot: 15,
        api: 5,
        campaing: 2,
        client: 45,
        others: 1,
        wappController: 10,
        ai: 4,
        fee: 890
      }
    },
    {
      id: '573155550000',
      name: 'Empresa ABC S.A.',
      whatsAppName: 'ABC Corp',
      email: 'contacto@empresaabc.com',
      isWAContact: true,
      isMyContact: true,
      isEnterprise: true,
      isBusiness: true,
      sourceType: 'manual',
      respType: 'manual',
      labels: 'cliente_corporativo,eventos',
      creation: '2024-01-20T00:00:00.000Z',
      lastUpdate: new Date().toISOString(),
      userInteractions: {
        whatsapp: 78,
        controller: 25,
        chatbot: 12,
        api: 15,
        campaing: 8,
        client: 98,
        others: 5,
        wappController: 32,
        ai: 18,
        fee: 15670
      }
    }
  ];

  constructor(
    private router: Router,
    private clienteService: ClienteService
  ) {}

  getClienteType(cliente: Cliente): string {
    if (cliente.isEnterprise || cliente.isBusiness) return 'corporativo';
    if (cliente.userInteractions && cliente.userInteractions.fee && cliente.userInteractions.fee > 5000) return 'vip';
    return 'regular';
  }

  ngOnInit() {
    this.cargarClientes();
    this.calcularEstadisticas();
  }

  async cargarClientes() {
    try {
      // Cargar clientes del servicio real
      this.clientes = await this.clienteService.obtenerTodos();
      if (this.clientes.length === 0) {
        // Si no hay datos, usar datos de ejemplo
        this.clientes = this.clientesEjemplo;
      }
      this.clientesFiltrados = [...this.clientes];
    } catch (error) {
      console.error('Error cargando clientes:', error);
      // Usar datos de ejemplo como fallback
      this.clientes = this.clientesEjemplo;
      this.clientesFiltrados = [...this.clientes];
    }
  }

  calcularEstadisticas() {
    this.clientesActivos = this.clientes.filter(c => c.isWAContact).length;
    
    const inicioMes = new Date();
    inicioMes.setDate(1);
    this.clientesNuevosEsteMes = this.clientes.filter(c => 
      new Date(c.creation || '') >= inicioMes
    ).length;
  }

  buscarClientes(event: any) {
    const termino = event.target.value.toLowerCase();
    this.terminoBusqueda = termino;
    this.aplicarFiltros();
  }

  filtrarPorTipo(event: any) {
    this.filtroTipo = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let clientesFiltrados = [...this.clientes];

    // Filtro por término de búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        (cliente.name && cliente.name.toLowerCase().includes(termino)) ||
        (cliente.whatsAppName && cliente.whatsAppName.toLowerCase().includes(termino)) ||
        (cliente.id && cliente.id.includes(termino)) ||
        (cliente.email && cliente.email.toLowerCase().includes(termino))
      );
    }

    // Filtro por tipo
    if (this.filtroTipo !== 'todos') {
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        this.getClienteType(cliente) === this.filtroTipo
      );
    }

    this.clientesFiltrados = clientesFiltrados;
  }

  contarPorTipo(tipo: string): number {
    return this.clientes.filter(c => this.getClienteType(c) === tipo).length;
  }

  trackByClienteId(index: number, cliente: Cliente): string {
    return cliente.id || index.toString();
  }

  formatearFecha(fecha?: Date | string): string {
    if (!fecha) return 'N/A';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return `Hace ${Math.floor(dias / 365)} años`;
  }

  // Acciones
  nuevoCliente() {
    this.router.navigate(['/clientes/nuevo']);
  }

  exportarClientes() {
    console.log('Exportar clientes');
  }

  verDetalleCliente(cliente: Cliente) {
    console.log('Ver detalle:', cliente);
    this.router.navigate(['/clientes', cliente.id]);
  }

  editarCliente(cliente: Cliente, event: Event) {
    event.stopPropagation();
    console.log('Editar cliente:', cliente);
    this.router.navigate(['/clientes', cliente.id, 'editar']);
  }

  contactarCliente(cliente: Cliente, event: Event) {
    event.stopPropagation();
    console.log('Contactar cliente:', cliente);
  }

  verHistorial(cliente: Cliente, event: Event) {
    event.stopPropagation();
    console.log('Ver historial:', cliente);
    // this.router.navigate(['/clientes', cliente.id, 'historial']);
  }
}