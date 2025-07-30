import { Component } from '@angular/core';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-firebase-config',
  template: `
    <div class="config-container">
      <h2>🔧 Configuración de Base de Datos</h2>
      
      <div class="config-options">
        <div class="option-card" [class.active]="!isUsingFirebase">
          <h3>📝 Modo MOCK (Desarrollo)</h3>
          <p>Usa datos simulados almacenados localmente</p>
          <ul>
            <li>✅ Funciona sin conexión</li>
            <li>✅ Datos de prueba incluidos</li>
            <li>❌ No persiste entre sesiones del navegador</li>
          </ul>
          <button 
            class="btn-primary" 
            (click)="setMockMode()"
            [disabled]="!isUsingFirebase">
            Usar Modo Mock
          </button>
        </div>

        <div class="option-card" [class.active]="isUsingFirebase">
          <h3>🔥 Modo FIREBASE (Producción)</h3>
          <p>Usa Firebase/Firestore como base de datos</p>
          <ul>
            <li>✅ Datos persistentes</li>
            <li>✅ Sincronización en tiempo real</li>
            <li>❌ Requiere conexión a internet</li>
            <li>❌ Requiere configuración inicial</li>
          </ul>
          <button 
            class="btn-primary" 
            (click)="setFirebaseMode()"
            [disabled]="isUsingFirebase">
            Usar Firebase
          </button>
        </div>
      </div>

      <div class="current-status">
        <h3>Estado Actual:</h3>
        <div class="status-badge" [class.firebase]="isUsingFirebase" [class.mock]="!isUsingFirebase">
          {{ isUsingFirebase ? '🔥 Firebase Activo' : '📝 Mock Activo' }}
        </div>
      </div>

      <div class="instructions" *ngIf="isUsingFirebase">
        <h3>📋 Credenciales de Firebase configuradas:</h3>
        <ul>
          <li><strong>Proyecto:</strong> bocket-2024</li>
          <li><strong>Usuarios de prueba:</strong></li>
          <ul>
            <li>admin@donpepe.com / 123456</li>
            <li>admin@marinacafe.com / 123456</li>
          </ul>
        </ul>
      </div>

      <div class="instructions" *ngIf="!isUsingFirebase">
        <h3>📋 Credenciales Mock disponibles:</h3>
        <ul>
          <li>admin@restaurante1.com / 123456 (Don Pepe Parrilla)</li>
          <li>admin@restaurante2.com / 123456 (Marina Café & Bistro)</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .config-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .config-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }

    .option-card {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .option-card.active {
      border-color: var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.1);
    }

    .option-card h3 {
      margin: 0 0 10px 0;
      color: var(--ion-color-primary);
    }

    .option-card ul {
      padding-left: 20px;
      margin: 15px 0;
    }

    .option-card li {
      margin: 5px 0;
      font-size: 14px;
    }

    .btn-primary {
      background: var(--ion-color-primary);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--ion-color-primary-shade);
    }

    .current-status {
      text-align: center;
      margin: 30px 0;
    }

    .status-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 16px;
    }

    .status-badge.mock {
      background: #ffd700;
      color: #8b4513;
    }

    .status-badge.firebase {
      background: #ff6b35;
      color: white;
    }

    .instructions {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }

    .instructions ul {
      margin: 10px 0;
    }

    .instructions li {
      margin: 5px 0;
    }

    @media (max-width: 768px) {
      .config-options {
        grid-template-columns: 1fr;
      }
    }
  `],
  standalone: false
})
export class FirebaseConfigComponent {
  isUsingFirebase = false;

  constructor(private authService: AuthService) {}

  setMockMode() {
    this.authService.setUseFirebase(false);
    this.isUsingFirebase = false;
    console.log('Cambiado a modo Mock - Reinicia la aplicación para aplicar cambios');
  }

  setFirebaseMode() {
    this.authService.setUseFirebase(true);
    this.isUsingFirebase = true;
    console.log('Cambiado a modo Firebase - Reinicia la aplicación para aplicar cambios');
  }
}