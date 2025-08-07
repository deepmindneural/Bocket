import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: false
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  
  sidebarCollapsed = false;
  pageTitle = 'Dashboard';
  isMenuOpen = false;
  isMobile = false;
  
  // Datos para badges de navegación
  clientesCount = 156;
  reservasPendientes = 8;
  pedidosActivos = 12;

  // Usuario y restaurante actual
  usuarioActual: any = null;
  restauranteActual: any = null;
  mostrarMenuUsuario = false;

  // Suscripciones para limpiar en onDestroy
  private subscriptions: Subscription[] = [];
  
  // Control para evitar bucles infinitos de recarga
  private recargandoDatos = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Configurar detección móvil y listener de resize
    this.checkMobileView();
    this.setupResizeListener();

    // Suscribirse a cambios de autenticación
    const authSubscription = this.authService.user$.subscribe((user) => {
      if (user) {
        // Usuario autenticado, cargar datos
        this.cargarDatosUsuario();
      } else {
        // Usuario no autenticado
        console.log('❌ MainLayout: Usuario no autenticado, redirigiendo...');
        this.router.navigate(['/login']);
      }
    });
    this.subscriptions.push(authSubscription);

    // Actualizar título según la ruta actual
    const routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.urlAfterRedirects);
        // Solo cargar datos del restaurante si no los tenemos
        if (!this.restauranteActual && !this.recargandoDatos) {
          console.log('🔄 MainLayout: Navegación detectada sin datos de restaurante, cargando...');
          this.cargarDatosUsuario();
        }
      });
    this.subscriptions.push(routerSubscription);
    
    // Título inicial
    this.updatePageTitle(this.router.url);
  }

  private cargarDatosUsuario(): void {
    // Prevenir bucles infinitos
    if (this.recargandoDatos) {
      console.log('🔄 MainLayout: Ya se están cargando los datos, evitando bucle infinito');
      return;
    }
    
    this.recargandoDatos = true;
    
    // Función para cargar y verificar datos
    const verificarYCargarDatos = () => {
      this.usuarioActual = this.authService.obtenerUsuarioActual();
      this.restauranteActual = this.authService.obtenerRestauranteActual();
      
      console.log('🏗️ MainLayout: Usuario actual:', !!this.usuarioActual);
      console.log('🏪 MainLayout: Restaurante actual:', !!this.restauranteActual);
      console.log('📛 MainLayout: Nombre del restaurante para mostrar:', this.restauranteActual?.nombre);
      
      // Si no hay datos, intentar de nuevo hasta un máximo de intentos
      if (!this.restauranteActual && this.authService.estaAutenticado()) {
        let intentos = 0;
        const maxIntentos = 5; // Reducir intentos para evitar bucles
        
        const reintentarCarga = () => {
          this.restauranteActual = this.authService.obtenerRestauranteActual();
          console.log(`🔄 MainLayout: Intento ${intentos + 1}/${maxIntentos} - Restaurante encontrado:`, !!this.restauranteActual);
          
          if (!this.restauranteActual && intentos < maxIntentos) {
            intentos++;
            setTimeout(reintentarCarga, 500); // Aumentar delay entre intentos
          } else {
            if (this.restauranteActual) {
              console.log('✅ MainLayout: Datos del restaurante cargados exitosamente');
            } else {
              console.log('⚠️ MainLayout: No se pudieron cargar los datos del restaurante después de varios intentos');
            }
            this.recargandoDatos = false; // Liberar el lock
          }
        };
        
        setTimeout(reintentarCarga, 200);
      } else {
        this.recargandoDatos = false; // Liberar el lock
      }
    };
    
    // Pequeño delay inicial y luego verificar
    setTimeout(verificarYCargarDatos, 100);
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.isMenuOpen = !this.isMenuOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  checkMobileView() {
    this.isMobile = window.innerWidth <= 768;
    
    // En móvil, controlar por isMenuOpen en lugar de sidebarCollapsed
    if (this.isMobile) {
      this.isMenuOpen = false; // Cerrar menu por defecto en móvil
    }
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.checkMobileView();
    });
  }

  toggleMenuUsuario() {
    this.mostrarMenuUsuario = !this.mostrarMenuUsuario;
  }

  async cerrarSesion() {
    await this.authService.logout();
  }

  // Manejar error de logo (fallback)
  onLogoError(event: any) {
    console.warn('Error cargando logo del restaurante, usando logo por defecto');
    event.target.src = 'assets/logo.png'; // Fallback al logo por defecto
  }

  // Método para cargar configuración del restaurante (será dinámico)
  private cargarConfiguracionRestaurante(slug: string) {
    // Este método se mantendrá para futura implementación con Firebase
    // Por ahora, la configuración viene del AuthService
    console.log('Método cargarConfiguracionRestaurante no se usa en modo mock');
  }

  private updatePageTitle(url: string) {
    const routeTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/clientes': 'Gestión de Clientes',
      '/reservas': 'Gestión de Reservas',
      '/pedidos': 'Gestión de Pedidos',
      '/productos': 'Catálogo de Productos',
      '/categorias': 'Categorías',
      '/reportes': 'Reportes Ejecutivos',
      '/analytics': 'Analytics Avanzado',
      '/configuracion-restaurante': 'Configuración del Restaurante'
    };

    // Buscar coincidencia exacta o parcial
    const matchedRoute = Object.keys(routeTitles).find(route => 
      url.startsWith(route)
    );
    
    if (matchedRoute) {
      this.pageTitle = routeTitles[matchedRoute];
    } else {
      this.pageTitle = this.restauranteActual?.nombre || 'Dashboard';
    }
    
    // ELIMINADO: La lógica de recarga forzada que causaba bucles infinitos
    // Los datos del restaurante se cargan correctamente desde cargarDatosUsuario()
  }
}