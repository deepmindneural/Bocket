import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

@Component({
  selector: 'app-firebase-test',
  template: `
    <ion-content class="ion-padding">
      <div class="test-container">
        <h1>🔥 Prueba de Conexión Firebase</h1>
        <p>Verificando conexión con el proyecto: <strong>bocket-2024</strong></p>
        
        <ion-button 
          expand="block" 
          color="primary" 
          (click)="ejecutarPruebas()"
          [disabled]="ejecutandoPruebas">
          <ion-icon name="play-circle" slot="start"></ion-icon>
          {{ ejecutandoPruebas ? 'Ejecutando Pruebas...' : 'Ejecutar Pruebas de Conexión' }}
        </ion-button>

        <div class="resultados-container" *ngIf="resultados.length > 0">
          <h2>📊 Resultados de las Pruebas</h2>
          
          <ion-card *ngFor="let resultado of resultados" 
                    [color]="getCardColor(resultado.status)">
            <ion-card-header>
              <ion-card-title>
                <ion-icon [name]="getStatusIcon(resultado.status)"></ion-icon>
                {{ resultado.test }}
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Estado:</strong> {{ resultado.status.toUpperCase() }}</p>
              <p><strong>Mensaje:</strong> {{ resultado.message }}</p>
              <div *ngIf="resultado.details" class="detalles">
                <p><strong>Detalles:</strong></p>
                <pre>{{ resultado.details | json }}</pre>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Sección de pruebas de escritura -->
        <div class="acciones-container" *ngIf="conexionExitosa">
          <h2>✍️ Pruebas de Escritura</h2>
          
          <ion-button 
            expand="block" 
            color="secondary" 
            (click)="crearUsuarioPrueba()"
            [disabled]="ejecutandoPruebas">
            <ion-icon name="person-add" slot="start"></ion-icon>
            Crear Usuario de Prueba
          </ion-button>

          <ion-button 
            expand="block" 
            color="tertiary" 
            (click)="crearRestaurantePrueba()"
            [disabled]="ejecutandoPruebas">
            <ion-icon name="restaurant" slot="start"></ion-icon>
            Crear Restaurante de Prueba
          </ion-button>

          <ion-button 
            expand="block" 
            color="warning" 
            (click)="limpiarDatosPrueba()"
            [disabled]="ejecutandoPruebas">
            <ion-icon name="trash" slot="start"></ion-icon>
            Limpiar Datos de Prueba
          </ion-button>
        </div>

        <!-- Información del proyecto -->
        <div class="info-container">
          <h2>ℹ️ Información del Proyecto</h2>
          <ion-list>
            <ion-item>
              <ion-label>
                <h3>Proyecto ID</h3>
                <p>{{ projectInfo.projectId }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Auth Domain</h3>
                <p>{{ projectInfo.authDomain }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Storage Bucket</h3>
                <p>{{ projectInfo.storageBucket }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .resultados-container {
      margin-top: 20px;
    }

    .acciones-container {
      margin: 30px 0;
    }

    .info-container {
      margin-top: 30px;
    }

    .detalles {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
    }

    .detalles pre {
      font-size: 12px;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    h1 {
      text-align: center;
      margin-bottom: 20px;
    }

    h2 {
      color: var(--ion-color-primary);
      margin: 20px 0 10px 0;
    }
  `],
  standalone: false
})
export class FirebaseTestComponent implements OnInit {

  ejecutandoPruebas = false;
  conexionExitosa = false;
  resultados: TestResult[] = [];

