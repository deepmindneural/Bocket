import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Reserva } from '../../modelos';
import { ReservaService } from '../../servicios/reserva.service';
import { ToastController, AlertController } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-reservas-lista',
  templateUrl: './reservas-lista.component.html',
  styleUrls: ['./reservas-lista.component.scss'],
  standalone: false
})
export class ReservasListaComponent implements OnInit, OnDestroy {

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  cargando = false;
  error: string | null = null;
  private navigationSubscription: Subscription;
  
  // Filtros
  terminoBusqueda = '';
  filtroEstado = 'todas';
  filtroFecha = 'todas';
  fechaDesde: string | null = null;
  fechaHasta: string | null = null;
  
  // Estadísticas
  estadisticas: any = {
    total: 0,
    pendientes: 0,
    confirmadas: 0,
    hoy: 0,
    canceladas: 0
  };

  // Estados disponibles
  estadosDisponibles = [
    { value: 'todas', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'accepted', label: 'Confirmadas' },
    { value: 'rejected', label: 'Canceladas' }
  ];

  // Períodos de fecha disponibles
  periodosDisponibles = [
    { value: 'todas', label: 'Todas las fechas' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'manana', label: 'Mañana' },
    { value: 'esta_semana', label: 'Esta semana' },
    { value: 'proximo_mes', label: 'Próximo mes' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  // Datos usando interface VenueBooking
  reservasEjemplo: Reserva[] = [
    {
      id: 'reserva_' + Date.now() + '_1',
      contact: '573001234567',
      contactNameBooking: 'Juan Pérez',
      peopleBooking: '4',
      finalPeopleBooking: 4,
      dateBooking: '2024-07-24T14:00:00.000Z',
      statusBooking: 'accepted',
      detailsBooking: 'Mesa cerca de la ventana, celebración de cumpleaños',
      reconfirmDate: '2024-07-23T14:30:00.000Z',
      reconfirmStatus: 'accepted'
    },
    {
      id: 'reserva_' + Date.now() + '_2',
      contact: '573109876543',
      contactNameBooking: 'María González',
      peopleBooking: '6',
      finalPeopleBooking: 6,
      dateBooking: '2024-07-24T16:30:00.000Z',
      statusBooking: 'pending',
      detailsBooking: 'Cena de trabajo corporativa, requiere factura electrónica',
      reconfirmDate: undefined,
      reconfirmStatus: 'pending'
    },
    {
      id: 'reserva_' + Date.now() + '_3',
      contact: '573201357924',
      contactNameBooking: 'Carlos Rodríguez',
      peopleBooking: '2',
      finalPeopleBooking: 2,
      dateBooking: '2024-07-25T10:00:00.000Z',
      statusBooking: 'rejected',
      detailsBooking: 'Cena romántica, solicita mesa privada',
      reconfirmDate: undefined,
      reconfirmStatus: 'rejected'
    }
  ];

  constructor(
    private router: Router,
    private reservaService: ReservaService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Escuchar cambios de navegación para refrescar datos
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('🧭 ReservasListaComponent: Navegación detectada:', event.url);
      if (event.url === '/reservas' || event.url.includes('/reservas')) {
        console.log('🔄 ReservasListaComponent: Refrescando datos por navegación');
        this.cargarReservas();
        this.cargarEstadisticas();
      }
    });
  }

  async ngOnInit() {
    await this.cargarReservas();
    await this.cargarEstadisticas();
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  // Ionic lifecycle - se ejecuta cada vez que se entra a la vista
  async ionViewWillEnter() {
    console.log('🔄 ReservasListaComponent: Refrescando datos al entrar a la vista');
    await this.cargarReservas();
    await this.cargarEstadisticas();
  }

  async cargarReservas() {
    try {
      console.log('🔄 ReservasListaComponent.cargarReservas() - Iniciando carga...');
      this.cargando = true;
      this.error = null;
      this.reservas = await this.reservaService.obtenerTodos();
      if (this.reservas.length === 0) {
        this.reservas = this.reservasEjemplo;
      }
      console.log('📊 ReservasListaComponent.cargarReservas() - Reservas obtenidas:', this.reservas.length);
      this.reservas.forEach((reserva, index) => {
        console.log(`  ${index + 1}. ${reserva.contactNameBooking} - ${reserva.statusBooking} - ID: ${reserva.id}`);
      });
      this.aplicarFiltros();
      console.log('✅ ReservasListaComponent.cargarReservas() - Carga completada');
    } catch (error) {
      console.error('❌ Error cargando reservas:', error);
      this.error = 'Error al cargar las reservas';
      this.reservas = this.reservasEjemplo;
      this.aplicarFiltros();
    } finally {
      this.cargando = false;
    }
  }

  async cargarEstadisticas() {
    try {
      this.estadisticas = await this.reservaService.obtenerEstadisticas();
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Calcular estadísticas localmente como fallback
      this.calcularEstadisticasLocales();
    }
  }

  calcularEstadisticasLocales() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    this.estadisticas = {
      total: this.reservas.length,
      pendientes: this.reservas.filter(r => r.statusBooking === 'pending').length,
      confirmadas: this.reservas.filter(r => r.statusBooking === 'accepted').length,
      canceladas: this.reservas.filter(r => r.statusBooking === 'rejected').length,
      hoy: this.reservas.filter(r => {
        const fechaReserva = new Date(r.dateBooking);
        fechaReserva.setHours(0, 0, 0, 0);
        return fechaReserva.getTime() === hoy.getTime();
      }).length
    };
  }

  buscarReservas(event: any) {
    this.terminoBusqueda = event.target.value;
    this.aplicarFiltros();
  }

