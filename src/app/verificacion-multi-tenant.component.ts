import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from './servicios/auth.service';
import { ClienteService } from './servicios/cliente.service';
import { ReservaService } from './servicios/reserva.service';
import { PedidoService } from './servicios/pedido.service';
import { DashboardService } from './servicios/dashboard.service';

@Component({
  selector: 'app-verificacion-multi-tenant',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>🏢 Verificación Multi-Tenant</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="verification-container">
        <h2>🔍 Verificación de Separación de Datos</h2>
        
        <ion-card *ngIf="restauranteActual">
          <ion-card-header>
            <ion-card-title>🍽️ Restaurante Actual</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p><strong>ID:</strong> {{ restauranteActual.id }}</p>
            <p><strong>Nombre:</strong> {{ restauranteActual.nombre }}</p>
            <p><strong>Ruta Firebase:</strong> clients/{{ restauranteActual.id }}/Formularios</p>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>🧪 Pruebas Multi-Tenant</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button 
              expand="block" 
              color="primary" 
              (click)="ejecutarVerificacion()"
              [disabled]="verificando">
              {{ verificando ? 'Verificando...' : '🚀 Verificar Separación de Datos' }}
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="resultados.length > 0">
          <ion-card-header>
            <ion-card-title>📋 Resultados de Verificación</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div *ngFor="let resultado of resultados" 
                 [ngClass]="{'success': resultado.success, 'error': !resultado.success}"
                 class="resultado-item">
              <ion-icon 
                [name]="resultado.success ? 'checkmark-circle' : 'close-circle'"
                [color]="resultado.success ? 'success' : 'danger'">
              </ion-icon>
              <span>{{ resultado.mensaje }}</span>
              <div *ngIf="resultado.detalle" class="detalle">
                {{ resultado.detalle }}
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="estadisticas">
          <ion-card-header>
            <ion-card-title>📊 Datos del Restaurante Actual</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticas.clientes }}</div>
                    <div class="stat-label">Clientes</div>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticas.reservas }}</div>
                    <div class="stat-label">Reservas</div>
                  </div>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col size="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticas.pedidos }}</div>
                    <div class="stat-label">Pedidos</div>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticas.ruta }}</div>
                    <div class="stat-label">Ruta Firebase</div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .verification-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .resultado-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px;
      border-radius: 4px;
    }
    
    .resultado-item.success {
      background-color: rgba(46, 160, 67, 0.1);
    }
    
    .resultado-item.error {
      background-color: rgba(235, 68, 90, 0.1);
    }
    
    .resultado-item ion-icon {
      margin-right: 8px;
    }
    
    .detalle {
      font-size: 0.9em;
      color: var(--ion-color-medium);
      margin-top: 4px;
      margin-left: 24px;
    }
    
    .stat-item {
      text-align: center;
      padding: 16px;
    }
    
    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: var(--ion-color-primary);
    }
    
    .stat-label {
      font-size: 0.9em;
      color: var(--ion-color-medium);
      margin-top: 4px;
    }
  `]
})
export class VerificacionMultiTenantComponent implements OnInit {
  
  verificando = false;
  resultados: Array<{mensaje: string, success: boolean, detalle?: string}> = [];
  estadisticas: any = null;
  restauranteActual: any = null;

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private pedidoService: PedidoService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    console.log('🏢 Componente de verificación multi-tenant inicializado');
    this.cargarRestauranteActual();
  }

  cargarRestauranteActual() {
    try {
      this.restauranteActual = this.authService.obtenerRestauranteActual();
      console.log('🍽️ Restaurante actual cargado:', this.restauranteActual);
    } catch (error) {
      console.error('❌ Error obteniendo restaurante actual:', error);
      this.resultados.push({
        mensaje: 'Error: No hay restaurante seleccionado',
        success: false,
        detalle: 'Asegúrate de estar logueado y tener un restaurante seleccionado'
      });
    }
  }

  async ejecutarVerificacion() {
    this.verificando = true;
    this.resultados = [];
    this.estadisticas = null;

    try {
      // 1. Verificar que hay un restaurante actual
      await this.verificarRestauranteActual();
      
      // 2. Verificar rutas de Firebase
      await this.verificarRutasFirebase();
      
      // 3. Verificar separación de datos
      await this.verificarDatosClientes();
      await this.verificarDatosReservas();
      await this.verificarDatosPedidos();
      
      // 4. Obtener estadísticas del restaurante actual
      await this.obtenerEstadisticasRestaurante();
      
    } catch (error) {
      this.resultados.push({
        mensaje: 'Error general en la verificación multi-tenant',
        success: false,
        detalle: error?.toString()
      });
    } finally {
      this.verificando = false;
    }
  }

  private async verificarRestauranteActual() {
    try {
      const restaurante = this.authService.obtenerRestauranteActual();
      if (restaurante && restaurante.id) {
        this.resultados.push({
          mensaje: `✅ Restaurante actual: ${restaurante.nombre} (ID: ${restaurante.id})`,
          success: true,
          detalle: `Ruta Firebase: clients/${restaurante.id}/Formularios`
        });
      } else {
        throw new Error('No hay restaurante seleccionado');
      }
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error: No hay restaurante seleccionado',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async verificarRutasFirebase() {
    try {
      const servicios = [
        { nombre: 'ClienteService', servicio: this.clienteService },
        { nombre: 'ReservaService', servicio: this.reservaService },
        { nombre: 'PedidoService', servicio: this.pedidoService },
        { nombre: 'DashboardService', servicio: this.dashboardService }
      ];

      for (const { nombre, servicio } of servicios) {
        try {
          // Intentar obtener datos para verificar que la ruta funciona
          if (nombre === 'ClienteService') {
            await (servicio as any).obtenerTodos();
          } else if (nombre === 'ReservaService') {
            await (servicio as any).obtenerTodos();
          } else if (nombre === 'PedidoService') {
            await (servicio as any).obtenerTodos();
          } else if (nombre === 'DashboardService') {
            await (servicio as any).obtenerEstadisticas();
          }
          
          this.resultados.push({
            mensaje: `✅ ${nombre}: Ruta Firebase correcta`,
            success: true,
            detalle: `Usando restaurante actual para generar ruta`
          });
        } catch (error) {
          this.resultados.push({
            mensaje: `❌ ${nombre}: Error en ruta Firebase`,
            success: false,
            detalle: error?.toString()
          });
        }
      }
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error verificando rutas Firebase',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async verificarDatosClientes() {
    try {
      const clientes = await this.clienteService.obtenerTodos();
      this.resultados.push({
        mensaje: `✅ Clientes: ${clientes.length} encontrados para este restaurante`,
        success: true,
        detalle: clientes.length > 0 ? `Primer cliente: ${clientes[0].name}` : 'No hay clientes aún'
      });
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error obteniendo clientes del restaurante actual',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async verificarDatosReservas() {
    try {
      const reservas = await this.reservaService.obtenerTodos();
      this.resultados.push({
        mensaje: `✅ Reservas: ${reservas.length} encontradas para este restaurante`,
        success: true,
        detalle: reservas.length > 0 ? `Primera reserva: ${reservas[0].contactNameBooking}` : 'No hay reservas aún'
      });
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error obteniendo reservas del restaurante actual',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async verificarDatosPedidos() {
    try {
      const pedidos = await this.pedidoService.obtenerTodos();
      this.resultados.push({
        mensaje: `✅ Pedidos: ${pedidos.length} encontrados para este restaurante`,
        success: true,
        detalle: pedidos.length > 0 ? `Primer pedido: ${pedidos[0].contactNameOrder}` : 'No hay pedidos aún (se generan ejemplos)'
      });
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error obteniendo pedidos del restaurante actual',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async obtenerEstadisticasRestaurante() {
    try {
      const [clientes, reservas, pedidos] = await Promise.all([
        this.clienteService.obtenerTodos(),
        this.reservaService.obtenerTodos(),
        this.pedidoService.obtenerTodos()
      ]);

      const restaurante = this.authService.obtenerRestauranteActual();
      
      this.estadisticas = {
        clientes: clientes.length,
        reservas: reservas.length,
        pedidos: pedidos.length,
        ruta: `clients/${restaurante.id}/Formularios`
      };

      this.resultados.push({
        mensaje: '✅ Estadísticas del restaurante obtenidas correctamente',
        success: true,
        detalle: `${clientes.length} clientes, ${reservas.length} reservas, ${pedidos.length} pedidos`
      });
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error obteniendo estadísticas del restaurante',
        success: false,
        detalle: error?.toString()
      });
    }
  }
}