  projectInfo = {
    projectId: 'bocket-2024',
    authDomain: 'bocket-2024.firebaseapp.com',
    storageBucket: 'bocket-2024.appspot.com'
  };

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    console.log('🔥 Componente de prueba Firebase inicializado');
  }

  async ejecutarPruebas() {
    this.ejecutandoPruebas = true;
    this.resultados = [];
    this.conexionExitosa = false;

    console.log('🚀 Iniciando pruebas de conexión Firebase...');

    // 1. Prueba de inicialización Firebase
    await this.probarInicializacionFirebase();

    // 2. Prueba de conexión Auth
    await this.probarConexionAuth();

    // 3. Prueba de conexión Firestore
    await this.probarConexionFirestore();

    // 4. Prueba de conexión Storage
    await this.probarConexionStorage();

    // 5. Prueba de lectura de datos
    await this.probarLecturaDatos();

    this.ejecutandoPruebas = false;
    
    // Verificar si todas las pruebas básicas pasaron
    const pruebasBasicas = this.resultados.filter(r => 
      ['Firebase App', 'Firebase Auth', 'Firestore'].includes(r.test)
    );
    this.conexionExitosa = pruebasBasicas.every(r => r.status === 'success');

    console.log('✅ Pruebas completadas. Conexión exitosa:', this.conexionExitosa);
  }

  private async probarInicializacionFirebase() {
    try {
      // Verificar que Firebase esté inicializado
      const app = await this.auth.app;
      const options = app.options as any;
      
      this.resultados.push({
        test: 'Firebase App',
        status: 'success',
        message: 'Firebase App inicializada correctamente',
        details: {
          projectId: options?.projectId || 'N/A',
          authDomain: options?.authDomain || 'N/A'
        }
      });
    } catch (error) {
      this.resultados.push({
        test: 'Firebase App',
        status: 'error',
        message: 'Error al inicializar Firebase App',
        details: error
      });
    }
  }

  private async probarConexionAuth() {
    try {
      // Verificar estado de Auth
      const user = await this.auth.authState.pipe().toPromise();
      
      this.resultados.push({
        test: 'Firebase Auth',
        status: 'success',
        message: user ? 'Usuario autenticado encontrado' : 'Auth funcionando - sin usuario autenticado',
        details: user ? {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        } : null
      });
    } catch (error) {
      this.resultados.push({
        test: 'Firebase Auth',
        status: 'error',
        message: 'Error al conectar con Firebase Auth',
        details: error
      });
    }
  }

  private async probarConexionFirestore() {
    try {
      // Probar conexión a Firestore con una consulta simple
      const testDoc = await this.firestore
        .collection('test')
        .doc('connection')
        .get()
        .toPromise();
      
      this.resultados.push({
        test: 'Firestore',
        status: 'success',
        message: 'Conexión a Firestore exitosa',
        details: {
          exists: testDoc?.exists,
          data: testDoc?.data()
        }
      });
    } catch (error) {
      this.resultados.push({
        test: 'Firestore',
        status: 'error',
        message: 'Error al conectar con Firestore',
        details: error
      });
    }
  }

  private async probarConexionStorage() {
    try {
      // Probar conexión a Storage
      const storageRef = this.storage.ref('test/connection-test.txt');
      const downloadURL = await storageRef.getDownloadURL().toPromise().catch(() => null);
      
      this.resultados.push({
        test: 'Firebase Storage',
        status: 'success',
        message: 'Conexión a Storage exitosa',
        details: {
          testFileExists: !!downloadURL,
          downloadURL: downloadURL
        }
      });
    } catch (error) {
      this.resultados.push({
        test: 'Firebase Storage',
        status: 'error',
        message: 'Error al conectar con Storage',
        details: error
      });
    }
  }

  private async probarLecturaDatos() {
    try {
      // Intentar leer colección de restaurantes
      const restaurantes = await this.firestore
        .collection('restaurantes')
        .get()
        .toPromise();
      
      this.resultados.push({
        test: 'Lectura de Datos',
        status: 'success',
        message: `Lectura exitosa - ${restaurantes?.size || 0} restaurantes encontrados`,
        details: {
          collectionSize: restaurantes?.size || 0,
          hasData: (restaurantes?.size || 0) > 0
        }
      });
    } catch (error) {
      this.resultados.push({
        test: 'Lectura de Datos',
        status: 'error',
        message: 'Error al leer datos de Firestore',
        details: error
      });
    }
  }

  async crearUsuarioPrueba() {
    this.ejecutandoPruebas = true;
    
    try {
      const usuarioPrueba = {
        email: 'prueba@bocket.com',
        nombreCompleto: 'Usuario de Prueba',
        activo: true,
        restaurantes: [],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        tipo: 'prueba'
      };

      await this.firestore
        .collection('usuarios')
        .doc('usuario-prueba-' + Date.now())
        .set(usuarioPrueba);

      this.resultados.push({
        test: 'Crear Usuario',
        status: 'success',
        message: 'Usuario de prueba creado exitosamente',
        details: usuarioPrueba
      });
    } catch (error) {
      this.resultados.push({
        test: 'Crear Usuario',
        status: 'error',
        message: 'Error al crear usuario de prueba',
        details: error
      });
    }

    this.ejecutandoPruebas = false;
  }

  async crearRestaurantePrueba() {
    this.ejecutandoPruebas = true;
    
    try {
      const restaurantePrueba = {
        slug: 'restaurante-prueba-' + Date.now(),
        nombre: 'Restaurante de Prueba',
        descripcion: 'Restaurante creado para pruebas de conexión',
        colorPrimario: '#FF6B6B',
        colorSecundario: '#4ECDC4',
        telefono: '+57 300 123 4567',
        direccion: 'Calle de Prueba #123',
        ciudad: 'Bogotá',
        activo: true,
        fechaCreacion: new Date(),
        tipo: 'prueba'
      };

      await this.firestore
        .collection('restaurantes')
        .doc('rest-prueba-' + Date.now())
        .set(restaurantePrueba);

      this.resultados.push({
        test: 'Crear Restaurante',
        status: 'success',
        message: 'Restaurante de prueba creado exitosamente',
        details: restaurantePrueba
      });
    } catch (error) {
      this.resultados.push({
        test: 'Crear Restaurante',
        status: 'error',
        message: 'Error al crear restaurante de prueba',
        details: error
      });
    }

    this.ejecutandoPruebas = false;
  }

  async limpiarDatosPrueba() {
    this.ejecutandoPruebas = true;
    
    try {
      // Limpiar usuarios de prueba
      const usuarios = await this.firestore
        .collection('usuarios')
        .ref
        .where('tipo', '==', 'prueba')
        .get();

      // Limpiar restaurantes de prueba
      const restaurantes = await this.firestore
        .collection('restaurantes')
        .ref
        .where('tipo', '==', 'prueba')
        .get();

      const batch = this.firestore.firestore.batch();

      usuarios.forEach(doc => {
        batch.delete(doc.ref);
      });

      restaurantes.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      this.resultados.push({
        test: 'Limpiar Datos',
        status: 'success',
        message: `Limpieza exitosa - ${usuarios.size + restaurantes.size} documentos eliminados`,
        details: {
          usuariosEliminados: usuarios.size,
          restaurantesEliminados: restaurantes.size
        }
      });
    } catch (error) {
      this.resultados.push({
        test: 'Limpiar Datos',
        status: 'error',
        message: 'Error al limpiar datos de prueba',
        details: error
      });
    }

    this.ejecutandoPruebas = false;
  }

  getCardColor(status: string): string {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'danger';
      default: return 'medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      default: return 'time';
    }
  }
}