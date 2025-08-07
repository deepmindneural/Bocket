import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ClienteService } from './servicios/cliente.service';
import { ReservaService } from './servicios/reserva.service';
import { PedidoService } from './servicios/pedido.service';
import { DashboardService } from './servicios/dashboard.service';

@Component({
  selector: 'app-verificacion-temporal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>🔥 Verificación Firebase</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="verification-container">
        <h2>📊 Estado de Conexión Firebase</h2>
        
        <ion-card>
          <ion-card-header>
            <ion-card-title>🎯 Pruebas de Conexión</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button 
              expand="block" 
              color="primary" 
              (click)="ejecutarVerificacion()"
              [disabled]="verificando">
              {{ verificando ? 'Verificando...' : '🚀 Ejecutar Verificación Completa' }}
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="resultados.length > 0">
          <ion-card-header>
            <ion-card-title>📋 Resultados</ion-card-title>
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
            <ion-card-title>📈 Estadísticas Actuales</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticas.clientesTotal }}</div>
                    <div class="stat-label">Clientes Total</div>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticas.clientesNuevos }}</div>
                    <div class="stat-label">Clientes Nuevos</div>
                  </div>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col size="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticas.reservasHoy }}</div>
                    <div class="stat-label">Reservas Hoy</div>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="stat-item">
                    <div class="stat-number">{{ estadisticas.pedidosHoy }}</div>
                    <div class="stat-label">Pedidos Hoy</div>
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
export class VerificacionTemporalComponent implements OnInit {
  
  verificando = false;
  resultados: Array<{mensaje: string, success: boolean, detalle?: string}> = [];
  estadisticas: any = null;

  constructor(
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private pedidoService: PedidoService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    console.log('🔥 Componente de verificación inicializado');
  }

  async ejecutarVerificacion() {
    this.verificando = true;
    this.resultados = [];
    this.estadisticas = null;

    try {
      // 1. Verificar conexión con clientes
      await this.verificarClientes();
      
      // 2. Verificar conexión con reservas  
      await this.verificarReservas();
      
      // 3. Verificar conexión con pedidos
      await this.verificarPedidos();
      
      // 4. Verificar dashboard
      await this.verificarDashboard();
      
      // 5. Probar creación de datos
      await this.probarCreacionDatos();
      
    } catch (error) {
      this.resultados.push({
        mensaje: 'Error general en la verificación',
        success: false,
        detalle: error?.toString()
      });
    } finally {
      this.verificando = false;
    }
  }

  private async verificarClientes() {
    try {
      const clientes = await this.clienteService.obtenerTodos();
      this.resultados.push({
        mensaje: `✅ Clientes: ${clientes.length} encontrados`,
        success: true,
        detalle: clientes.length > 0 ? `Primer cliente: ${clientes[0].name}` : 'No hay clientes'
      });
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error obteniendo clientes',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async verificarReservas() {
    try {
      const reservas = await this.reservaService.obtenerTodos();
      this.resultados.push({
        mensaje: `✅ Reservas: ${reservas.length} encontradas`,
        success: true,
        detalle: reservas.length > 0 ? `Primera reserva: ${reservas[0].contactNameBooking}` : 'No hay reservas'
      });
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error obteniendo reservas',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async verificarPedidos() {
    try {
      const pedidos = await this.pedidoService.obtenerTodos();
      this.resultados.push({
        mensaje: `✅ Pedidos: ${pedidos.length} encontrados`,
        success: true,
        detalle: pedidos.length > 0 ? `Primer pedido: ${pedidos[0].contactNameOrder}` : 'No hay pedidos (se generan ejemplos)'
      });
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error obteniendo pedidos',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async verificarDashboard() {
    try {
      const stats = await this.dashboardService.obtenerEstadisticas();
      this.estadisticas = stats;
      this.resultados.push({
        mensaje: `✅ Dashboard: Estadísticas cargadas`,
        success: true,
        detalle: `${stats.clientesTotal} clientes, ${stats.reservasHoy} reservas hoy`
      });
    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error obteniendo estadísticas',
        success: false,
        detalle: error?.toString()
      });
    }
  }

  private async probarCreacionDatos() {
    try {
      // Crear cliente de prueba
      const nuevoCliente = await this.clienteService.crear({
        id: '573' + Date.now().toString().slice(-9), // Número de WhatsApp válido
        name: 'Cliente Verificación Test',
        email: 'test@verificacion.com',
        labels: 'cliente_test'
      });
      
      this.resultados.push({
        mensaje: '✅ Creación de cliente: EXITOSA',
        success: true,
        detalle: `Cliente creado con ID: ${nuevoCliente.id}`
      });

      // Crear reserva de prueba
      const nuevaReserva = await this.reservaService.crear({
        contactNameBooking: 'Reserva Test Verificación',
        peopleBooking: '2',
        finalPeopleBooking: 2,
        dateBooking: new Date().toISOString(),
        detailsBooking: 'Prueba de verificación'
      });
      
      this.resultados.push({
        mensaje: '✅ Creación de reserva: EXITOSA',
        success: true,
        detalle: `Reserva creada con ID: ${nuevaReserva.id}`
      });

    } catch (error) {
      this.resultados.push({
        mensaje: '❌ Error creando datos de prueba',
        success: false,
        detalle: error?.toString()
      });
    }
  }
}