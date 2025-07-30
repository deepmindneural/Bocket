import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <div class="admin-header">
        <h1>🔧 Panel de Administración Backend</h1>
        <p>Vista completa de todos los datos en Firestore</p>
        
        <div class="admin-nav">
          <ion-button fill="outline" [routerLink]="['/admin/restaurantes']">
            <ion-icon name="restaurant" slot="start"></ion-icon>
            Restaurantes
          </ion-button>
          <ion-button fill="outline" [routerLink]="['/admin/usuarios']">
            <ion-icon name="people" slot="start"></ion-icon>
            Usuarios
          </ion-button>
          <ion-button fill="outline" [routerLink]="['/admin/pedidos']">
            <ion-icon name="fast-food" slot="start"></ion-icon>
            Pedidos
          </ion-button>
          <ion-button fill="outline" [routerLink]="['/admin/clientes']">
            <ion-icon name="person" slot="start"></ion-icon>
            Clientes
          </ion-button>
          <ion-button fill="outline" [routerLink]="['/admin/reservas']">
            <ion-icon name="calendar" slot="start"></ion-icon>
            Reservas
          </ion-button>
          <ion-button fill="outline" color="danger" [routerLink]="['/admin/test']">
            <ion-icon name="bug" slot="start"></ion-icon>
            TEST DB
          </ion-button>
        </div>
      </div>

      <!-- Búsqueda Global -->
      <div class="search-section">
        <h3>🔍 Búsqueda Global</h3>
        <div class="search-row">
          <ion-searchbar 
            placeholder="Buscar en toda la base de datos..."
            [value]="terminoBusqueda"
            (ionInput)="buscar($event)"
            class="global-search">
          </ion-searchbar>
          <ion-button (click)="ejecutarBusqueda()" [disabled]="buscando">
            <ion-icon name="search" slot="start"></ion-icon>
            Buscar
          </ion-button>
        </div>
        
        <div *ngIf="resultadosBusqueda && !buscando" class="search-results">
          <h4>Resultados de búsqueda:</h4>
          <div class="results-grid">
            <div class="result-section">
              <h5>Pedidos ({{ resultadosBusqueda.pedidos?.length || 0 }})</h5>
              <div *ngFor="let pedido of resultadosBusqueda.pedidos?.slice(0, 3)" class="result-item">
                {{ pedido.contactNameOrder }} - {{ pedido.restauranteNombre }}
              </div>
            </div>
            <div class="result-section">
              <h5>Clientes ({{ resultadosBusqueda.clientes?.length || 0 }})</h5>
              <div *ngFor="let cliente of resultadosBusqueda.clientes?.slice(0, 3)" class="result-item">
                {{ cliente.name }} - {{ cliente.restauranteNombre }}
              </div>
            </div>
            <div class="result-section">
              <h5>Reservas ({{ resultadosBusqueda.reservas?.length || 0 }})</h5>
              <div *ngFor="let reserva of resultadosBusqueda.reservas?.slice(0, 3)" class="result-item">
                {{ reserva.contactNameBooking }} - {{ reserva.restauranteNombre }}
              </div>
            </div>
            <div class="result-section">
              <h5>Usuarios ({{ resultadosBusqueda.usuarios?.length || 0 }})</h5>
              <div *ngFor="let usuario of resultadosBusqueda.usuarios?.slice(0, 3)" class="result-item">
                {{ usuario.email }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas Globales -->
      <div class="stats-section">
        <h3>📊 Estadísticas Globales</h3>
        <div *ngIf="cargandoStats" class="loading">
          <ion-spinner></ion-spinner>
          <p>Calculando estadísticas...</p>
        </div>
        
        <div *ngIf="estadisticas && !cargandoStats" class="stats-grid">
          <!-- Restaurantes -->
          <div class="stat-card">
            <h4>🏪 Restaurantes</h4>
            <div class="stat-value">{{ estadisticas.restaurantes?.total || 0 }}</div>
            <div class="stat-details">
              <span>✅ Activos: {{ estadisticas.restaurantes?.activos || 0 }}</span>
              <span>❌ Inactivos: {{ estadisticas.restaurantes?.inactivos || 0 }}</span>
            </div>
          </div>

          <!-- Usuarios -->
          <div class="stat-card">
            <h4>👤 Usuarios</h4>
            <div class="stat-value">{{ estadisticas.usuarios?.total || 0 }}</div>
            <div class="stat-details">
              <span>🟢 Activos: {{ estadisticas.usuarios?.activos || 0 }}</span>
              <span>📅 Última semana: {{ estadisticas.usuarios?.ultimaSemana || 0 }}</span>
            </div>
          </div>

          <!-- Pedidos -->
          <div class="stat-card">
            <h4>🍽️ Pedidos</h4>
            <div class="stat-value">{{ estadisticas.pedidos?.total || 0 }}</div>
            <div class="stat-details">
              <span>⏳ Pendientes: {{ estadisticas.pedidos?.pendientes || 0 }}</span>
              <span>✅ Aceptados: {{ estadisticas.pedidos?.aceptados || 0 }}</span>
              <span>🚴 En proceso: {{ estadisticas.pedidos?.enProceso || 0 }}</span>
              <span>📦 Entregados: {{ estadisticas.pedidos?.entregados || 0 }}</span>
            </div>
          </div>

          <!-- Clientes -->
          <div class="stat-card">
            <h4>👥 Clientes</h4>
            <div class="stat-value">{{ estadisticas.clientes?.total || 0 }}</div>
            <div class="stat-details">
              <div *ngFor="let rest of getRestaurantesTop(estadisticas.clientes?.porRestaurante)" class="restaurant-stat">
                {{ rest.nombre }}: {{ rest.cantidad }}
              </div>
            </div>
          </div>

          <!-- Reservas -->
          <div class="stat-card">
            <h4>📅 Reservas</h4>
            <div class="stat-value">{{ estadisticas.reservas?.total || 0 }}</div>
            <div class="stat-details">
              <span>⏳ Pendientes: {{ estadisticas.reservas?.pendientes || 0 }}</span>
              <span>✅ Confirmadas: {{ estadisticas.reservas?.confirmadas || 0 }}</span>
              <span>❌ Rechazadas: {{ estadisticas.reservas?.rechazadas || 0 }}</span>
            </div>
          </div>

          <!-- Tipos de Pedidos -->
          <div class="stat-card">
            <h4>🚀 Tipos de Pedidos</h4>
            <div class="stat-details">
              <span>🚴 Delivery: {{ estadisticas.pedidos?.porTipo?.delivery || 0 }}</span>
              <span>🏪 Pick Up: {{ estadisticas.pedidos?.porTipo?.pickUp || 0 }}</span>
              <span>🍽️ Local: {{ estadisticas.pedidos?.porTipo?.insideOrder || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <div class="actions-section">
        <h3>⚡ Acciones Rápidas</h3>
        <div class="actions-grid">
          <ion-button expand="block" fill="outline" (click)="recargarTodo()">
            <ion-icon name="refresh" slot="start"></ion-icon>
            Recargar Todas las Estadísticas
          </ion-button>
          <ion-button expand="block" fill="outline" (click)="exportarDatos()">
            <ion-icon name="download" slot="start"></ion-icon>
            Exportar Datos (JSON)
          </ion-button>
          <ion-button expand="block" fill="outline" color="secondary" (click)="volverAlApp()">
            <ion-icon name="arrow-back" slot="start"></ion-icon>
            Volver a la Aplicación
          </ion-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .admin-header {
      text-align: center;
      margin-bottom: 30px;
      
      h1 {
        color: #333;
        margin-bottom: 10px;
      }
      
      p {
        color: #666;
        margin-bottom: 20px;
      }
    }

    .admin-nav {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .search-section, .stats-section, .actions-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h3 {
        margin-top: 0;
        color: #333;
      }
    }

    .search-row {
      display: flex;
      gap: 10px;
      align-items: center;
      
      .global-search {
        flex: 1;
      }
    }

    .search-results {
      margin-top: 20px;
      
      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 15px;
      }
      
      .result-section {
        h5 {
          margin-bottom: 10px;
          color: #555;
        }
      }
      
      .result-item {
        padding: 8px;
        background: #f5f5f5;
        border-radius: 4px;
        margin-bottom: 5px;
        font-size: 14px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid var(--ion-color-primary, #3880ff);
      
      h4 {
        margin: 0 0 10px 0;
        color: #333;
      }
      
      .stat-value {
        font-size: 36px;
        font-weight: bold;
        color: var(--ion-color-primary, #3880ff);
        margin-bottom: 15px;
      }
      
      .stat-details {
        display: flex;
        flex-direction: column;
        gap: 5px;
        
        span {
          font-size: 14px;
          color: #666;
        }
        
        .restaurant-stat {
          font-size: 12px;
          color: #888;
        }
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .loading {
      text-align: center;
      padding: 40px;
      
      ion-spinner {
        margin-bottom: 15px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {

  estadisticas: any = null;
  cargandoStats = false;
  terminoBusqueda = '';
  resultadosBusqueda: any = null;
  buscando = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarEstadisticas();
  }

  async cargarEstadisticas() {
    this.cargandoStats = true;
    try {
      this.estadisticas = await this.adminService.obtenerEstadisticasGlobales();
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
    this.cargandoStats = false;
  }

  buscar(event: any) {
    this.terminoBusqueda = event.target.value;
  }

  async ejecutarBusqueda() {
    if (!this.terminoBusqueda.trim()) return;
    
    this.buscando = true;
    try {
      this.resultadosBusqueda = await this.adminService.buscarEnTodo(this.terminoBusqueda);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
    this.buscando = false;
  }

  async recargarTodo() {
    await this.cargarEstadisticas();
  }

  async exportarDatos() {
    try {
      const datos = {
        estadisticas: this.estadisticas,
        fechaExportacion: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bocket-admin-datos-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando datos:', error);
    }
  }

  volverAlApp() {
    this.router.navigate(['/dashboard']);
  }

  getRestaurantesTop(porRestaurante: any): any[] {
    if (!porRestaurante) return [];
    
    return Object.keys(porRestaurante)
      .map(key => ({
        id: key,
        nombre: porRestaurante[key].nombre,
        cantidad: porRestaurante[key].cantidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);
  }
}