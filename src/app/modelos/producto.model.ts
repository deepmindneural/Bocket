export interface Producto {
  id?: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaProducto;
  precio: number;
  costo?: number;
  disponible: boolean;
  enStock: boolean;
  cantidadStock?: number;
  stockMinimo?: number;
  imagen?: string;
  imagenes?: string[];
  // Características adicionales
  ingredientes?: string[];
  alergenos?: string[];
  tiempoPreparacion?: number; // En minutos
  calorias?: number;
  peso?: number;
  // Configuración de venta
  requierePreparacion: boolean;
  permiteModificaciones: boolean;
  modificacionesDisponibles?: ModificacionProducto[];
  // Metadatos
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor: string;
  actualizadoPor?: string;
  activo: boolean;
}

export interface CategoriaProducto {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  orden: number;
  activa: boolean;
}

export interface ModificacionProducto {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: 'ingrediente_extra' | 'sin_ingrediente' | 'cambio_ingrediente' | 'tamaño';
  precioAdicional: number;
  disponible: boolean;
}