  filtrarPorEstadoSelect(event: any) {
    this.filtroEstado = event.detail.value;
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

  aplicarFiltros() {
    let reservasFiltradas = [...this.reservas];

    // Filtro por búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      reservasFiltradas = reservasFiltradas.filter(reserva =>
        reserva.contactNameBooking?.toLowerCase().includes(termino) ||
        reserva.contact.includes(termino) ||
        (reserva.detailsBooking && reserva.detailsBooking.toLowerCase().includes(termino))
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== 'todas') {
      reservasFiltradas = reservasFiltradas.filter(reserva =>
        reserva.statusBooking === this.filtroEstado
      );
    }

    // Filtro por fecha
    if (this.filtroFecha !== 'todas') {
      reservasFiltradas = reservasFiltradas.filter(reserva => {
        if (!reserva.dateBooking) return false;
        
        const fechaReserva = new Date(reserva.dateBooking);
        const hoy = new Date();
        const manana = new Date(hoy);
        manana.setDate(hoy.getDate() + 1);
        
        switch (this.filtroFecha) {
          case 'hoy':
            return fechaReserva.toDateString() === hoy.toDateString();
          case 'manana':
            return fechaReserva.toDateString() === manana.toDateString();
          case 'esta_semana':
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            return fechaReserva >= inicioSemana && fechaReserva <= finSemana;
          case 'proximo_mes':
            const proximoMes = new Date(hoy);
            proximoMes.setMonth(hoy.getMonth() + 1);
            return fechaReserva.getMonth() === proximoMes.getMonth() && fechaReserva.getFullYear() === proximoMes.getFullYear();
          case 'custom':
            if (this.fechaDesde && this.fechaHasta) {
              const desde = new Date(this.fechaDesde);
              const hasta = new Date(this.fechaHasta);
              hasta.setHours(23, 59, 59, 999);
              return fechaReserva >= desde && fechaReserva <= hasta;
            }
            return true;
          default:
            return true;
        }
      });
    }

    this.reservasFiltradas = reservasFiltradas;
  }

  nuevaReserva() {
    this.router.navigate(['/reservas/nueva']);
  }

  verDetalleReserva(reserva: Reserva) {
    this.router.navigate(['/reservas', reserva.id]);
  }

  editarReserva(reserva: Reserva, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/reservas', reserva.id, 'editar']);
  }

  async confirmarReserva(reserva: Reserva, event: Event) {
    event.stopPropagation();
    try {
      await this.reservaService.confirmarReserva(reserva.id!);
      await this.cargarReservas();
      await this.cargarEstadisticas();
      await this.presentToast('Reserva confirmada correctamente', 'success');
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      await this.presentToast('Error al confirmar la reserva', 'danger');
    }
  }

  async cancelarReserva(reserva: Reserva, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertController.create({
      header: 'Cancelar Reserva',
      message: `¿Está seguro de cancelar la reserva de ${reserva.contactNameBooking}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Sí, cancelar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.reservaService.cancelarReserva(reserva.id!);
              await this.cargarReservas();
              await this.cargarEstadisticas();
              await this.presentToast('Reserva cancelada correctamente', 'success');
            } catch (error) {
              console.error('Error cancelando reserva:', error);
              await this.presentToast('Error al cancelar la reserva', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarReserva(reserva: Reserva) {
    const alert = await this.alertController.create({
      header: 'Eliminar Reserva',
      message: `¿Está seguro de eliminar definitivamente la reserva de ${reserva.contactNameBooking}? Esta acción no se puede deshacer.`,
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
              await this.reservaService.eliminar(reserva.id!);
              await this.cargarReservas();
              await this.cargarEstadisticas();
              await this.presentToast('Reserva eliminada correctamente', 'success');
            } catch (error) {
              console.error('Error eliminando reserva:', error);
              await this.presentToast('Error al eliminar la reserva', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }


  obtenerEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'accepted': 'Confirmada',
      'rejected': 'Cancelada'
    };
    return labels[estado] || estado;
  }

  obtenerClaseEstado(estado: string): string {
    const clases: Record<string, string> = {
      'pending': 'status-pending',
      'accepted': 'status-confirmed',
      'rejected': 'status-cancelled'
    };
    return clases[estado] || '';
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
      await this.cargarReservas();
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
    this.filtroEstado = estado || 'todas';
    this.aplicarFiltros();
    
    // Feedback visual
    let mensaje = 'Mostrando todas las reservas';
    if (estado === 'pending') mensaje = 'Mostrando reservas pendientes';
    else if (estado === 'accepted') mensaje = 'Mostrando reservas confirmadas';
    else if (estado === 'hoy') mensaje = 'Mostrando reservas para hoy';
    
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

  calcularTiempoHastaReserva(fecha: string | Date | undefined): string {
    if (!fecha) return 'No disponible';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    
    const ahora = new Date();
    const diferencia = fechaObj.getTime() - ahora.getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (diferencia < 0) {
      const minutosAtras = Math.abs(minutos);
      const horasAtras = Math.abs(horas);
      const diasAtras = Math.abs(dias);
      
      if (minutosAtras < 60) return `Hace ${minutosAtras} minuto${minutosAtras > 1 ? 's' : ''}`;
      if (horasAtras < 24) return `Hace ${horasAtras} hora${horasAtras > 1 ? 's' : ''}`;
      return `Hace ${diasAtras} día${diasAtras > 1 ? 's' : ''}`;
    }
    
    if (minutos < 60) return `En ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `En ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias === 1) return 'Mañana';
    if (dias < 7) return `En ${dias} día${dias > 1 ? 's' : ''}`;
    
    return fechaObj.toLocaleDateString('es-CO');
  }
}