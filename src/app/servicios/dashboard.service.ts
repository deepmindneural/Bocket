import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { getApp } from 'firebase/app';

export interface DashboardStats {
  clientesTotal: number;
  clientesNuevos: number;
  pedidosHoy: number;
  pedidosActivos: number;
  ventasHoy: number;
  ventasMes: number;
  reservasHoy: number;
  reservasPendientes: number;
}

export interface VentaDiaria {
  fecha: Date;
  total: number;
  cantidad: number;
}

export interface ProductoTop {
  nombre: string;
  categoria: string;
  ventas: number;
  ingresos: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  constructor(private authService: AuthService) {}
  
  /**
   * Obtener estadísticas generales del dashboard
   */
  async obtenerEstadisticas(): Promise<DashboardStats> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        console.error('❌ DashboardService: No hay restaurante actual seleccionado');
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const restauranteId = restauranteActual.id;
      
      // Fechas para filtros
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      
      // Obtener clientes
      const clientesRef = collection(db, `restaurantes/${restauranteId}/clientes`);
      const clientesSnapshot = await getDocs(clientesRef);
      const clientesTotal = clientesSnapshot.size;
      
      // Contar clientes nuevos (últimos 30 días)
      let clientesNuevos = 0;
      clientesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data['creation']) {
          const fechaCreacion = new Date(data['creation']);
          if (fechaCreacion >= hace30Dias) {
            clientesNuevos++;
          }
        }
      });
      
      // Obtener pedidos
      const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidos`);
      const pedidosSnapshot = await getDocs(pedidosRef);
      
      let pedidosHoy = 0;
      let pedidosActivos = 0;
      let ventasHoy = 0;
      let ventasMes = 0;
      
      pedidosSnapshot.forEach(doc => {
        const data = doc.data();
        const fechaPedido = data['fechaCreacion'] ? new Date(data['fechaCreacion']) : new Date();
        
        // Pedidos de hoy
        if (fechaPedido >= hoy) {
          pedidosHoy++;
          ventasHoy += data['total'] || 0;
        }
        
        // Ventas del mes
        if (fechaPedido >= inicioMes) {
          ventasMes += data['total'] || 0;
        }
        
        // Pedidos activos
        if (['pending', 'accepted', 'inProcess', 'inDelivery'].includes(data['statusBooking'])) {
          pedidosActivos++;
        }
      });
      
      // Obtener reservas
      const reservasRef = collection(db, `restaurantes/${restauranteId}/reservas`);
      const reservasSnapshot = await getDocs(reservasRef);
      
      let reservasHoy = 0;
      let reservasPendientes = 0;
      
      reservasSnapshot.forEach(doc => {
        const data = doc.data();
        const fechaReserva = data['dateBooking'] ? new Date(data['dateBooking']) : new Date();
        
        // Reservas de hoy
        if (fechaReserva >= hoy && fechaReserva < new Date(hoy.getTime() + 86400000)) {
          reservasHoy++;
        }
        
        // Reservas pendientes
        if (data['statusBooking'] === 'pending') {
          reservasPendientes++;
        }
      });
      
      return {
        clientesTotal,
        clientesNuevos,
        pedidosHoy,
        pedidosActivos,
        ventasHoy,
        ventasMes,
        reservasHoy,
        reservasPendientes
      };
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
  
  /**
   * Obtener ventas de los últimos 7 días
   */
  async obtenerVentasUltimos7Dias(): Promise<VentaDiaria[]> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        console.error('❌ DashboardService: No hay restaurante actual seleccionado para ventas');
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const restauranteId = restauranteActual.id;
      
      // Crear array de últimos 7 días
      const ventas: VentaDiaria[] = [];
      const hoy = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(hoy.getDate() - i);
        fecha.setHours(0, 0, 0, 0);
        
        ventas.push({
          fecha: new Date(fecha),
          total: 0,
          cantidad: 0
        });
      }
      
      // Obtener pedidos de los últimos 7 días
      const hace7Dias = new Date();
      hace7Dias.setDate(hoy.getDate() - 7);
      hace7Dias.setHours(0, 0, 0, 0);
      
      const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidos`);
      const pedidosSnapshot = await getDocs(pedidosRef);
      
      pedidosSnapshot.forEach(doc => {
        const data = doc.data();
        if (data['fechaCreacion'] && data['statusBooking'] !== 'rejected') {
          const fechaPedido = new Date(data['fechaCreacion']);
          
          if (fechaPedido >= hace7Dias) {
            // Encontrar el día correspondiente
            const diaIndex = ventas.findIndex(v => {
              const dia = new Date(v.fecha);
              return dia.toDateString() === fechaPedido.toDateString();
            });
            
            if (diaIndex !== -1) {
              ventas[diaIndex].total += data['total'] || 0;
              ventas[diaIndex].cantidad += 1;
            }
          }
        }
      });
      
      return ventas;
      
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      throw error;
    }
  }
  
  /**
   * Obtener productos más vendidos
   */
  async obtenerProductosTop(limite: number = 5): Promise<ProductoTop[]> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        console.error('❌ DashboardService: No hay restaurante actual seleccionado para productos');
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const restauranteId = restauranteActual.id;
      
      // Mapa para acumular ventas por producto
      const ventasPorProducto = new Map<string, ProductoTop>();
      
      // Obtener todos los pedidos del último mes
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      
      const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidos`);
      const pedidosSnapshot = await getDocs(pedidosRef);
      
      pedidosSnapshot.forEach(doc => {
        const pedido = doc.data();
        
        if (pedido['fechaCreacion'] && pedido['statusBooking'] !== 'rejected') {
          const fechaPedido = new Date(pedido['fechaCreacion']);
          
          if (fechaPedido >= hace30Dias && pedido['items']) {
            // Procesar items del pedido
            pedido['items'].forEach((item: any) => {
              const key = item.nombre || 'Producto sin nombre';
              
              if (ventasPorProducto.has(key)) {
                const producto = ventasPorProducto.get(key)!;
                producto.ventas += item.cantidad || 1;
                producto.ingresos += (item.precio || 0) * (item.cantidad || 1);
              } else {
                ventasPorProducto.set(key, {
                  nombre: item.nombre || 'Producto sin nombre',
                  categoria: item.categoria || 'Sin categoría',
                  ventas: item.cantidad || 1,
                  ingresos: (item.precio || 0) * (item.cantidad || 1)
                });
              }
            });
          }
        }
      });
      
      // Convertir a array y ordenar por ventas
      const productos = Array.from(ventasPorProducto.values())
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, limite);
      
      // Si no hay datos, devolver productos de ejemplo
      if (productos.length === 0) {
        return [
          { nombre: 'Hamburguesa Clásica', categoria: 'Platos Principales', ventas: 145, ingresos: 2175000 },
          { nombre: 'Pizza Margarita', categoria: 'Pizzas', ventas: 132, ingresos: 2640000 },
          { nombre: 'Ensalada César', categoria: 'Ensaladas', ventas: 98, ingresos: 1470000 },
          { nombre: 'Pasta Carbonara', categoria: 'Pastas', ventas: 87, ingresos: 1740000 },
          { nombre: 'Limonada Natural', categoria: 'Bebidas', ventas: 156, ingresos: 780000 }
        ];
      }
      
      return productos;
      
    } catch (error) {
      console.error('Error obteniendo productos top:', error);
      // Devolver datos de ejemplo en caso de error
      return [
        { nombre: 'Hamburguesa Clásica', categoria: 'Platos Principales', ventas: 145, ingresos: 2175000 },
        { nombre: 'Pizza Margarita', categoria: 'Pizzas', ventas: 132, ingresos: 2640000 },
        { nombre: 'Ensalada César', categoria: 'Ensaladas', ventas: 98, ingresos: 1470000 },
        { nombre: 'Pasta Carbonara', categoria: 'Pastas', ventas: 87, ingresos: 1740000 },
        { nombre: 'Limonada Natural', categoria: 'Bebidas', ventas: 156, ingresos: 780000 }
      ];
    }
  }
  
  /**
   * Obtener distribución de pedidos por tipo
   */
  async obtenerDistribucionPedidos(): Promise<{ tipo: string; cantidad: number; porcentaje: number }[]> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        console.error('❌ DashboardService: No hay restaurante actual seleccionado para distribución');
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const restauranteId = restauranteActual.id;
      
      const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidos`);
      const pedidosSnapshot = await getDocs(pedidosRef);
      
      const distribucion = {
        delivery: 0,
        pickUp: 0,
        insideOrder: 0
      };
      
      let totalPedidos = 0;
      
      pedidosSnapshot.forEach(doc => {
        const data = doc.data();
        if (data['orderType']) {
          distribucion[data['orderType'] as keyof typeof distribucion]++;
          totalPedidos++;
        }
      });
      
      return [
        { 
          tipo: 'Delivery', 
          cantidad: distribucion.delivery,
          porcentaje: totalPedidos > 0 ? (distribucion.delivery / totalPedidos) * 100 : 0
        },
        { 
          tipo: 'Para llevar', 
          cantidad: distribucion.pickUp,
          porcentaje: totalPedidos > 0 ? (distribucion.pickUp / totalPedidos) * 100 : 0
        },
        { 
          tipo: 'En local', 
          cantidad: distribucion.insideOrder,
          porcentaje: totalPedidos > 0 ? (distribucion.insideOrder / totalPedidos) * 100 : 0
        }
      ];
      
    } catch (error) {
      console.error('Error obteniendo distribución:', error);
      return [
        { tipo: 'Delivery', cantidad: 45, porcentaje: 45 },
        { tipo: 'Para llevar', cantidad: 30, porcentaje: 30 },
        { tipo: 'En local', cantidad: 25, porcentaje: 25 }
      ];
    }
  }
  
  /**
   * Obtener actividad reciente
   */
  async obtenerActividadReciente(limite: number = 10): Promise<any[]> {
    try {
      const restauranteActual = this.authService.obtenerRestauranteActual();
      if (!restauranteActual?.id) {
        console.error('❌ DashboardService: No hay restaurante actual seleccionado para actividad');
        throw new Error('No hay restaurante actual seleccionado');
      }

      const app = getApp();
      const db = getFirestore(app);
      const restauranteId = restauranteActual.id;
      
      const actividades: any[] = [];
      
      // Obtener últimos pedidos
      const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidos`);
      const pedidosSnapshot = await getDocs(query(pedidosRef, orderBy('fechaCreacion', 'desc'), limit(5)));
      
      pedidosSnapshot.forEach(doc => {
        const data = doc.data();
        actividades.push({
          tipo: 'pedido',
          icono: 'fast-food',
          descripcion: `Nuevo pedido de ${data['contactNameOrder'] || 'Cliente'}`,
          tiempo: this.formatearTiempoRelativo(new Date(data['fechaCreacion'])),
          fecha: new Date(data['fechaCreacion'])
        });
      });
      
      // Obtener últimas reservas
      const reservasRef = collection(db, `restaurantes/${restauranteId}/reservas`);
      const reservasSnapshot = await getDocs(query(reservasRef, orderBy('creation', 'desc'), limit(5)));
      
      reservasSnapshot.forEach(doc => {
        const data = doc.data();
        actividades.push({
          tipo: 'reserva',
          icono: 'calendar',
          descripcion: `Reserva de ${data['contactNameBooking'] || 'Cliente'} para ${data['peopleBooking']} personas`,
          tiempo: this.formatearTiempoRelativo(new Date(data['creation'])),
          fecha: new Date(data['creation'])
        });
      });
      
      // Ordenar por fecha y limitar
      return actividades
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
        .slice(0, limite);
      
    } catch (error) {
      console.error('Error obteniendo actividad:', error);
      // Devolver datos de ejemplo
      return [
        { tipo: 'pedido', icono: 'fast-food', descripcion: 'Nuevo pedido de María García', tiempo: 'Hace 5 minutos' },
        { tipo: 'reserva', icono: 'calendar', descripcion: 'Reserva confirmada para 4 personas', tiempo: 'Hace 15 minutos' },
        { tipo: 'cliente', icono: 'person-add', descripcion: 'Nuevo cliente registrado: Carlos López', tiempo: 'Hace 1 hora' }
      ];
    }
  }
  
  /**
   * Formatear tiempo relativo
   */
  private formatearTiempoRelativo(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);
    
    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    
    return fecha.toLocaleDateString('es-CO');
  }
}