// Interface VenueBooking - Reserva de eventos/locales (interface del cliente)
export interface Reserva {
  // fecha en que se realizó la solicitud de la reserva
  id: string;
  // Identificador del contacto de whatsapp desde el que se realizó la reserva
  contact: string;
  // A nombre quien está la reserva
  contactNameBooking: string;
  // Numero de personas de tipo string
  peopleBooking: string;
  // Numero de personas de tipo number
  finalPeopleBooking: number;
  // Fecha de la reserva
  dateBooking: string;
  // Estado de la reserva
  statusBooking: 'pending' | 'accepted' | 'rejected';
  // detalles de la reserva
  detailsBooking?: string;
  // Fecha en que el cliente reconfirmó la reserva
  reconfirmDate?: string;
  // Estado de reconfirmación del cliente
  reconfirmStatus?: 'pending' | 'accepted' | 'rejected';
}

export interface ConfiguracionMesa {
  id: string;
  numero: string;
  capacidad: number;
  area: string;
  disponible: boolean;
  tipoMesa: 'regular' | 'vip' | 'terraza' | 'bar';
}

export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  EN_USO = 'en_uso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  NO_ASISTIO = 'no_asistio'
}