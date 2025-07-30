import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1>🍽️ Todos los Pedidos</h1>
        <p>Vista completa de pedidos de todos los restaurantes</p>
        <ion-button fill="outline" routerLink="/admin">
          <ion-icon name="arrow-back" slot="start"></ion-icon>
          Volver al Dashboard
        </ion-button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-row">
          <ion-searchbar 
            placeholder="Buscar pedidos..."
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
            <ion-select-option value="accepted">Aceptados</ion-select-option>
            <ion-select-option value="inProcess">En Proceso</ion-select-option>
            <ion-select-option value="inDelivery">En Delivery</ion-select-option>
            <ion-select-option value="deliveried">Entregados</ion-select-option>
            <ion-select-option value="rejected">Rechazados</ion-select-option>
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
        <p>Cargando pedidos...</p>
      </div>

      <!-- Estadísticas rápidas -->
      <div *ngIf="!cargando && pedidos.length > 0" class="quick-stats">
        <div class="stat-item">
          <span class="stat-value">{{ pedidosFiltrados.length }}</span>
          <span class="stat-label">Mostrando</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ pedidos.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ contarPorEstado('pending') }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ contarPorEstado('accepted') }}</span>
          <span class="stat-label">Aceptados</span>
        </div>
      </div>

      <!-- Lista de pedidos -->
      <div *ngIf="!cargando" class="pedidos-table">
        <div class="table-header">
          <div class="header-cell">Restaurante</div>
          <div class="header-cell">Cliente</div>
          <div class="header-cell">Contacto</div>
          <div class="header-cell">Resumen</div>
          <div class="header-cell">Tipo</div>
          <div class="header-cell">Estado</div>
          <div class="header-cell">Fecha</div>
        </div>
        
        <div *ngFor="let pedido of pedidosFiltrados" class="table-row">
          <div class="cell restaurant">{{ pedido.restauranteNombre }}</div>
          <div class="cell">{{ pedido.contactNameOrder || 'Sin nombre' }}</div>
          <div class="cell">{{ pedido.contact || 'Sin contacto' }}</div>
          <div class="cell resumen">{{ truncar(pedido.resumeOrder, 40) }}</div>
          <div class="cell">
            <span class="badge" [ngClass]="'badge-' + pedido.orderType">
              {{ obtenerTipoLabel(pedido.orderType) }}
            </span>
          </div>
          <div class="cell">
            <span class="badge" [ngClass]="'badge-' + pedido.statusBooking">
              {{ obtenerEstadoLabel(pedido.statusBooking) }}
            </span>
          </div>
          <div class="cell fecha">{{ formatearFecha(pedido.fechaCreacion) }}</div>
        </div>
        
        <div *ngIf="pedidosFiltrados.length === 0 && pedidos.length > 0" class="empty-results">
          <p>No se encontraron pedidos con los filtros aplicados</p>
        </div>
        
        <div *ngIf="pedidos.length === 0" class="empty-state">
          <ion-icon name="restaurant-outline"></ion-icon>
          <h3>No hay pedidos</h3>
          <p>No se encontraron pedidos en la base de datos</p>
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

    .pedidos-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .table-header {
      display: grid;
      grid-template-columns: 120px 150px 120px 1fr 100px 120px 140px;
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
      grid-template-columns: 120px 150px 120px 1fr 100px 120px 140px;
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
        
        &.resumen {
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
      &.badge-inProcess { background: #d1ecf1; color: #0c5460; }
      &.badge-inDelivery { background: #e2e3e5; color: #383d41; }
      &.badge-deliveried { background: #d4edda; color: #155724; }
      
      &.badge-delivery { background: #e7f3ff; color: #004085; }
      &.badge-pickUp { background: #fff3e0; color: #bf360c; }
      &.badge-insideOrder { background: #f3e5f5; color: #4a148c; }
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
export class AdminPedidosComponent implements OnInit {

  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  restaurantesUnicos: any[] = [];
  cargando = false;
  
  filtroTexto = '';
  filtroEstado = '';
  filtroRestaurante = '';

  constructor(private adminService: AdminService) {}

  async ngOnInit() {
    await this.cargarPedidos();
  }

  async cargarPedidos() {
    this.cargando = true;
    try {
      this.pedidos = await this.adminService.obtenerTodosPedidos();
      this.pedidosFiltrados = [...this.pedidos];
      this.extraerRestaurantesUnicos();
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
    this.cargando = false;
  }

  extraerRestaurantesUnicos() {
    const restaurantesMap = new Map();
    this.pedidos.forEach(pedido => {
      if (pedido.restauranteId && !restaurantesMap.has(pedido.restauranteId)) {
        restaurantesMap.set(pedido.restauranteId, {
          id: pedido.restauranteId,
          nombre: pedido.restauranteNombre || pedido.restauranteId
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
    let filtrados = [...this.pedidos];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      filtrados = filtrados.filter(pedido =>
        pedido.contactNameOrder?.toLowerCase().includes(texto) ||
        pedido.contact?.includes(this.filtroTexto) ||
        pedido.resumeOrder?.toLowerCase().includes(texto) ||
        pedido.restauranteNombre?.toLowerCase().includes(texto)
      );
    }

    // Filtro por estado
    if (this.filtroEstado) {
      filtrados = filtrados.filter(pedido => pedido.statusBooking === this.filtroEstado);
    }

    // Filtro por restaurante
    if (this.filtroRestaurante) {
      filtrados = filtrados.filter(pedido => pedido.restauranteId === this.filtroRestaurante);
    }

    this.pedidosFiltrados = filtrados;
  }

  contarPorEstado(estado: string): number {
    return this.pedidos.filter(p => p.statusBooking === estado).length;
  }

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

  truncar(texto: string, longitud: number): string {
    return this.adminService.truncarTexto(texto, longitud);
  }

  formatearFecha(fecha: any): string {
    return this.adminService.formatearFecha(fecha);
  }
}