import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-test-firestore',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="test-page">
      <h1>🔍 Test Directo Firestore</h1>
      
      <ion-button (click)="probarConexion()" [disabled]="cargando">
        {{ cargando ? 'Probando...' : 'Probar Conexión Directa' }}
      </ion-button>
      
      <div *ngIf="resultados.length > 0" class="resultados">
        <h3>Resultados:</h3>
        <div *ngFor="let resultado of resultados" class="resultado-item">
          <strong>{{ resultado.coleccion }}:</strong> {{ resultado.mensaje }}
          <div *ngIf="resultado.datos && resultado.datos.length > 0" class="datos">
            <h4>Primeros datos encontrados:</h4>
            <pre>{{ resultado.datos | json }}</pre>
          </div>
        </div>
      </div>
      
      <div *ngIf="errores.length > 0" class="errores">
        <h3>Errores:</h3>
        <div *ngFor="let error of errores" class="error-item">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-page {
      padding: 20px;
    }
    
    .resultados {
      margin-top: 20px;
      background: #f0f8ff;
      padding: 15px;
      border-radius: 8px;
    }
    
    .resultado-item {
      margin-bottom: 15px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    
    .datos {
      margin-top: 10px;
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
    }
    
    .datos pre {
      font-size: 12px;
      overflow-x: auto;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .errores {
      margin-top: 20px;
      background: #ffebee;
      padding: 15px;
      border-radius: 8px;
    }
    
    .error-item {
      color: #d32f2f;
      margin-bottom: 5px;
    }
  `]
})
export class TestFirestoreComponent implements OnInit {
  
  cargando = false;
  resultados: any[] = [];
  errores: string[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    console.log('🔥 TestFirestore component initialized');
  }

  async probarConexion() {
    this.cargando = true;
    this.resultados = [];
    this.errores = [];
    
    console.log('🔍 Iniciando pruebas usando AdminService...');
    
    try {
      console.log('✅ AdminService disponible');
      
      // Test 1: Verificar colección 'restaurantes'
      const restaurantes = await this.adminService.obtenerTodosRestaurantes();
      this.resultados.push({
        coleccion: 'restaurantes',
        mensaje: `${restaurantes.length} documentos encontrados`,
        datos: restaurantes.slice(0, 3)
      });
      
      // Test 2: Verificar colección 'usuarios'
      const usuarios = await this.adminService.obtenerTodosUsuarios();
      this.resultados.push({
        coleccion: 'usuarios',
        mensaje: `${usuarios.length} documentos encontrados`,
        datos: usuarios.slice(0, 3)
      });
      
      // Test 3: Verificar pedidos de todos los restaurantes
      const pedidos = await this.adminService.obtenerTodosPedidos();
      this.resultados.push({
        coleccion: 'pedidos (todas las sucursales)',
        mensaje: `${pedidos.length} documentos encontrados`,
        datos: pedidos.slice(0, 3)
      });
      
      // Test 4: Verificar clientes de todos los restaurantes
      const clientes = await this.adminService.obtenerTodosClientes();
      this.resultados.push({
        coleccion: 'clientes (todas las sucursales)',
        mensaje: `${clientes.length} documentos encontrados`,
        datos: clientes.slice(0, 3)
      });
      
      // Test 5: Verificar reservas de todos los restaurantes
      const reservas = await this.adminService.obtenerTodasReservas();
      this.resultados.push({
        coleccion: 'reservas (todas las sucursales)',
        mensaje: `${reservas.length} documentos encontrados`,
        datos: reservas.slice(0, 3)
      });
      
    } catch (error) {
      console.error('❌ Error general:', error);
      this.errores.push(`Error general: ${error}`);
    }
    
    this.cargando = false;
    console.log('🔍 Pruebas completadas');
  }
  
}