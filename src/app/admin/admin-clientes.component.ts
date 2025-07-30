import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-clientes',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1>👥 Todos los Clientes</h1>
        <p>Vista completa de clientes de todos los restaurantes</p>
        <ion-button fill="outline" routerLink="/admin">
          <ion-icon name="arrow-back" slot="start"></ion-icon>
          Volver al Dashboard
        </ion-button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-row">
          <ion-searchbar 
            placeholder="Buscar clientes..."
            [value]="filtroTexto"
            (ionInput)="filtrarPorTexto($event)"
            class="search-bar">
          </ion-searchbar>
          
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
        <p>Cargando clientes...</p>
      </div>

      <!-- Estadísticas rápidas -->
      <div *ngIf="!cargando && clientes.length > 0" class="quick-stats">
        <div class="stat-item">
          <span class="stat-value">{{ clientesFiltrados.length }}</span>
          <span class="stat-label">Mostrando</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ clientes.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ restaurantesUnicos.length }}</span>
          <span class="stat-label">Restaurantes</span>
        </div>
      </div>

      <!-- Lista de clientes -->
      <div *ngIf="!cargando" class="clientes-table">
        <div class="table-header">
          <div class="header-cell">Restaurante</div>
          <div class="header-cell">Nombre</div>
          <div class="header-cell">Email</div>
          <div class="header-cell">WhatsApp</div>
          <div class="header-cell">Teléfono</div>
          <div class="header-cell">Dirección</div>
          <div class="header-cell">Fecha Registro</div>
        </div>
        
        <div *ngFor="let cliente of clientesFiltrados" class="table-row">
          <div class="cell restaurant">{{ cliente.restauranteNombre }}</div>
          <div class="cell">{{ cliente.name || 'Sin nombre' }}</div>
          <div class="cell">{{ cliente.email || 'Sin email' }}</div>
          <div class="cell">{{ cliente.whatsAppName || 'Sin WhatsApp' }}</div>
          <div class="cell">{{ cliente.phone || 'Sin teléfono' }}</div>
          <div class="cell direccion">{{ truncar(cliente.address || 'Sin dirección', 30) }}</div>
          <div class="cell fecha">{{ formatearFecha(cliente.creation) }}</div>
        </div>
        
        <div *ngIf="clientesFiltrados.length === 0 && clientes.length > 0" class="empty-results">
          <p>No se encontraron clientes con los filtros aplicados</p>
        </div>
        
        <div *ngIf="clientes.length === 0" class="empty-state">
          <ion-icon name="people-outline"></ion-icon>
          <h3>No hay clientes</h3>
          <p>No se encontraron clientes en la base de datos</p>
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

    .clientes-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .table-header {
      display: grid;
      grid-template-columns: 120px 150px 180px 120px 120px 1fr 140px;
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
      grid-template-columns: 120px 150px 180px 120px 120px 1fr 140px;
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
        
        &.direccion {
          font-size: 13px;
          color: #666;
        }
        
        &.fecha {
          font-size: 12px;
          color: #888;
        }
      }
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
export class AdminClientesComponent implements OnInit {

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  restaurantesUnicos: any[] = [];
  cargando = false;
  
  filtroTexto = '';
  filtroRestaurante = '';

  constructor(private adminService: AdminService) {}

  async ngOnInit() {
    await this.cargarClientes();
  }

  async cargarClientes() {
    this.cargando = true;
    try {
      this.clientes = await this.adminService.obtenerTodosClientes();
      this.clientesFiltrados = [...this.clientes];
      this.extraerRestaurantesUnicos();
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
    this.cargando = false;
  }

  extraerRestaurantesUnicos() {
    const restaurantesMap = new Map();
    this.clientes.forEach(cliente => {
      if (cliente.restauranteId && !restaurantesMap.has(cliente.restauranteId)) {
        restaurantesMap.set(cliente.restauranteId, {
          id: cliente.restauranteId,
          nombre: cliente.restauranteNombre || cliente.restauranteId
        });
      }
    });
    this.restaurantesUnicos = Array.from(restaurantesMap.values());
  }

  filtrarPorTexto(event: any) {
    this.filtroTexto = event.target.value;
    this.aplicarFiltros();
  }

  filtrarPorRestaurante(event: any) {
    this.filtroRestaurante = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.clientes];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      filtrados = filtrados.filter(cliente =>
        cliente.name?.toLowerCase().includes(texto) ||
        cliente.email?.toLowerCase().includes(texto) ||
        cliente.whatsAppName?.toLowerCase().includes(texto) ||
        cliente.phone?.includes(this.filtroTexto) ||
        cliente.address?.toLowerCase().includes(texto) ||
        cliente.restauranteNombre?.toLowerCase().includes(texto)
      );
    }

    // Filtro por restaurante
    if (this.filtroRestaurante) {
      filtrados = filtrados.filter(cliente => cliente.restauranteId === this.filtroRestaurante);
    }

    this.clientesFiltrados = filtrados;
  }

  truncar(texto: string, longitud: number): string {
    return this.adminService.truncarTexto(texto, longitud);
  }

  formatearFecha(fecha: any): string {
    return this.adminService.formatearFecha(fecha);
  }
}