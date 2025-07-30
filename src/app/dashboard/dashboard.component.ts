import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClienteService } from '../servicios/cliente.service';
import { RestauranteService } from '../servicios/restaurante.service';
import { AuthService } from '../servicios/auth.service';

interface EstadisticaDashboard {
  titulo: string;
  valor: number;
  cambio: number;
  icono: string;
  color: string;
  formato: 'numero' | 'moneda' | 'porcentaje';
}

interface ResumenVenta {
  fecha: Date;
  total: number;
  pedidos: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {

  cargando = true;
  error: string | null = null;
  restauranteSlug: string | null = null;

  // Estadísticas principales
  estadisticas: EstadisticaDashboard[] = [
    {
      titulo: 'Clientes Totales',
      valor: 0,
      cambio: 0,
      icono: 'people',
      color: 'primary',
      formato: 'numero'
    },
    {
      titulo: 'Reservas Hoy',
      valor: 0,
      cambio: 0,
      icono: 'calendar',
      color: 'secondary',
      formato: 'numero'
    },
    {
      titulo: 'Pedidos Activos',
      valor: 0,
      cambio: 0,
      icono: 'receipt',
      color: 'warning',
      formato: 'numero'
    },
    {
      titulo: 'Ingresos del Mes',
      valor: 0,
      cambio: 0,
      icono: 'trending-up',
      color: 'success',
      formato: 'moneda'
    }
  ];

  // Información del restaurante actual (será dinámico)
  restauranteActual = {
    nombre: 'Mi Restaurante',
    slug: 'principal',
    moneda: 'COP',
    ciudad: 'Bogotá'
  };

  // Datos para dashboard
  ventasUltimos7Dias: ResumenVenta[] = [];
  clientesRecientes: any[] = [];
  reservasProximas: any[] = [];
  
  // Top productos - Precios en pesos colombianos
  topProductos = [
    { nombre: 'Bandeja Paisa', categoria: 'Platos Típicos', ventas: 145, ingresos: 4350000 },
    { nombre: 'Arepas Rellenas', categoria: 'Desayunos', ventas: 132, ingresos: 1848000 },
    { nombre: 'Sancocho de Gallina', categoria: 'Sopas', ventas: 98, ingresos: 2352000 },
    { nombre: 'Pescado Frito', categoria: 'Mariscos', ventas: 87, ingresos: 2610000 },
    { nombre: 'Pollo Asado', categoria: 'Asados', ventas: 76, ingresos: 1596000 }
  ];

  // Estado de carga
  cargandoEstadisticas = true;
  cargandoVentas = true;
  cargandoClientes = true;
  cargandoReservas = true;

  // Propiedades para el template
  totalClientes = 0;
  nuevosClientesMes = 0;
  reservasHoy = 0;
  reservasPendientes = 0;
  ventasHoy = 0;
  progresoMeta = 0;
  pedidosActivos = 0;
  pedidosEnPreparacion = 0;
  actividadReciente: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private restauranteService: RestauranteService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.restauranteSlug = this.route.snapshot.paramMap.get('restauranteSlug');
    await this.cargarDatosDashboard();
  }

  async cargarDatosDashboard() {
    try {
      this.cargando = true;
      this.error = null;

      // Cargar datos simulados por ahora
      await this.cargarEstadisticas();
      await this.cargarClientesRecientes();
      await this.cargarReservasProximas();

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      this.error = 'Error al cargar los datos del dashboard';
    } finally {
      this.cargando = false;
    }
  }

  async cargarEstadisticas() {
    try {
      this.cargandoEstadisticas = true;

      // Datos simulados
      this.estadisticas[0].valor = 156; // Clientes totales
      this.estadisticas[0].cambio = 12;
      this.totalClientes = 156;
      this.nuevosClientesMes = 12;
      
      this.estadisticas[1].valor = 8; // Reservas hoy
      this.estadisticas[1].cambio = -5;
      this.reservasHoy = 8;
      this.reservasPendientes = 3;
      
      this.estadisticas[2].valor = 12; // Pedidos activos
      this.estadisticas[2].cambio = 25;
      this.pedidosActivos = 12;
      this.pedidosEnPreparacion = 5;
      
      this.estadisticas[3].valor = 15750000; // Ingresos mes
      this.estadisticas[3].cambio = 18;
      this.ventasHoy = 2450000;
      this.progresoMeta = 75;

      // Actividad reciente simulada
      this.actividadReciente = [
        { tipo: 'cliente', mensaje: 'Nuevo cliente registrado: Carlos Rodríguez', fecha: new Date() },
        { tipo: 'reserva', mensaje: 'Reserva confirmada para 4 personas', fecha: new Date(Date.now() - 3600000) },
        { tipo: 'pedido', mensaje: 'Pedido completado: Bandeja Paisa', fecha: new Date(Date.now() - 7200000) }
      ];

    } finally {
      this.cargandoEstadisticas = false;
    }
  }

  async cargarClientesRecientes() {
    try {
      this.cargandoClientes = true;

      this.clientesRecientes = [
        {
          nombre: 'Carlos Rodríguez',
          email: 'carlos@ejemplo.com',
          fechaRegistro: new Date(),
          totalPedidos: 145000,
          tipoCliente: 'vip'
        },
        {
          nombre: 'María González',
          email: 'maria@ejemplo.com',
          fechaRegistro: new Date(Date.now() - 86400000),
          totalPedidos: 89000,
          tipoCliente: 'regular'
        },
        {
          nombre: 'Ana López',
          email: 'ana@ejemplo.com',
          fechaRegistro: new Date(Date.now() - 172800000),
          totalPedidos: 234000,
          tipoCliente: 'corporativo'
        }
      ];

    } finally {
      this.cargandoClientes = false;
    }
  }

  async cargarReservasProximas() {
    try {
      this.cargandoReservas = true;

      this.reservasProximas = [
        {
          cliente: 'Pedro Martínez',
          fecha: new Date(Date.now() + 3600000),
          personas: 4,
          estado: 'confirmada'
        },
        {
          cliente: 'Laura Silva',
          fecha: new Date(Date.now() + 7200000),
          personas: 2,
          estado: 'pendiente'
        }
      ];

    } finally {
      this.cargandoReservas = false;
    }
  }

  // Métodos de utilidad
  formatearValor(valor: number, formato: string): string {
    switch (formato) {
      case 'moneda':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(valor);
      case 'numero':
      default:
        return new Intl.NumberFormat('es-CO').format(valor);
    }
  }

  obtenerClaseCambio(cambio: number): string {
    return cambio >= 0 ? 'cambio-positivo' : 'cambio-negativo';
  }

  obtenerIconoCambio(cambio: number): string {
    return cambio >= 0 ? 'trending-up' : 'trending-down';
  }

  // Acciones rápidas
  irAClientes() {
    this.router.navigate([`/${this.restauranteSlug}/clientes`]);
  }

  irAReservas() {
    this.router.navigate([`/${this.restauranteSlug}/reservas`]);
  }

  nuevoCliente() {
    this.router.navigate([`/${this.restauranteSlug}/clientes/nuevo`]);
  }

  nuevaReserva() {
    this.router.navigate([`/${this.restauranteSlug}/reservas/nueva`]);
  }

  nuevoPedido() {
    this.router.navigate([`/${this.restauranteSlug}/pedidos/nuevo`]);
  }

  verReportes() {
    this.router.navigate([`/${this.restauranteSlug}/reportes`]);
  }

  irAdAdmin() {
    this.router.navigate(['/admin']);
  }
}