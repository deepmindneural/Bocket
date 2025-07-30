import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1>📅 Todas las Reservas</h1>
        <p>Vista completa de reservas de todos los restaurantes</p>
        <ion-button fill="outline" routerLink="/admin">
          <ion-icon name="arrow-back" slot="start"></ion-icon>
          Volver al Dashboard
        </ion-button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-row">
          <ion-searchbar 
            placeholder="Buscar reservas..."
            [value]="filtroTexto"
            (ionInput)="filtrarPorTexto($event)"
            class="search-bar">
          </ion-searchbar>
          
          <ion-select 
            [value]="filtroEstado"
            (ionChange)="filtrarPorEstado($event)"
            placeholder="Estado">
            <ion-select-option value="">Todos los estados</ion-select-option>
            <ion-select-option value="pending">Pendientes</ion-select-option>
            <ion-select-option value="accepted">Aceptadas</ion-select-option>
            <ion-select-option value="rejected">Rechazadas</ion-select-option>
          </ion-select>
          
          <ion-select 
            [value]="filtroRestaurante"
            (ionChange)="filtrarPorRestaurante($event)"
            placeholder="Restaurante">
            <ion-select-option value="">Todos los restaurantes</ion-select-option>
            <ion-select-option *ngFor="let rest of restaurantesUnicos" [value]="rest.id">
              {{ rest.nombre }}
            </ion-select-option>
          </ion-select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-state">
        <ion-spinner></ion-spinner>
        <p>Cargando reservas...</p>
      </div>

      <!-- Estadísticas rápidas -->
      <div *ngIf="!cargando && reservas.length > 0" class="quick-stats">
        <div class="stat-item">
          <span class="stat-value">{{ reservasFiltradas.length }}</span>
          <span class="stat-label">Mostrando</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ reservas.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ contarPorEstado('pending') }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ contarPorEstado('accepted') }}</span>
          <span class="stat-label">Aceptadas</span>
        </div>
      </div>

      <!-- Lista de reservas -->
      <div *ngIf="!cargando" class="reservas-table">
        <div class="table-header">
          <div class="header-cell">Restaurante</div>
          <div class="header-cell">Cliente</div>
          <div class="header-cell">Contacto</div>
          <div class="header-cell">Fecha Reserva</div>
          <div class="header-cell">Hora</div>
          <div class="header-cell">Mesa</div>
          <div class="header-cell">Estado</div>
          <div class="header-cell">Detalles</div>
        </div>
        
        <div *ngFor="let reserva of reservasFiltradas" class="table-row">
          <div class="cell restaurant">{{ reserva.restauranteNombre }}</div>
          <div class="cell">{{ reserva.contactNameBooking || 'Sin nombre' }}</div>
          <div class="cell">{{ reserva.contact || 'Sin contacto' }}</div>
          <div class="cell fecha">{{ formatearFecha(reserva.dateBooking) }}</div>
          <div class="cell">{{ reserva.timeBooking || 'Sin hora' }}</div>
          <div class="cell">Mesa {{ reserva.tableBooking || 'N/A' }}</div>
          <div class="cell">
            <span class="badge" [ngClass]="'badge-' + reserva.statusBooking">
              {{ obtenerEstadoLabel(reserva.statusBooking) }}
            </span>
          </div>
          <div class="cell detalles">{{ truncar(reserva.detailsBooking, 40) }}</div>
        </div>
        
        <div *ngIf="reservasFiltradas.length === 0 && reservas.length > 0" class="empty-results">
          <p>No se encontraron reservas con los filtros aplicados</p>
        </div>
        
        <div *ngIf="reservas.length === 0" class="empty-state">
          <ion-icon name="calendar-outline"></ion-icon>
          <h3>No hay reservas</h3>
          <p>No se encontraron reservas en la base de datos</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      
      h1 {
        margin: 0;
        color: #333;
      }
      
      p {
        margin: 5px 0 0 0;
        color: #666;
      }
    }

    .filters-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filters-row {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
      
      .search-bar {
        flex: 1;
        min-width: 250px;
      }
      
      ion-select {
        min-width: 150px;
      }
    }

    .quick-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      
      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--ion-color-primary, #3880ff);
        }
        
        .stat-label {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
      }
    }

    .reservas-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .table-header {
      display: grid;
      grid-template-columns: 120px 150px 120px 140px 80px 80px 120px 1fr;
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      
      .header-cell {
        padding: 15px 10px;
        font-weight: 600;
        color: #495057;
        border-right: 1px solid #dee2e6;
      }
    }

    .table-row {
      display: grid;
      grid-template-columns: 120px 150px 120px 140px 80px 80px 120px 1fr;
      border-bottom: 1px solid #dee2e6;
      
      &:hover {
        background: #f8f9fa;
      }
      
      .cell {
        padding: 12px 10px;
        border-right: 1px solid #dee2e6;
        font-size: 14px;
        display: flex;
        align-items: center;
        
        &.restaurant {
          font-weight: 600;
          color: #495057;
        }
        
        &.detalles {
          font-size: 13px;
          color: #666;
        }
        
        &.fecha {
          font-size: 12px;
          color: #888;
        }
      }
    }

    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
      
      &.badge-pending { background: #fff3cd; color: #856404; }
      &.badge-accepted { background: #d4edda; color: #155724; }
      &.badge-rejected { background: #f8d7da; color: #721c24; }
    }

    .loading-state, .empty-state, .empty-results {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      
      ion-icon {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 15px;
      }
      
      h3 {
        margin: 15px 0 10px 0;
        color: #333;
      }
      
      p {
        color: #666;
      }
    }

    @media (max-width: 768px) {
      .table-header, .table-row {
        grid-template-columns: 1fr;
        
        .cell, .header-cell {
          border-right: none;
          border-bottom: 1px solid #dee2e6;
        }
      }
      
      .filters-row {
        flex-direction: column;
        align-items: stretch;
        
        .search-bar, ion-select {
          min-width: auto;
        }
      }
    }
  `]
})
export class AdminReservasComponent implements OnInit {

  reservas: any[] = [];
  reservasFiltradas: any[] = [];
  restaurantesUnicos: any[] = [];
  cargando = false;
  
  filtroTexto = '';
  filtroEstado = '';
  filtroRestaurante = '';

  constructor(private adminService: AdminService) {}

  async ngOnInit() {
    await this.cargarReservas();
  }

  async cargarReservas() {
    this.cargando = true;
    try {
      this.reservas = await this.adminService.obtenerTodasReservas();
      this.reservasFiltradas = [...this.reservas];
      this.extraerRestaurantesUnicos();
    } catch (error) {
      console.error('Error cargando reservas:', error);
    }
    this.cargando = false;
  }

  extraerRestaurantesUnicos() {
    const restaurantesMap = new Map();
    this.reservas.forEach(reserva => {
      if (reserva.restauranteId && !restaurantesMap.has(reserva.restauranteId)) {
        restaurantesMap.set(reserva.restauranteId, {
          id: reserva.restauranteId,
          nombre: reserva.restauranteNombre || reserva.restauranteId
        });
      }
    });
    this.restaurantesUnicos = Array.from(restaurantesMap.values());
  }

  filtrarPorTexto(event: any) {
    this.filtroTexto = event.target.value;
    this.aplicarFiltros();
  }

  filtrarPorEstado(event: any) {
    this.filtroEstado = event.detail.value;
    this.aplicarFiltros();
  }

  filtrarPorRestaurante(event: any) {
    this.filtroRestaurante = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.reservas];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      filtrados = filtrados.filter(reserva =>
        reserva.contactNameBooking?.toLowerCase().includes(texto) ||
        reserva.contact?.includes(this.filtroTexto) ||
        reserva.detailsBooking?.toLowerCase().includes(texto) ||
        reserva.restauranteNombre?.toLowerCase().includes(texto)
      );
    }

    // Filtro por estado
    if (this.filtroEstado) {
      filtrados = filtrados.filter(reserva => reserva.statusBooking === this.filtroEstado);
    }

    // Filtro por restaurante
    if (this.filtroRestaurante) {
      filtrados = filtrados.filter(reserva => reserva.restauranteId === this.filtroRestaurante);
    }

    this.reservasFiltradas = filtrados;
  }

  contarPorEstado(estado: string): number {
    return this.reservas.filter(r => r.statusBooking === estado).length;
  }

  obtenerEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'accepted': 'Aceptada',
      'rejected': 'Rechazada'
    };
    return labels[estado] || estado;
  }

  truncar(texto: string, longitud: number): string {
    return this.adminService.truncarTexto(texto, longitud);
  }

  formatearFecha(fecha: any): string {
    return this.adminService.formatearFecha(fecha);
  }
}