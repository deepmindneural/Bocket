import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Reserva } from '../../modelos';
import { ReservaService } from '../../servicios/reserva.service';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reservas-lista',
  templateUrl: './reservas-lista.component.html',
  styleUrls: ['./reservas-lista.component.scss'],
  standalone: false
})
export class ReservasListaComponent implements OnInit {

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  terminoBusqueda: string = '';
  filtroEstado: string = 'todas';
  cargando = false;
  error: string | null = null;
  
  // Estadísticas
  reservasPendientes = 0;
  reservasConfirmadas = 0;
  reservasHoy = 0;

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
  ) {}

  async ngOnInit() {
    await this.cargarReservas();
    await this.cargarEstadisticas();
  }

  async cargarReservas() {
    try {
      this.cargando = true;
      this.error = null;
      this.reservas = await this.reservaService.obtenerTodos();
      if (this.reservas.length === 0) {
        this.reservas = this.reservasEjemplo;
      }
      this.reservasFiltradas = [...this.reservas];
    } catch (error) {
      console.error('Error cargando reservas:', error);
      this.error = 'Error al cargar las reservas';
      this.reservas = this.reservasEjemplo;
      this.reservasFiltradas = [...this.reservas];
    } finally {
      this.cargando = false;
    }
  }

  async cargarEstadisticas() {
    try {
      const estadisticas = await this.reservaService.obtenerEstadisticas();
      this.reservasPendientes = estadisticas.pendientes;
      this.reservasConfirmadas = estadisticas.confirmadas;
      this.reservasHoy = estadisticas.hoy;
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  buscarReservas(event: any) {
    const termino = event.target.value.toLowerCase();
    this.terminoBusqueda = termino;
    this.aplicarFiltros();
  }

  filtrarPorEstado(event: any) {
    this.filtroEstado = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let reservasFiltradas = [...this.reservas];

    // Filtro por término de búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      reservasFiltradas = reservasFiltradas.filter(reserva =>
        reserva.contactNameBooking?.toLowerCase().includes(termino) ||
        reserva.contact.includes(termino) ||
        (reserva.detailsBooking && reserva.detailsBooking.toLowerCase().includes(termino))
      );
    }

    if (this.filtroEstado !== 'todas') {
      reservasFiltradas = reservasFiltradas.filter(reserva =>
        reserva.statusBooking === this.filtroEstado
      );
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

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diferencia = fechaObj.getTime() - ahora.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy ' + fechaObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    if (dias === 1) return 'Mañana ' + fechaObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    if (dias === -1) return 'Ayer ' + fechaObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    
    return fechaObj.toLocaleDateString('es-CO', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
}