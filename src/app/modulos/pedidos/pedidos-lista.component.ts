import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Pedido } from '../../modelos';
import { PedidoService } from '../../servicios/pedido.service';
import { ToastController, AlertController } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-pedidos-lista',
  templateUrl: './pedidos-lista.component.html',
  styleUrls: ['./pedidos-lista.component.scss'],
  standalone: false
})
export class PedidosListaComponent implements OnInit, OnDestroy {

  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  cargando = false;
  error: string | null = null;
  private navigationSubscription: Subscription;
  
  // Filtros
  terminoBusqueda = '';
  filtroEstado = 'todos';
  filtroTipo = 'todos';
  filtroFecha = 'todos';
  fechaDesde: string | null = null;
  fechaHasta: string | null = null;
  
  // Estadísticas
  estadisticas: any = {
    total: 0,
    pendientes: 0,
    aceptados: 0,
    enProceso: 0,
    enDelivery: 0,
    entregados: 0,
    rechazados: 0,
    porTipo: { delivery: 0, pickUp: 0, insideOrder: 0 }
  };

  // Estados disponibles
  estadosDisponibles = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'accepted', label: 'Aceptados' },
    { value: 'inProcess', label: 'En Proceso' },
    { value: 'inDelivery', label: 'En Delivery' },
    { value: 'deliveried', label: 'Entregados' },
    { value: 'rejected', label: 'Rechazados' }
  ];

  // Tipos disponibles
  tiposDisponibles = [
    { value: 'todos', label: 'Todos los tipos' },
    { value: 'delivery', label: 'Domicilio' },
    { value: 'pickUp', label: 'Recoger en tienda' },
    { value: 'insideOrder', label: 'Consumo en local' }
  ];

  // Períodos de fecha disponibles
  periodosDisponibles = [
    { value: 'todos', label: 'Todas las fechas' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'ayer', label: 'Ayer' },
    { value: 'ultima_semana', label: 'Última semana' },
    { value: 'ultimo_mes', label: 'Último mes' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  constructor(
    private router: Router,
    private pedidoService: PedidoService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Escuchar cambios de navegación para refrescar datos
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('🧭 PedidosListaComponent: Navegación detectada:', event.url);
      if (event.url === '/pedidos' || event.url.includes('/pedidos')) {
        console.log('🔄 PedidosListaComponent: Refrescando datos por navegación');
        this.cargarPedidos();
        this.cargarEstadisticas();
      }
    });
  }

  async ngOnInit() {
    await this.cargarPedidos();
    await this.cargarEstadisticas();
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  // Ionic lifecycle - se ejecuta cada vez que se entra a la vista
  async ionViewWillEnter() {
    console.log('🔄 PedidosListaComponent: Refrescando datos al entrar a la vista');
    await this.cargarPedidos();
    await this.cargarEstadisticas();
  }

  async cargarPedidos() {
    try {
      console.log('🔄 PedidosListaComponent.cargarPedidos() - Iniciando carga...');
      this.cargando = true;
      this.error = null;
      this.pedidos = await this.pedidoService.obtenerTodos();
      console.log('📊 PedidosListaComponent.cargarPedidos() - Pedidos obtenidos:', this.pedidos.length);
      this.pedidos.forEach((pedido, index) => {
        console.log(`  ${index + 1}. ${pedido.contactNameOrder} - ${pedido.statusBooking} - ID: ${pedido.id}`);
      });
      this.aplicarFiltros();
      console.log('✅ PedidosListaComponent.cargarPedidos() - Carga completada');
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      this.error = 'Error al cargar los pedidos';
    } finally {
      this.cargando = false;
    }
  }

  async cargarEstadisticas() {
    try {
      this.estadisticas = await this.pedidoService.obtenerEstadisticas();
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  aplicarFiltros() {
    let pedidosFiltrados = [...this.pedidos];

    // Filtro por búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      pedidosFiltrados = pedidosFiltrados.filter(pedido =>
        pedido.contactNameOrder?.toLowerCase().includes(termino) ||
        pedido.contact.includes(termino) ||
        pedido.resumeOrder.toLowerCase().includes(termino) ||
        pedido.addressToDelivery?.toLowerCase().includes(termino)
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      pedidosFiltrados = pedidosFiltrados.filter(pedido =>
        pedido.statusBooking === this.filtroEstado
      );
    }

    // Filtro por tipo
    if (this.filtroTipo !== 'todos') {
      pedidosFiltrados = pedidosFiltrados.filter(pedido =>
        pedido.orderType === this.filtroTipo
      );
    }

    // Filtro por fecha
    if (this.filtroFecha !== 'todos') {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => {
        if (!pedido.fechaCreacion) return false;
        
        const fechaPedido = new Date(pedido.fechaCreacion);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        
        switch (this.filtroFecha) {
          case 'hoy':
            return fechaPedido.toDateString() === hoy.toDateString();
          case 'ayer':
            return fechaPedido.toDateString() === ayer.toDateString();
          case 'ultima_semana':
            const semanaAtras = new Date(hoy);
            semanaAtras.setDate(hoy.getDate() - 7);
            return fechaPedido >= semanaAtras;
          case 'ultimo_mes':
            const mesAtras = new Date(hoy);
            mesAtras.setMonth(hoy.getMonth() - 1);
            return fechaPedido >= mesAtras;
          case 'custom':
            if (this.fechaDesde && this.fechaHasta) {
              const desde = new Date(this.fechaDesde);
              const hasta = new Date(this.fechaHasta);
              hasta.setHours(23, 59, 59, 999); // Incluir todo el día
              return fechaPedido >= desde && fechaPedido <= hasta;
            }
            return true;
          default:
            return true;
        }
      });
    }

    this.pedidosFiltrados = pedidosFiltrados;
  }

  buscarPedidos(event: any) {
    this.terminoBusqueda = event.target.value;
    this.aplicarFiltros();
  }

  filtrarPorEstadoSelect(event: any) {
    this.filtroEstado = event.detail.value;
    this.aplicarFiltros();
  }

  filtrarPorTipo(event: any) {
    this.filtroTipo = event.detail.value;
    this.aplicarFiltros();
  }

  filtrarPorFecha(event: any) {
    this.filtroFecha = event.detail.value;
    if (this.filtroFecha !== 'custom') {
      this.fechaDesde = null;
      this.fechaHasta = null;
    }
    this.aplicarFiltros();
  }

  cambiarFechaDesde(event: any) {
    this.fechaDesde = event.detail.value;
    this.aplicarFiltros();
  }

  cambiarFechaHasta(event: any) {
    this.fechaHasta = event.detail.value;
    this.aplicarFiltros();
  }

  nuevoPedido() {
    this.router.navigate(['/pedidos/nuevo']);
  }

  verDetallePedido(pedido: Pedido) {
    this.router.navigate(['/pedidos', pedido.id]);
  }

  editarPedido(pedido: Pedido, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/pedidos', pedido.id, 'editar']);
  }

  async aceptarPedido(pedido: Pedido, event: Event) {
    event.stopPropagation();
    try {
      await this.pedidoService.aceptarPedido(pedido.id!);
      await this.cargarPedidos();
      await this.cargarEstadisticas();
      await this.presentToast('Pedido aceptado correctamente', 'success');
    } catch (error) {
      console.error('Error aceptando pedido:', error);
      await this.presentToast('Error al aceptar el pedido', 'danger');
    }
  }

  async rechazarPedido(pedido: Pedido, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertController.create({
      header: 'Rechazar Pedido',
      message: `¿Está seguro de rechazar el pedido de ${pedido.contactNameOrder}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Rechazar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.pedidoService.rechazarPedido(pedido.id!);
              await this.cargarPedidos();
              await this.cargarEstadisticas();
              await this.presentToast('Pedido rechazado correctamente', 'success');
            } catch (error) {
              console.error('Error rechazando pedido:', error);
              await this.presentToast('Error al rechazar el pedido', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async marcarEnProceso(pedido: Pedido, event: Event) {
    event.stopPropagation();
    try {
      await this.pedidoService.marcarEnProceso(pedido.id!);
      await this.cargarPedidos();
      await this.cargarEstadisticas();
      await this.presentToast('Pedido marcado en proceso', 'success');
    } catch (error) {
      console.error('Error marcando pedido en proceso:', error);
      await this.presentToast('Error al actualizar el pedido', 'danger');
    }
  }

  async marcarEnDelivery(pedido: Pedido, event: Event) {
    event.stopPropagation();
    try {
      await this.pedidoService.marcarEnDelivery(pedido.id!);
      await this.cargarPedidos();
      await this.cargarEstadisticas();
      await this.presentToast('Pedido en delivery', 'success');
    } catch (error) {
      console.error('Error marcando pedido en delivery:', error);
      await this.presentToast('Error al actualizar el pedido', 'danger');
    }
  }

  async marcarEntregado(pedido: Pedido, event: Event) {
    event.stopPropagation();
    try {
      await this.pedidoService.marcarEntregado(pedido.id!);
      await this.cargarPedidos();
      await this.cargarEstadisticas();
      await this.presentToast('Pedido marcado como entregado', 'success');
    } catch (error) {
      console.error('Error marcando pedido como entregado:', error);
      await this.presentToast('Error al actualizar el pedido', 'danger');
    }
  }

  async eliminarPedido(pedido: Pedido) {
    const alert = await this.alertController.create({
      header: 'Eliminar Pedido',
      message: `¿Está seguro de eliminar el pedido de ${pedido.contactNameOrder}? Esta acción no se puede deshacer.`,
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
              await this.pedidoService.eliminar(pedido.id!);
              await this.cargarPedidos();
              await this.cargarEstadisticas();
              await this.presentToast('Pedido eliminado correctamente', 'success');
            } catch (error) {
              console.error('Error eliminando pedido:', error);
              await this.presentToast('Error al eliminar el pedido', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Métodos de utilidad

  obtenerEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'accepted': 'Aceptado',
      'rejected': 'Rechazado',
      'inProcess': 'En Proceso',
      'inDelivery': 'En Delivery',
      'deliveried': 'Entregado'
    };
    return labels[estado] || estado;
  }

  obtenerTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'delivery': 'Domicilio',
      'pickUp': 'Recoger',
      'insideOrder': 'Local'
    };
    return labels[tipo] || tipo;
  }

  obtenerClaseEstado(estado: string): string {
    const clases: Record<string, string> = {
      'pending': 'status-pending',
      'accepted': 'status-accepted',
      'rejected': 'status-rejected',
      'inProcess': 'status-process',
      'inDelivery': 'status-delivery',
      'deliveried': 'status-delivered'
    };
    return clases[estado] || '';
  }

  obtenerClaseTipo(tipo: string): string {
    const clases: Record<string, string> = {
      'delivery': 'type-delivery',
      'pickUp': 'type-pickup',
      'insideOrder': 'type-inside'
    };
    return clases[tipo] || '';
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

  // ====================================================
  // MÉTODOS PARA LAS MEJORAS IMPLEMENTADAS
  // ====================================================

  // Actualizar lista (nuevo método para el botón de refresh mejorado)
  async actualizarLista() {
    this.cargando = true;
    try {
      await this.cargarPedidos();
      await this.cargarEstadisticas();
      await this.presentToast('Lista actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error actualizando lista:', error);
      await this.presentToast('Error al actualizar la lista', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  // Filtrar por estado desde las tarjetas mejoradas
  filtrarPorEstado(estado: string) {
    this.filtroEstado = estado || 'todos';
    this.aplicarFiltros();
    
    // Feedback visual
    let mensaje = 'Mostrando todos los pedidos';
    if (estado === 'pending') mensaje = 'Mostrando pedidos pendientes';
    else if (estado === 'accepted') mensaje = 'Mostrando pedidos aceptados';
    else if (estado === 'inDelivery') mensaje = 'Mostrando pedidos en delivery';
    
    this.presentToast(mensaje, 'success');
  }

  // ====================================================
  // MÉTODOS DE FORMATEO DE FECHA Y HORA
  // ====================================================

  formatearFechaHora(fecha: string | Date | undefined): string {
    if (!fecha) return 'No disponible';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    
    return fechaObj.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  calcularTiempoTranscurrido(fecha: string | Date | undefined): string {
    if (!fecha) return 'No disponible';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `${dias} día${dias > 1 ? 's' : ''}`;
    
    return fechaObj.toLocaleDateString('es-CO');
  }
}