import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-restaurantes',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <div class="header-info">
          <h1>🏪 Gestión de Restaurantes</h1>
          <p>Crear, editar y administrar restaurantes del sistema</p>
        </div>
        <div class="header-actions">
          <ion-button fill="solid" color="success" (click)="abrirModalCrear()">
            <ion-icon name="add" slot="start"></ion-icon>
            Nuevo Restaurante
          </ion-button>
          <ion-button fill="outline" routerLink="/admin">
            <ion-icon name="arrow-back" slot="start"></ion-icon>
            Dashboard
          </ion-button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-row">
          <ion-searchbar 
            placeholder="Buscar restaurantes..."
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
          
          <ion-select 
            [value]="elementosPorPagina"
            (ionChange)="cambiarElementosPorPagina($event)"
            interface="popover"
            placeholder="Por página">
            <ion-select-option value="6">6 por página</ion-select-option>
            <ion-select-option value="12">12 por página</ion-select-option>
            <ion-select-option value="24">24 por página</ion-select-option>
            <ion-select-option value="48">48 por página</ion-select-option>
          </ion-select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-state">
        <ion-spinner></ion-spinner>
        <p>Cargando restaurantes...</p>
      </div>

      <!-- Estadísticas rápidas -->
      <div *ngIf="!cargando && restaurantes.length > 0" class="quick-stats">
        <div class="stat-item">
          <span class="stat-value">{{ restaurantesFiltrados.length }}</span>
          <span class="stat-label">Mostrando</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ restaurantes.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ contarPorEstado(true) }}</span>
          <span class="stat-label">Activos</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ contarPorEstado(false) }}</span>
          <span class="stat-label">Inactivos</span>
        </div>
      </div>

      <!-- Lista de restaurantes -->
      <div *ngIf="!cargando" class="restaurantes-cards">
        <div *ngFor="let restaurante of restaurantesPaginados" class="restaurante-card">
          <div class="card-header">
            <div class="restaurant-info">
              <h3>{{ restaurante.nombre || 'Sin nombre' }}</h3>
              <p class="slug">{{ restaurante.slug || 'sin-slug' }}</p>
            </div>
            <div class="restaurant-status">
              <span class="badge" [ngClass]="restaurante.activo ? 'badge-activo' : 'badge-inactivo'">
                {{ restaurante.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <strong>Email:</strong>
                <span>{{ restaurante.email || 'Sin email' }}</span>
              </div>
              <div class="info-item">
                <strong>Teléfono:</strong>
                <span>{{ restaurante.telefono || 'Sin teléfono' }}</span>
              </div>
              <div class="info-item">
                <strong>Dirección:</strong>
                <span>{{ restaurante.direccion || 'Sin dirección' }}</span>
              </div>
              <div class="info-item">
                <strong>Ciudad:</strong>
                <span>{{ restaurante.ciudad || 'Sin ciudad' }}</span>
              </div>
              <div class="info-item">
                <strong>Tipo Cocina:</strong>
                <span>{{ restaurante.tipoCocina || 'Sin especificar' }}</span>
              </div>
              <div class="info-item">
                <strong>Fecha Creación:</strong>
                <span>{{ formatearFecha(restaurante.fechaCreacion) }}</span>
              </div>
            </div>
            
            <div class="colors-section" *ngIf="restaurante.colorPrimario || restaurante.colorSecundario">
              <strong>Colores del tema:</strong>
              <div class="colors-display">
                <div *ngIf="restaurante.colorPrimario" class="color-item">
                  <div class="color-box" [style.background-color]="restaurante.colorPrimario"></div>
                  <span>Primario: {{ restaurante.colorPrimario }}</span>
                </div>
                <div *ngIf="restaurante.colorSecundario" class="color-item">
                  <div class="color-box" [style.background-color]="restaurante.colorSecundario"></div>
                  <span>Secundario: {{ restaurante.colorSecundario }}</span>
                </div>
              </div>
            </div>
            
            <div class="description" *ngIf="restaurante.descripcion">
              <strong>Descripción:</strong>
              <p>{{ restaurante.descripcion }}</p>
            </div>
          </div>
          
          <!-- Acciones del restaurante -->
          <div class="card-actions">
            <ion-button fill="clear" size="small" color="primary" (click)="editarRestaurante(restaurante)">
              <ion-icon name="create" slot="start"></ion-icon>
              Editar
            </ion-button>
            <ion-button fill="clear" size="small" [color]="restaurante.activo ? 'warning' : 'success'" 
                        (click)="toggleEstadoRestaurante(restaurante)">
              <ion-icon [name]="restaurante.activo ? 'pause' : 'play'" slot="start"></ion-icon>
              {{ restaurante.activo ? 'Desactivar' : 'Activar' }}
            </ion-button>
            <ion-button fill="clear" size="small" color="danger" (click)="eliminarRestaurante(restaurante)">
              <ion-icon name="trash" slot="start"></ion-icon>
              Eliminar
            </ion-button>
          </div>
        </div>
        
        <div *ngIf="restaurantesFiltrados.length === 0 && restaurantes.length > 0" class="empty-results">
          <p>No se encontraron restaurantes con los filtros aplicados</p>
        </div>
        
        <div *ngIf="restaurantes.length === 0" class="empty-state">
          <ion-icon name="restaurant-outline"></ion-icon>
          <h3>No hay restaurantes</h3>
          <p>No se encontraron restaurantes en la base de datos</p>
        </div>
      </div>

      <!-- Paginación -->
      <div *ngIf="!cargando && restaurantesFiltrados.length > 0" class="pagination-container">
        <div class="pagination-info">
          <span>Mostrando {{ restaurantesPaginados.length }} de {{ restaurantesFiltrados.length }} restaurantes</span>
          <span *ngIf="totalPaginas > 1"> - Página {{ paginaActual }} de {{ totalPaginas }}</span>
        </div>
        
        <div *ngIf="totalPaginas > 1" class="pagination-controls">
          <ion-button fill="clear" size="small" [disabled]="paginaActual === 1" (click)="paginaAnterior()">
            <ion-icon name="chevron-back" slot="start"></ion-icon>
            Anterior
          </ion-button>
          
          <div class="page-numbers">
            <ion-button 
              *ngFor="let pagina of obtenerPaginasVisibles()" 
              fill="clear" 
              size="small"
              [color]="pagina === paginaActual ? 'primary' : 'medium'"
              [class.active]="pagina === paginaActual"
              (click)="irAPagina(pagina)">
              {{ pagina }}
            </ion-button>
          </div>
          
          <ion-button fill="clear" size="small" [disabled]="paginaActual === totalPaginas" (click)="paginaSiguiente()">
            Siguiente
            <ion-icon name="chevron-forward" slot="end"></ion-icon>
          </ion-button>
        </div>
      </div>
      
      <!-- Modal para crear/editar restaurante -->
      <ion-modal [isOpen]="modalAbierto" (didDismiss)="cerrarModal()">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ modoEdicion ? 'Editar Restaurante' : 'Nuevo Restaurante' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="cerrarModal()">
                  <ion-icon name="close"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="modal-content">
            <form class="restaurant-form" (ngSubmit)="guardarRestaurante()">
              <div class="form-section">
                <h3>Información Básica</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Nombre del Restaurante *</label>
                    <ion-input [(ngModel)]="formularioRestaurante.nombre" name="nombre" 
                               placeholder="Ej: Don Pepe Restaurant" required></ion-input>
                  </div>
                  <div class="form-group">
                    <label>Slug (URL) *</label>
                    <ion-input [(ngModel)]="formularioRestaurante.slug" name="slug" 
                               placeholder="don-pepe" (ionInput)="onSlugChange()"></ion-input>
                    <ion-note *ngIf="formularioRestaurante.slug">URL: /{{formularioRestaurante.slug}}/dashboard</ion-note>
                  </div>
                  <div class="form-group">
                    <label>Email para Login *</label>
                    <ion-input [(ngModel)]="formularioRestaurante.email" name="email" type="email"
                               placeholder="admin@restaurante.com" required></ion-input>
                    <ion-note>Este email se usará para hacer login al sistema</ion-note>
                  </div>
                  <div class="form-group">
                    <label>Contraseña para Login {{ modoEdicion ? '(opcional - dejar vacío para mantener actual)' : '*' }}</label>
                    <ion-input [(ngModel)]="formularioRestaurante.password" name="password" 
                               [type]="mostrarPassword ? 'text' : 'password'"
                               [placeholder]="modoEdicion ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'"
                               [required]="!modoEdicion"></ion-input>
                    <ion-button fill="clear" size="small" (click)="toggleMostrarPassword()">
                      <ion-icon [name]="mostrarPassword ? 'eye-off' : 'eye'"></ion-icon>
                    </ion-button>
                    <ion-note>{{ modoEdicion ? 'Solo completa si deseas cambiar la contraseña actual' : 'Contraseña para acceder con este restaurante' }}</ion-note>
                  </div>
                  <div class="form-group">
                    <label>Teléfono</label>
                    <ion-input [(ngModel)]="formularioRestaurante.telefono" name="telefono" type="tel"
                               placeholder="+57 300 000 0000"></ion-input>
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h3>Ubicación</h3>
                <div class="form-grid">
                  <div class="form-group span-2">
                    <label>Dirección</label>
                    <ion-input [(ngModel)]="formularioRestaurante.direccion" name="direccion"
                               placeholder="Calle 123 #45-67"></ion-input>
                  </div>
                  <div class="form-group">
                    <label>Ciudad</label>
                    <ion-input [(ngModel)]="formularioRestaurante.ciudad" name="ciudad"
                               placeholder="Bogotá"></ion-input>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Branding</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Color Primario</label>
                    <div class="color-input-group">
                      <input type="color" [(ngModel)]="formularioRestaurante.colorPrimario" name="colorPrimario">
                      <ion-input [(ngModel)]="formularioRestaurante.colorPrimario" name="colorPrimarioText"></ion-input>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Color Secundario</label>
                    <div class="color-input-group">
                      <input type="color" [(ngModel)]="formularioRestaurante.colorSecundario" name="colorSecundario">
                      <ion-input [(ngModel)]="formularioRestaurante.colorSecundario" name="colorSecundarioText"></ion-input>
                    </div>
                  </div>
                  <div class="form-group span-2">
                    <label>Logo del Restaurante</label>
                    <div class="logo-upload-container">
                      <div class="logo-preview" *ngIf="logoPreview || formularioRestaurante.logo">
                        <img [src]="logoPreview || formularioRestaurante.logo" 
                             alt="Vista previa del logo" 
                             class="logo-preview-img"
                             (error)="onLogoPreviewError($event)">
                        <button type="button" class="remove-logo-btn" (click)="removerLogo()">
                          <ion-icon name="close"></ion-icon>
                        </button>
                      </div>
                      <div class="logo-upload-area" *ngIf="!logoPreview && !formularioRestaurante.logo">
                        <input type="file" 
                               #logoInput 
                               accept="image/*" 
                               (change)="onLogoSeleccionado($event)"
                               style="display: none;">
                        <button type="button" 
                                class="upload-btn" 
                                (click)="abrirSelectorLogo()">
                          <ion-icon name="cloud-upload"></ion-icon>
                          <span>Subir Logo</span>
                        </button>
                        <ion-note>Formatos: JPG, PNG, GIF (máx. 2MB)</ion-note>
                      </div>
                      <div class="logo-actions" *ngIf="logoPreview || formularioRestaurante.logo">
                        <button type="button" 
                                class="change-logo-btn" 
                                (click)="abrirSelectorLogo()">
                          <ion-icon name="camera"></ion-icon>
                          Cambiar Logo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Descripción</h3>
                <div class="form-group">
                  <ion-textarea [(ngModel)]="formularioRestaurante.descripcion" name="descripcion" 
                                rows="3" placeholder="Describe tu restaurante..."></ion-textarea>
                </div>
              </div>

              <div class="form-section">
                <h3>Estado</h3>
                <div class="form-group">
                  <ion-checkbox [(ngModel)]="formularioRestaurante.activo" name="activo"></ion-checkbox>
                  <label>Restaurante activo</label>
                </div>
              </div>
              
              <div class="form-actions">
                <ion-button type="button" fill="outline" (click)="cerrarModal()">
                  Cancelar
                </ion-button>
                <ion-button type="submit" [disabled]="guardandoRestaurante">
                  <ion-spinner *ngIf="guardandoRestaurante" name="crescent"></ion-spinner>
                  {{ guardandoRestaurante ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear') }}
                </ion-button>
              </div>
            </form>
          </ion-content>
        </ng-template>
      </ion-modal>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
      overflow-y: auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      
      .header-info {
        h1 {
          margin: 0;
          color: #333;
        }
        
        p {
          margin: 5px 0 0 0;
          color: #666;
        }
      }
      
      .header-actions {
        display: flex;
        gap: 10px;
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

    .restaurantes-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .restaurante-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      
      &:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-1px);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      
      .restaurant-info {
        h3 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 20px;
          font-weight: 600;
        }
        
        .slug {
          margin: 0;
          color: #666;
          font-size: 14px;
          font-family: monospace;
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }
      }
    }

    .badge {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      
      &.badge-activo {
        background: #d4edda;
        color: #155724;
      }
      
      &.badge-inactivo {
        background: #f8d7da;
        color: #721c24;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
      
      strong {
        color: #555;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      span {
        color: #333;
        font-size: 14px;
      }
    }

    .colors-section {
      margin-bottom: 15px;
      
      strong {
        color: #555;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: block;
        margin-bottom: 10px;
      }
    }

    .colors-display {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .color-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .color-box {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid #ddd;
      }
      
      span {
        font-size: 12px;
        color: #666;
      }
    }

    .description {
      strong {
        color: #555;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: block;
        margin-bottom: 8px;
      }
      
      p {
        margin: 0;
        color: #333;
        font-size: 14px;
        line-height: 1.5;
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

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      flex-wrap: wrap;
    }

    // Estilos de paginación
    .pagination-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pagination-info {
      text-align: center;
      margin-bottom: 15px;
      
      span {
        color: #666;
        font-size: 14px;
      }
    }

    .pagination-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .page-numbers {
      display: flex;
      gap: 5px;
      
      ion-button.active {
        --color: var(--ion-color-primary-contrast, white);
        --background: var(--ion-color-primary, #3880ff);
        font-weight: bold;
      }
    }

    // Estilos del modal
    .modal-content {
      --padding-start: 0;
      --padding-end: 0;
    }

    .restaurant-form {
      padding: 20px;
    }

    .form-section {
      margin-bottom: 30px;
      
      h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
        padding-bottom: 10px;
        border-bottom: 2px solid #f0f0f0;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      
      .span-2 {
        grid-column: span 2;
        
        @media (max-width: 768px) {
          grid-column: span 1;
        }
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      label {
        font-weight: 500;
        color: #555;
        font-size: 14px;
      }
      
      ion-input, ion-textarea {
        border: 1px solid #ddd;
        border-radius: 6px;
        --padding-start: 12px;
        --padding-end: 12px;
        
        &:focus-within {
          border-color: var(--ion-color-primary, #3880ff);
          box-shadow: 0 0 0 3px rgba(56, 128, 255, 0.1);
        }
      }
      
      ion-note {
        font-size: 12px;
        color: #666;
      }
      
      ion-checkbox {
        margin-right: 10px;
      }
    }

    .color-input-group {
      display: flex;
      gap: 10px;
      align-items: center;
      
      input[type="color"] {
        width: 50px;
        height: 40px;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
      }
      
      ion-input {
        flex: 1;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    // Estilos para subida de logo
    .logo-upload-container {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      background: #fafafa;
      
      .logo-preview {
        position: relative;
        display: inline-block;
        margin-bottom: 15px;
        
        .logo-preview-img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #eee;
        }
        
        .remove-logo-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ff4757;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          
          ion-icon {
            font-size: 12px;
          }
        }
      }
      
      .logo-upload-area {
        .upload-btn {
          background: var(--ion-color-primary, #3880ff);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 auto 10px;
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--ion-color-primary-tint, #4c8dff);
            transform: translateY(-1px);
          }
          
          ion-icon {
            font-size: 20px;
          }
        }
        
        ion-note {
          color: #666;
          font-size: 12px;
        }
      }
      
      .logo-actions {
        .change-logo-btn {
          background: #f0f0f0;
          color: #333;
          border: 1px solid #ddd;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto;
          transition: all 0.2s ease;
          
          &:hover {
            background: #e8e8e8;
            border-color: #ccc;
          }
          
          ion-icon {
            font-size: 16px;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .restaurantes-cards {
        grid-template-columns: 1fr;
      }
      
      .card-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-row {
        flex-direction: column;
        align-items: stretch;
        
        .search-bar, ion-select {
          min-width: auto;
        }
      }
      
      .logo-upload-container {
        .logo-preview-img {
          width: 80px;
          height: 80px;
        }
      }
    }
  `]
})
export class AdminRestaurantesComponent implements OnInit {

  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;

  restaurantes: any[] = [];
  restaurantesFiltrados: any[] = [];
  restaurantesPaginados: any[] = [];
  cargando = false;
  
  filtroTexto = '';
  filtroEstado = '';
  
  // Paginación
  paginaActual = 1;
  elementosPorPagina = 6;
  totalPaginas = 0;

  // Modal y formulario
  modalAbierto = false;
  modoEdicion = false;
  guardandoRestaurante = false;
  restauranteEditando: any = null;
  mostrarPassword = false;
  
  // Manejo de logo
  logoPreview: string | null = null;
  logoFile: File | null = null;

  formularioRestaurante = {
    nombre: '',
    slug: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    descripcion: '',
    logo: '',
    colorPrimario: '#004aad',
    colorSecundario: '#d636a0',
    activo: true
  };

  constructor(
    private adminService: AdminService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarRestaurantes();
  }

  async cargarRestaurantes() {
    this.cargando = true;
    try {
      this.restaurantes = await this.adminService.obtenerTodosRestaurantes();
      this.restaurantesFiltrados = [...this.restaurantes];
      this.calcularPaginacion();
    } catch (error) {
      console.error('Error cargando restaurantes:', error);
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

  cambiarElementosPorPagina(event: any) {
    this.elementosPorPagina = parseInt(event.detail.value);
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  aplicarFiltros() {
    let filtrados = [...this.restaurantes];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      filtrados = filtrados.filter(restaurante =>
        restaurante.nombre?.toLowerCase().includes(texto) ||
        restaurante.slug?.toLowerCase().includes(texto) ||
        restaurante.email?.toLowerCase().includes(texto) ||
        restaurante.telefono?.includes(this.filtroTexto) ||
        restaurante.direccion?.toLowerCase().includes(texto) ||
        restaurante.ciudad?.toLowerCase().includes(texto) ||
        restaurante.tipoCocina?.toLowerCase().includes(texto)
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== '') {
      const esActivo = this.filtroEstado === 'true';
      filtrados = filtrados.filter(restaurante => restaurante.activo === esActivo);
    }

    this.restaurantesFiltrados = filtrados;
    this.paginaActual = 1; // Reset a la primera página cuando se filtra
    this.calcularPaginacion();
  }

  contarPorEstado(activo: boolean): number {
    return this.restaurantes.filter(r => r.activo === activo).length;
  }

  formatearFecha(fecha: any): string {
    return this.adminService.formatearFecha(fecha);
  }

  // ==========================================
  // MÉTODOS DE PAGINACIÓN
  // ==========================================

  calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.restaurantesFiltrados.length / this.elementosPorPagina);
    console.log('🔍 Calculando paginación:', {
      restaurantesFiltrados: this.restaurantesFiltrados.length,
      elementosPorPagina: this.elementosPorPagina,
      totalPaginas: this.totalPaginas,
      paginaActual: this.paginaActual
    });
    this.actualizarPaginados();
  }

  actualizarPaginados() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.restaurantesPaginados = this.restaurantesFiltrados.slice(inicio, fin);
    console.log('📄 Actualizando paginados:', {
      inicio,
      fin,
      restaurantesPaginados: this.restaurantesPaginados.length
    });
  }

  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginados();
      // Scroll al inicio de la lista
      const contenedor = document.querySelector('.restaurantes-cards');
      if (contenedor) {
        contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  paginaAnterior() {
    this.irAPagina(this.paginaActual - 1);
  }

  paginaSiguiente() {
    this.irAPagina(this.paginaActual + 1);
  }

  obtenerPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
    
    if (fin - inicio + 1 < maxPaginasVisibles) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  // ==========================================
  // MÉTODOS CRUD
  // ==========================================

  // Abrir modal para crear restaurante
  abrirModalCrear() {
    this.modoEdicion = false;
    this.restauranteEditando = null;
    this.limpiarFormulario();
    this.modalAbierto = true;
  }

  // Abrir modal para editar restaurante
  editarRestaurante(restaurante: any) {
    this.modoEdicion = true;
    this.restauranteEditando = restaurante;
    this.cargarDatosEnFormulario(restaurante);
    this.modalAbierto = true;
  }

  // Cerrar modal
  cerrarModal() {
    this.modalAbierto = false;
    this.limpiarFormulario();
  }

  // Limpiar formulario
  limpiarFormulario() {
    this.formularioRestaurante = {
      nombre: '',
      slug: '',
      email: '',
      password: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      descripcion: '',
      logo: '',
      colorPrimario: '#004aad',
      colorSecundario: '#d636a0',
      activo: true
    };
    this.mostrarPassword = false;
    this.logoPreview = null;
    this.logoFile = null;
  }

  // Cargar datos en formulario para edición
  cargarDatosEnFormulario(restaurante: any) {
    this.formularioRestaurante = {
      nombre: restaurante.nombre || '',
      slug: restaurante.slug || '',
      email: restaurante.email || '',
      password: '', // No cargar contraseña existente por seguridad
      telefono: restaurante.telefono || '',
      direccion: restaurante.direccion || '',
      ciudad: restaurante.ciudad || '',
      descripcion: restaurante.descripcion || '',
      logo: restaurante.logo || '',
      colorPrimario: restaurante.colorPrimario || '#004aad',
      colorSecundario: restaurante.colorSecundario || '#d636a0',
      activo: restaurante.activo !== undefined ? restaurante.activo : true
    };
    this.mostrarPassword = false;
  }

  // Guardar restaurante (crear o actualizar)
  async guardarRestaurante() {
    try {
      this.guardandoRestaurante = true;
      console.log('🚀 Iniciando proceso de guardado de restaurante...');

      // Validar datos
      const validacion = this.adminService.validarDatosRestaurante(this.formularioRestaurante, this.modoEdicion);
      if (!validacion.esValido) {
        await this.mostrarToast(validacion.errores.join(', '), 'danger');
        this.guardandoRestaurante = false; // Resetear inmediatamente
        return;
      }

      // Verificar slug disponible
      if (!this.modoEdicion || this.formularioRestaurante.slug !== this.restauranteEditando?.slug) {
        const slugDisponible = await this.adminService.verificarSlugDisponible(
          this.formularioRestaurante.slug, 
          this.restauranteEditando?.id
        );
        if (!slugDisponible) {
          await this.mostrarToast('El slug ya está en uso. Por favor elige otro.', 'danger');
          this.guardandoRestaurante = false; // Resetear inmediatamente
          return;
        }
      }

      if (this.modoEdicion) {
        // Actualizar restaurante existente con logo si se proporcionó
        console.log('📝 Actualizando restaurante existente...');
        await this.adminService.actualizarRestaurante(this.restauranteEditando.id, this.formularioRestaurante, this.logoFile || undefined);
        await this.mostrarToast('Restaurante actualizado exitosamente', 'success');
      } else {
        // Crear nuevo restaurante con logo
        console.log('🆕 Creando nuevo restaurante...');
        const restauranteId = await this.adminService.crearRestaurante(this.formularioRestaurante, this.logoFile || undefined);
        console.log('✅ Restaurante creado exitosamente, ID:', restauranteId);
        
        // Mostrar las credenciales de acceso
        await this.mostrarCredencialesNuevoRestaurante(this.formularioRestaurante.email, this.formularioRestaurante.password, restauranteId);
        await this.mostrarToast('Restaurante creado exitosamente', 'success');
      }

      // Recargar lista y cerrar modal
      console.log('🔄 Recargando lista de restaurantes...');
      await this.cargarRestaurantes();
      this.cerrarModal();
      console.log('✅ Proceso completado exitosamente');

    } catch (error) {
      console.error('❌ Error guardando restaurante:', error);
      await this.mostrarToast(`Error: ${(error as any)?.message || 'Error desconocido'}`, 'danger');
    } finally {
      // Asegurar que siempre se resetee el estado de guardando
      this.guardandoRestaurante = false;
      console.log('🔄 Estado de guardando reseteado');
    }
  }

  // Toggle estado del restaurante (activar/desactivar)
  async toggleEstadoRestaurante(restaurante: any) {
    const nuevoEstado = !restaurante.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    const alert = await this.alertController.create({
      header: 'Confirmar acción',
      message: `¿Estás seguro de que quieres ${accion} el restaurante "${restaurante.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: nuevoEstado ? 'Activar' : 'Desactivar',
          handler: async () => {
            try {
              await this.adminService.actualizarRestaurante(restaurante.id, { activo: nuevoEstado });
              await this.mostrarToast(`Restaurante ${accion}do exitosamente`, 'success');
              await this.cargarRestaurantes();
            } catch (error) {
              console.error('Error cambiando estado:', error);
              await this.mostrarToast(`Error al ${accion} restaurante`, 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Eliminar restaurante
  async eliminarRestaurante(restaurante: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Restaurante',
      message: `¿Estás seguro de que quieres eliminar "${restaurante.nombre}"?`,
      subHeader: 'Esta acción desactivará el restaurante pero conservará sus datos.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.adminService.eliminarRestaurante(restaurante.id, false); // soft delete
              await this.mostrarToast('Restaurante eliminado exitosamente', 'success');
              await this.cargarRestaurantes();
            } catch (error) {
              console.error('Error eliminando restaurante:', error);
              await this.mostrarToast('Error al eliminar restaurante', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Manejar cambio en el slug
  onSlugChange() {
    // Si el slug está vacío, generar uno automáticamente desde el nombre
    if (!this.formularioRestaurante.slug && this.formularioRestaurante.nombre) {
      this.formularioRestaurante.slug = this.adminService.generarSlugDesdeNombre(this.formularioRestaurante.nombre);
    }
  }

  // Toggle mostrar/ocultar contraseña
  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // ==========================================
  // MÉTODOS PARA MANEJO DE LOGO
  // ==========================================

  onLogoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      this.mostrarToast('Solo se permiten archivos de imagen (JPG, PNG, GIF)', 'danger');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.mostrarToast('El archivo es muy grande. Máximo 2MB permitido', 'danger');
      return;
    }

    this.logoFile = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.logoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removerLogo() {
    this.logoPreview = null;
    this.logoFile = null;
    this.formularioRestaurante.logo = '';
  }

  onLogoPreviewError(event: any) {
    console.warn('Error cargando preview del logo, usando imagen por defecto');
    event.target.src = 'assets/logo.png';
    // Opcional: También podemos limpiar el preview si hay un error
    // this.logoPreview = null;
  }

  abrirSelectorLogo() {
    this.logoInput.nativeElement.click();
  }

  // Mostrar credenciales del nuevo restaurante
  async mostrarCredencialesNuevoRestaurante(email: string, password: string, restauranteId: string) {
    const alert = await this.alertController.create({
      header: '🎉 ¡Restaurante Creado!',
      subHeader: 'Credenciales de Acceso',
      message: `📧 Email: ${email}

🔑 Contraseña: ${password}

🏪 ID: ${restauranteId}

💡 IMPORTANTE: Guarda estas credenciales. Úsalas para hacer login como este restaurante.`,
      buttons: [
        {
          text: 'Copiar Email',
          handler: () => {
            navigator.clipboard.writeText(email);
            this.mostrarToast('Email copiado al portapapeles', 'success');
            return false; // Evita que se cierre el alert
          }
        },
        {
          text: 'Copiar Contraseña',
          handler: () => {
            navigator.clipboard.writeText(password);
            this.mostrarToast('Contraseña copiada al portapapeles', 'success');
            return false; // Evita que se cierre el alert
          }
        },
        {
          text: 'OK, Entendido',
          role: 'confirm'
        }
      ]
    });
    await alert.present();
  }

  // Mostrar toast
  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
}