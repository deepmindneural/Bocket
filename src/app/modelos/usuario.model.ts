export interface Usuario {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // Información personal
  nombre: string;
  apellidos: string;
  telefono?: string;
  // Rol y permisos
  rol: RolUsuario;
  permisos: PermisoUsuario[];
  // Estado de la cuenta
  activo: boolean;
  emailVerificado: boolean;
  // Configuraciones
  preferencias: PreferenciasUsuario;
  // Metadatos
  fechaRegistro: Date;
  fechaUltimoAcceso?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor?: string;
}

export interface PreferenciasUsuario {
  idioma: 'es' | 'en';
  tema: 'claro' | 'oscuro' | 'auto';
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  sonidos: boolean;
}

export enum RolUsuario {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  GERENTE = 'gerente',
  MESERO = 'mesero',
  COCINA = 'cocina',
  CAJA = 'caja',
  HOSTESS = 'hostess',
  DELIVERY = 'delivery'
}

export enum PermisoUsuario {
  // Clientes
  VER_CLIENTES = 'ver_clientes',
  CREAR_CLIENTES = 'crear_clientes',
  EDITAR_CLIENTES = 'editar_clientes',
  ELIMINAR_CLIENTES = 'eliminar_clientes',
  
  // Reservas
  VER_RESERVAS = 'ver_reservas',
  CREAR_RESERVAS = 'crear_reservas',
  EDITAR_RESERVAS = 'editar_reservas',
  CANCELAR_RESERVAS = 'cancelar_reservas',
  
  // Pedidos
  VER_PEDIDOS = 'ver_pedidos',
  CREAR_PEDIDOS = 'crear_pedidos',
  EDITAR_PEDIDOS = 'editar_pedidos',
  CANCELAR_PEDIDOS = 'cancelar_pedidos',
  
  // Productos
  VER_PRODUCTOS = 'ver_productos',
  CREAR_PRODUCTOS = 'crear_productos',
  EDITAR_PRODUCTOS = 'editar_productos',
  ELIMINAR_PRODUCTOS = 'eliminar_productos',
  
  // Reportes
  VER_REPORTES = 'ver_reportes',
  EXPORTAR_DATOS = 'exportar_datos',
  
  // Configuración
  CONFIGURAR_SISTEMA = 'configurar_sistema',
  GESTIONAR_USUARIOS = 'gestionar_usuarios'
}