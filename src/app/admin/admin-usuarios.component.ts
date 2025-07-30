import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1>👤 Todos los Usuarios</h1>
        <p>Vista completa de usuarios registrados en el sistema</p>
        <ion-button fill="outline" routerLink="/admin">
          <ion-icon name="arrow-back" slot="start"></ion-icon>
          Volver al Dashboard
        </ion-button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-row">
          <ion-searchbar 
            placeholder="Buscar usuarios..."
            [value]="filtroTexto"
            (ionInput)="filtrarPorTexto($event)"
            class="search-bar">
          </ion-searchbar>
          
          <ion-select 
            [value]="filtroEstado"
            (ionChange)="filtrarPorEstado($event)"
            placeholder="Estado">
            <ion-select-option value="">Todos los estados</ion-select-option>
            <ion-select-option value="true">Activos</ion-select-option>
            <ion-select-option value="false">Inactivos</ion-select-option>
          </ion-select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-state">
        <ion-spinner></ion-spinner>
        <p>Cargando usuarios...</p>
      </div>

      <!-- Estadísticas rápidas -->
      <div *ngIf="!cargando && usuarios.length > 0" class="quick-stats">
        <div class="stat-item">
          <span class="stat-value">{{ usuariosFiltrados.length }}</span>
          <span class="stat-label">Mostrando</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ usuarios.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ contarPorEstado(true) }}</span>
          <span class="stat-label">Activos</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ contarRecientes() }}</span>
          <span class="stat-label">Última semana</span>
        </div>
      </div>

      <!-- Lista de usuarios -->
      <div *ngIf="!cargando" class="usuarios-table">
        <div class="table-header">
          <div class="header-cell">Email</div>
          <div class="header-cell">Nombre</div>
          <div class="header-cell">Rol</div>
          <div class="header-cell">Estado</div>
          <div class="header-cell">Fecha Creación</div>
          <div class="header-cell">Último Acceso</div>
          <div class="header-cell">Verificado</div>
        </div>
        
        <div *ngFor="let usuario of usuariosFiltrados" class="table-row">
          <div class="cell email">{{ usuario.email || 'Sin email' }}</div>
          <div class="cell">{{ usuario.nombre || usuario.displayName || 'Sin nombre' }}</div>
          <div class="cell">
            <span class="badge badge-rol">{{ usuario.rol || 'usuario' }}</span>
          </div>
          <div class="cell">
            <span class="badge" [ngClass]="usuario.activo ? 'badge-activo' : 'badge-inactivo'">
              {{ usuario.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="cell fecha">{{ formatearFecha(usuario.fechaCreacion) }}</div>
          <div class="cell fecha">{{ formatearFecha(usuario.ultimoAcceso) }}</div>
          <div class="cell">
            <span class="badge" [ngClass]="usuario.emailVerified ? 'badge-verificado' : 'badge-pendiente'">
              {{ usuario.emailVerified ? 'Verificado' : 'Pendiente' }}
            </span>
          </div>
        </div>
        
        <div *ngIf="usuariosFiltrados.length === 0 && usuarios.length > 0" class="empty-results">
          <p>No se encontraron usuarios con los filtros aplicados</p>
        </div>
        
        <div *ngIf="usuarios.length === 0" class="empty-state">
          <ion-icon name="people-outline"></ion-icon>
          <h3>No hay usuarios</h3>
          <p>No se encontraron usuarios en la base de datos</p>
        </div>
      </div>

      <!-- Información adicional -->
      <div *ngIf="!cargando && usuarios.length > 0" class="additional-info">
        <h3>📈 Información Adicional</h3>
        <div class="info-cards">
          <div class="info-card">
            <h4>Usuarios por Rol</h4>
            <div class="role-stats">
              <div *ngFor="let rol of obtenerRoles()" class="role-item">
                <strong>{{ rol.nombre }}:</strong> {{ rol.cantidad }}
              </div>
            </div>
          </div>
          <div class="info-card">
            <h4>Actividad Reciente</h4>
            <div class="activity-stats">
              <div>Usuarios activos en la última semana: {{ contarRecientes() }}</div>
              <div>Usuarios sin acceso reciente: {{ contarSinAccesoReciente() }}</div>
              <div>Emails verificados: {{ contarVerificados() }}</div>
            </div>
          </div>
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

    .usuarios-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .table-header {
      display: grid;
      grid-template-columns: 1fr 150px 100px 100px 140px 140px 100px;
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
      grid-template-columns: 1fr 150px 100px 100px 140px 140px 100px;
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
        
        &.email {
          font-family: monospace;
          font-size: 13px;
          color: #495057;
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
      
      &.badge-activo { background: #d4edda; color: #155724; }
      &.badge-inactivo { background: #f8d7da; color: #721c24; }
      &.badge-verificado { background: #d4edda; color: #155724; }
      &.badge-pendiente { background: #fff3cd; color: #856404; }
      &.badge-rol { background: #e7f3ff; color: #004085; }
    }

    .additional-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h3 {
        margin-top: 0;
        color: #333;
      }
    }

    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .info-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid var(--ion-color-primary, #3880ff);
      
      h4 {
        margin: 0 0 15px 0;
        color: #333;
      }
    }

    .role-stats, .activity-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .role-item, div {
        font-size: 14px;
        color: #555;
        
        strong {
          color: #333;
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
      
      .info-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminUsuariosComponent implements OnInit {

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  cargando = false;
  
  filtroTexto = '';
  filtroEstado = '';

  constructor(private adminService: AdminService) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargando = true;
    try {
      this.usuarios = await this.adminService.obtenerTodosUsuarios();
      this.usuariosFiltrados = [...this.usuarios];
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
    this.cargando = false;
  }

  filtrarPorTexto(event: any) {
    this.filtroTexto = event.target.value;
    this.aplicarFiltros();
  }

  filtrarPorEstado(event: any) {
    this.filtroEstado = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.usuarios];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      filtrados = filtrados.filter(usuario =>
        usuario.email?.toLowerCase().includes(texto) ||
        usuario.nombre?.toLowerCase().includes(texto) ||
        usuario.displayName?.toLowerCase().includes(texto) ||
        usuario.rol?.toLowerCase().includes(texto)
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== '') {
      const esActivo = this.filtroEstado === 'true';
      filtrados = filtrados.filter(usuario => usuario.activo === esActivo);
    }

    this.usuariosFiltrados = filtrados;
  }

  contarPorEstado(activo: boolean): number {
    return this.usuarios.filter(u => u.activo === activo).length;
  }

  contarRecientes(): number {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    
    return this.usuarios.filter(u => {
      if (!u.ultimoAcceso) return false;
      const fechaAcceso = new Date(u.ultimoAcceso);
      return fechaAcceso > hace7Dias;
    }).length;
  }

  contarSinAccesoReciente(): number {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    return this.usuarios.filter(u => {
      if (!u.ultimoAcceso) return true;
      const fechaAcceso = new Date(u.ultimoAcceso);
      return fechaAcceso < hace30Dias;
    }).length;
  }

  contarVerificados(): number {
    return this.usuarios.filter(u => u.emailVerified === true).length;
  }

  obtenerRoles(): any[] {
    const roles: any = {};
    this.usuarios.forEach(usuario => {
      const rol = usuario.rol || 'usuario';
      if (!roles[rol]) {
        roles[rol] = 0;
      }
      roles[rol]++;
    });
    
    return Object.keys(roles).map(rol => ({
      nombre: rol,
      cantidad: roles[rol]
    })).sort((a, b) => b.cantidad - a.cantidad);
  }

  formatearFecha(fecha: any): string {
    return this.adminService.formatearFecha(fecha);
  }
}