export interface Restaurante {
  id?: string;
  nombre: string;
  slug: string; // Para URLs amigables (ej: "restaurante-abc")
  descripcion?: string;
  logo?: string;
  
  // Información de contacto
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  pais: string;
  
  // Configuración del negocio
  tipoNegocio: 'restaurante' | 'cafeteria' | 'bar' | 'panaderia' | 'comida_rapida';
  horarioAtencion: HorarioAtencion[];
  capacidadMaxima?: number;
  numeroMesas?: number;
  
  // Configuración del CRM
  moneda: 'COP' | 'USD' | 'EUR' | 'MXN';
  idioma: 'es' | 'en';
  zonaHoraria: string;
  
  // Configuración de colores (opcional - override de tema)
  colorPrimario?: string;
  colorSecundario?: string;
  
  // Configuración adicional
  configuracion?: any;
  
  // Estado y permisos
  activo: boolean;
  planSuscripcion: 'basico' | 'profesional' | 'empresarial';
  fechaVencimiento?: Date;
  
  // Límites por plan
  limiteUsuarios: number;
  limiteClientes: number;
  limiteReservas: number;
  
  // Metadatos
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor: string;
  actualizadoPor?: string;
}

export interface HorarioAtencion {
  dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  abierto: boolean;
  horaApertura?: string; // formato "HH:mm"
  horaCierre?: string;
  pausaInicio?: string; // Para hora de almuerzo
  pausaFin?: string;
}

export interface UsuarioRestaurante {
  id?: string;
  usuarioId: string; // Referencia al usuario global
  restauranteId: string; // Referencia al restaurante
  
  // Información específica del usuario en este restaurante
  nombreCompleto: string;
  email: string;
  telefono?: string;
  avatar?: string;
  
  // Rol y permisos
  rol: 'propietario' | 'administrador' | 'empleado' | 'mesero' | 'cocinero';
  permisos: PermisoRestaurante[];
  
  // Estado
  activo: boolean;
  fechaUltimoAcceso?: Date;
  
  // Configuración personal
  notificaciones: ConfiguracionNotificaciones;
  
  // Metadatos
  fechaCreacion: Date;
  fechaActualizacion: Date;
  invitadoPor: string;
}

export interface PermisoRestaurante {
  modulo: 'dashboard' | 'clientes' | 'reservas' | 'pedidos' | 'productos' | 'reportes' | 'configuracion' | 'usuarios';
  acciones: ('leer' | 'crear' | 'editar' | 'eliminar')[];
}

export interface ConfiguracionNotificaciones {
  nuevasReservas: boolean;
  cancelacionReservas: boolean;
  recordatorioReservas: boolean;
  nuevosClientes: boolean;
  ventasDiarias: boolean;
  stockBajo: boolean;
  reportesSemanales: boolean;
}

// Usuario global del sistema (independiente de restaurantes)
export interface UsuarioGlobal {
  id?: string;
  uid: string; // UID de Firebase Auth
  email: string;
  nombre: string; // Cambio de nombreCompleto a nombre para coincidir con Firebase
  telefono?: string;
  avatar?: string;
  
  // Estado global
  emailVerificado?: boolean;
  activo: boolean;
  rol?: string;
  
  // Configuración global
  idioma?: 'es' | 'en';
  zonaHoraria?: string;
  
  // Restaurante principal (en lugar de array)
  restaurantePrincipal: string; // ID del restaurante principal
  
  // Metadatos
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  ultimoAcceso?: Date; // Cambio de fechaUltimoAcceso a ultimoAcceso para coincidir con Firebase
}