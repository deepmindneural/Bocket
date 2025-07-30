import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardService, DashboardStats, VentaDiaria, ProductoTop } from '../servicios/dashboard.service';
import { AuthService } from '../servicios/auth.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-mejorado',
  templateUrl: './dashboard-mejorado.component.html',
  styleUrls: ['./dashboard-mejorado.component.scss'],
  standalone: false
})
export class DashboardMejoradoComponent implements OnInit, AfterViewInit {
  
  @ViewChild('ventasChart', { static: false }) ventasChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('reservasChart', { static: false }) reservasChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pedidosChart', { static: false }) pedidosChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('productosChart', { static: false }) productosChartRef!: ElementRef<HTMLCanvasElement>;
  
  // Estado
  cargando = true;
  error: string | null = null;
  restauranteSlug: string | null = null;
  restauranteActual: any = null;
  
  // Estadísticas
  stats: DashboardStats = {
    clientesTotal: 0,
    clientesNuevos: 0,
    pedidosHoy: 0,
    pedidosActivos: 0,
    ventasHoy: 0,
    ventasMes: 0,
    reservasHoy: 0,
    reservasPendientes: 0
  };
  
  // Datos para gráficos
  ventasUltimos7Dias: VentaDiaria[] = [];
  productosTop: ProductoTop[] = [];
  distribucionPedidos: any[] = [];
  actividadReciente: any[] = [];
  
  // Gráficos
  private ventasChart: Chart | null = null;
  private reservasChart: Chart | null = null;
  private pedidosChart: Chart | null = null;
  private productosChart: Chart | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.restauranteSlug = this.route.snapshot.paramMap.get('restauranteSlug');
    
