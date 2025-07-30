// Interface OrderTodelivery - Pedido para entrega (interface del cliente)
export interface Pedido {
  // ID único del pedido
  id: string;
  // Identificador del contacto de whatsapp que hizo el pedido
  contact: string;
  // Tipo de pedido: 'delivery', 'pickUp', 'insideOrder'
  orderType: 'delivery' | 'pickUp' | 'insideOrder';
  // Resumen textual del pedido completo
  resumeOrder: string;
  // Nombre del contacto que realizó el pedido
  contactNameOrder: string;
  // Dirección de entrega o información de recogida
  addressToDelivery: string;
  // Estado del pedido: 'pending', 'accepted', 'rejected', 'inProcess', 'inDelivery', 'deliveried'
  statusBooking: 'pending' | 'accepted' | 'rejected' | 'inProcess' | 'inDelivery' | 'deliveried';
  // Fechas de seguimiento
  fechaCreacion?: string | Date;
  fechaActualizacion?: string | Date;
  // Total del pedido
  total?: number;
  // Items del pedido
  items?: any[];
}

// Interfaces adicionales para compatibilidad con el sistema anterior
export interface ConfiguracionMesa {
  id: string;
  numero: string;
  capacidad: number;
  area: string;
  disponible: boolean;
  tipoMesa: 'regular' | 'vip' | 'terraza' | 'bar';
}

export enum EstadoPedido {
  PENDIENTE = 'pending',
  ACEPTADO = 'accepted',
  RECHAZADO = 'rejected',
  EN_PROCESO = 'inProcess',
  EN_DELIVERY = 'inDelivery',
  ENTREGADO = 'deliveried'
}