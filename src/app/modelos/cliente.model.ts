// Interface FinalUser - Cliente usando WhatsApp (interface del cliente)
export interface Cliente {
  // El id es el numero del whatsapp
  id?: string;
  // ID del restaurante al que pertenece (multi-tenant)
  restauranteId?: string;
  // Indica si el contacto es un contacto de grupo
  isGroup?: boolean;
  // Fecha de creación del contacto
  creation?: string;
  // Indica si el contacto es un contacto empresarial
  isEnterprise?: boolean;
  // Indica si el contacto es de negocios
  isBusiness?: boolean;
  // Indica si el número está guardado en los contactos del teléfono actual
  isMyContact?: boolean;
  // Indica si el contacto es un contacto de usuario
  isUser?: boolean;
  // Indica si el número está registrado en WhatsApp
  isWAContact?: boolean;
  // Indica si has bloqueado este contacto
  isBlocked?: boolean;
  // Etiquetas de WhatsApp - verificar tipo de etiquetas
  wappLabels?: string[];
  // El nombre del contacto, como lo guardó el usuario actual
  name?: string;
  // El nombre que el contacto ha configurado para mostrarse públicamente
  pushname?: string;
  // Encabezado de sección - documentación faltante
  sectionHeader?: string;
  // Una versión abreviada del nombre
  shortName?: string;
  // Origen de la creación del contacto
  sourceType?: 'chatBot' | 'manual' | 'api';
  // Modo de respuesta, si está en modo "bot" quiere decir que el chatbot puede responderle automáticamente al contacto
  respType?: 'manualTemp' | 'bot' | 'manual';
  // Etiquetas del contacto
  labels?: string;
  // Nombre principal para mostrar el usuario
  whatsAppName?: string;
  // Se marca para indicar que no desea recibir más mensajes de campaña
  isSpam?: boolean;
  // Email del contacto
  email?: string;
  // Empresa a la que pertenece el contacto
  company?: string;
  // Dirección del contacto
  address?: string;
  // Link de la imagen del perfil
  image?: string;
  // Última fecha que se actualizó el contacto desde whatsapp
  lastUpdate?: string;
  // Estadísticas de las interacciones del contacto
  userInteractions?: UserInteractions;
}

// Interface UserInteractions - Estadísticas de interacciones del cliente
export interface UserInteractions {
  whatsapp: number;
  controller: number;
  chatbot: number;
  api: number;
  campaing: number;
  client: number;
  others: number;
  wappController: number;
  ai: number;
  fee?: number;
}