    try {
      // Esperar a que los datos del restaurante estén disponibles
      await this.esperarDatosRestaurante();
      
      await this.cargarDatos();
    } catch (error) {
      console.error('Error inicializando dashboard:', error);
      this.cargando = false;
      // El error ya se estableció en esperarDatosRestaurante()
    }
  }
  
  private async esperarDatosRestaurante(): Promise<void> {
    return new Promise((resolve, reject) => {
      let intentos = 0;
      const maxIntentos = 50; // 5 segundos máximo (50 * 100ms)
      
      const verificarDatos = () => {
        this.restauranteActual = this.authService.obtenerRestauranteActual();
        
        if (this.restauranteActual) {
          console.log('✅ Dashboard: Datos del restaurante disponibles:', this.restauranteActual);
          resolve();
        } else if (intentos >= maxIntentos) {
          console.error('❌ Dashboard: Timeout esperando datos del restaurante');
          this.error = 'No se pudieron cargar los datos del restaurante. Por favor, vuelve a iniciar sesión.';
          reject(new Error('Timeout esperando datos del restaurante'));
        } else {
          intentos++;
          console.log(`⏳ Dashboard: Esperando datos del restaurante... (${intentos}/${maxIntentos})`);
          setTimeout(verificarDatos, 100);
        }
      };
      
      verificarDatos();
    });
  }
  
  ngAfterViewInit() {
    // Los gráficos se inicializan después de que la vista esté lista
    setTimeout(() => {
      this.inicializarGraficos();
    }, 500);
  }
  
  async cargarDatos() {
    try {
      this.cargando = true;
      this.error = null;
      
      // Cargar todas las estadísticas en paralelo
      const [
        stats,
        ventasUltimos7Dias,
        productosTop,
        distribucionPedidos,
        actividadReciente
      ] = await Promise.all([
        this.dashboardService.obtenerEstadisticas(),
        this.dashboardService.obtenerVentasUltimos7Dias(),
        this.dashboardService.obtenerProductosTop(5),
        this.dashboardService.obtenerDistribucionPedidos(),
        this.dashboardService.obtenerActividadReciente(10)
      ]);
      
      this.stats = stats;
      this.ventasUltimos7Dias = ventasUltimos7Dias;
      this.productosTop = productosTop;
      this.distribucionPedidos = distribucionPedidos;
      this.actividadReciente = actividadReciente;
      
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      this.error = 'Error al cargar los datos del dashboard';
    } finally {
      this.cargando = false;
    }
  }
  
  private inicializarGraficos() {
    this.crearGraficoVentas();
    this.crearGraficoReservas();
    this.crearGraficoPedidos();
    this.crearGraficoProductos();
  }
  
  private crearGraficoVentas() {
    if (!this.ventasChartRef || !this.ventasUltimos7Dias.length) return;
    
    const ctx = this.ventasChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const labels = this.ventasUltimos7Dias.map(v => 
      v.fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
    );
    
    const data = this.ventasUltimos7Dias.map(v => v.total);
    
    this.ventasChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Ventas',
          data,
          borderColor: 'rgb(0, 74, 173)',
          backgroundColor: 'rgba(0, 74, 173, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Ventas: ${new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                const val = value as number;
                if (val >= 1000000) {
                  return `$${(val / 1000000).toFixed(1)}M`;
                } else if (val >= 1000) {
                  return `$${(val / 1000).toFixed(0)}K`;
                }
                return new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(val);
              }
            }
          }
        }
      }
    });
  }
  
  calcularTotalVentas(): number {
    return this.ventasUltimos7Dias.reduce((sum, v) => sum + v.total, 0);
  }
  
  private crearGraficoReservas() {
    if (!this.reservasChartRef) return;
    
    const ctx = this.reservasChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    // Datos simulados de reservas por día de la semana
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const reservasPorDia = [8, 12, 15, 18, 25, 32, 28];
    
    this.reservasChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: diasSemana,
        datasets: [{
          label: 'Reservas',
          data: reservasPorDia,
          backgroundColor: 'rgba(214, 54, 160, 0.8)',
          borderColor: 'rgb(214, 54, 160)',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(214, 54, 160, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5
            }
          }
        }
      }
    });
  }
  
  private crearGraficoPedidos() {
    if (!this.pedidosChartRef || !this.distribucionPedidos.length) return;
    
    const ctx = this.pedidosChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const labels = this.distribucionPedidos.map(d => d.tipo);
    const data = this.distribucionPedidos.map(d => d.cantidad);
    
    this.pedidosChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            'rgba(255, 196, 9, 0.8)',
            'rgba(45, 211, 111, 0.8)',
            'rgba(82, 96, 255, 0.8)'
          ],
          borderColor: [
            'rgb(255, 196, 9)',
            'rgb(45, 211, 111)',
            'rgb(82, 96, 255)'
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  private crearGraficoProductos() {
    if (!this.productosChartRef || !this.productosTop.length) return;
    
    const ctx = this.productosChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const labels = this.productosTop.map(p => p.nombre);
    const data = this.productosTop.map(p => p.ventas);
    
    this.productosChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Unidades vendidas',
          data,
          backgroundColor: 'rgba(0, 74, 173, 0.8)',
          borderColor: 'rgb(0, 74, 173)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Navegación
  nuevaReserva() {
    this.router.navigate([`/${this.restauranteSlug}/reservas/nueva`]);
  }
  
  nuevoPedido() {
    this.router.navigate([`/${this.restauranteSlug}/pedidos/nuevo`]);
  }
  
  nuevoCliente() {
    this.router.navigate([`/${this.restauranteSlug}/clientes/nuevo`]);
  }
  
  verReportes() {
    this.router.navigate([`/${this.restauranteSlug}/reportes`]);
  }
  
  irAdAdmin() {
    this.router.navigate(['/admin']);
  }
  
  // Helpers
  calcularPorcentajeCambio(valorActual: number, valorAnterior: number): number {
    if (valorAnterior === 0) return 100;
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
  }
  
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }
  
  ngOnDestroy() {
    // Destruir gráficos al salir del componente
    this.ventasChart?.destroy();
    this.reservasChart?.destroy();
    this.pedidosChart?.destroy();
    this.productosChart?.destroy();
  }
}