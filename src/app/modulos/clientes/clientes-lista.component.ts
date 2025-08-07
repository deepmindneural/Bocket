import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Cliente } from '../../modelos';
import { ClienteService } from '../../servicios/cliente.service';
import { ToastController, AlertController } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-clientes-lista',
  templateUrl: './clientes-lista.component.html',
  styleUrls: ['./clientes-lista.component.scss'],
  standalone: false
})
export class ClientesListaComponent implements OnInit, OnDestroy {

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  cargando = false;
  error: string | null = null;
  private navigationSubscription: Subscription;
  
  // Filtros
  terminoBusqueda = '';
  filtroTipo = 'todos';
  filtroActividad = 'todos';
  filtroFecha = 'todos';
  fechaDesde: string | null = null;
  fechaHasta: string | null = null;
  
  // Estadísticas
  estadisticas: any = {
    total: 0,
    vip: 0,
    activos: 0,
    nuevosEsteMes: 0
  };

  // Opciones de filtros
  tiposDisponibles = [
    { value: 'todos', label: 'Todos los tipos' },
    { value: 'vip', label: 'VIP' },
    { value: 'regular', label: 'Regular' },
    { value: 'corporativo', label: 'Corporativo' }
  ];

  actividadesDisponibles = [
    { value: 'todos', label: 'Toda actividad' },
    { value: 'activos', label: 'Activos' },
    { value: 'inactivos', label: 'Inactivos' }
  ];

  periodosDisponibles = [
    { value: 'todos', label: 'Todas las fechas' },
    { value: 'este_mes', label: 'Este mes' },
    { value: 'mes_pasado', label: 'Mes pasado' },
    { value: 'este_ano', label: 'Este año' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  // Datos usando interface finalUser (WhatsApp)
  clientesEjemplo: Cliente[] = [
    {
      id: '573001234567',
      name: 'María González',
      whatsAppName: 'María G.',
      email: 'maria.gonzalez@email.com',
      isWAContact: true,
      isMyContact: true,
      sourceType: 'chatBot',
      respType: 'bot',
      labels: 'cliente_vip,frecuente',
      creation: '2024-01-15T00:00:00.000Z',
      lastUpdate: new Date().toISOString(),
      userInteractions: {
        whatsapp: 45,
        controller: 12,
        chatbot: 23,
        api: 8,
        campaing: 3,
        client: 67,
        others: 2,
        wappController: 15,
        ai: 7,
        fee: 2450
      }
    },
    {
      id: '573109876543',
      name: 'Carlos Rodríguez',
      whatsAppName: 'Carlos R.',
      email: 'carlos.rodriguez@email.com',
      isWAContact: true,
      isMyContact: true,
      sourceType: 'manual',
      respType: 'manual',
      labels: 'cliente_regular',
      creation: '2024-02-10T00:00:00.000Z',
      lastUpdate: new Date().toISOString(),
      userInteractions: {
        whatsapp: 32,
        controller: 8,
        chatbot: 15,
        api: 5,
        campaing: 2,
        client: 45,
        others: 1,
        wappController: 10,
        ai: 4,
        fee: 890
      }
    },
    {
      id: '573155550000',
      name: 'Empresa ABC S.A.',
      whatsAppName: 'ABC Corp',
      email: 'contacto@empresaabc.com',
      isWAContact: true,
      isMyContact: true,
      isEnterprise: true,
      isBusiness: true,
      sourceType: 'manual',
      respType: 'manual',
      labels: 'cliente_corporativo,eventos',
      creation: '2024-01-20T00:00:00.000Z',
      lastUpdate: new Date().toISOString(),
      userInteractions: {
        whatsapp: 78,
        controller: 25,
        chatbot: 12,
        api: 15,
        campaing: 8,
        client: 98,
        others: 5,
        wappController: 32,
        ai: 18,
        fee: 15670
      }
    }
  ];

  constructor(
    private router: Router,
    private clienteService: ClienteService,
    private toastController: ToastController,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    // Escuchar cambios de navegación para refrescar datos
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('👥 ClientesListaComponent: Navegación detectada:', event.url);
      if (event.url === '/clientes' || event.url.includes('/clientes')) {
        console.log('🔄 ClientesListaComponent: Refrescando datos por navegación');
        this.cargarClientes().then(() => {
          this.calcularEstadisticas();
          console.log('📊 Navegación - Estadísticas recalculadas:', this.estadisticas);
        });
      }
    });
  }

  ngOnInit() {
    this.cargarClientes();
    this.calcularEstadisticas();
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  // Ionic lifecycle - se ejecuta cada vez que se entra a la vista
  async ionViewWillEnter() {
    console.log('🔄 ClientesListaComponent: Refrescando datos al entrar a la vista');
    await this.cargarClientes();
    // cargarClientes() ya llama a calcularEstadisticas(), pero lo llamamos de nuevo por seguridad
    this.calcularEstadisticas();
    console.log('📊 ionViewWillEnter - Estadísticas tras re-cálculo:', this.estadisticas);
  }

  getClienteType(cliente: Cliente): string {
    // Verificar primero los labels (tienen prioridad)
    if (cliente.labels) {
      const labels = cliente.labels.toLowerCase();
      if (labels.includes('vip') || labels.includes('premium')) {
        console.log(`🌟 Cliente VIP detectado por labels: ${cliente.name} - ${cliente.labels}`);
        return 'vip';
      }
      if (labels.includes('corporativo') || labels.includes('empresa')) {
        console.log(`🏢 Cliente corporativo detectado por labels: ${cliente.name} - ${cliente.labels}`);
        return 'corporativo';
      }
    }
    
    // Verificar propiedades del objeto (lógica original)
    if (cliente.isEnterprise || cliente.isBusiness) {
      console.log(`🏢 Cliente corporativo detectado por propiedades: ${cliente.name}`);
      return 'corporativo';
    }
    
    if (cliente.userInteractions && cliente.userInteractions.fee && cliente.userInteractions.fee > 5000) {
      console.log(`🌟 Cliente VIP detectado por fee: ${cliente.name} - Fee: ${cliente.userInteractions.fee}`);
      return 'vip';
    }
    
    console.log(`👤 Cliente regular: ${cliente.name}`);
    return 'regular';
  }

  async cargarClientes() {
    try {
      console.log('🔄 ClientesListaComponent.cargarClientes() - Iniciando carga...');
      this.cargando = true;
      this.error = null;
      
      // Obtener clientes reales desde Firebase
      const clientesReales = await this.clienteService.obtenerTodos();
      console.log('🔥 Clientes obtenidos desde Firebase:', clientesReales);
      
      this.clientes = clientesReales;
      
      // Solo usar ejemplos si explícitamente no hay datos Y es para desarrollo
      if (this.clientes.length === 0) {
        console.log('⚠️ No se encontraron clientes en Firebase. Mostrando lista vacía.');
        console.log('💡 Para ver datos, crea clientes usando el botón "Nuevo Cliente" o ve a /verificacion');
      }
      
      console.log('📊 ClientesListaComponent.cargarClientes() - Total clientes:', this.clientes.length);
      this.clientes.forEach((cliente, index) => {
        console.log(`  ${index + 1}. ${cliente.name || cliente.whatsAppName} - ${this.getClienteType(cliente)} - ID: ${cliente.id}`);
      });
      
      this.aplicarFiltros();
      
      // Asegurar que las estadísticas se calculan después de que los clientes están cargados
      console.log('📊 Calculando estadísticas con array de clientes...');
      console.log('📊 Array clientes antes de calcular estadísticas:', this.clientes.length);
      this.calcularEstadisticas();
      console.log('📊 Estadísticas calculadas:', this.estadisticas);
      console.log('✅ ClientesListaComponent.cargarClientes() - Carga completada');
    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
      this.error = 'Error al cargar los clientes. Intenta de nuevo.';
      this.clientes = []; // Lista vacía en caso de error
      this.aplicarFiltros();
    } finally {
      this.cargando = false;
    }
  }

  calcularEstadisticas() {
    console.log('🔢 calcularEstadisticas() - Iniciando cálculo...');
    console.log('👥 Clientes en el array:', this.clientes.length);
    
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    
    // Calcular cada estadística individualmente con logging
    const total = this.clientes.length;
    const vip = this.clientes.filter(c => this.getClienteType(c) === 'vip').length;
    const activos = this.clientes.filter(c => c.isWAContact).length;
    const nuevosEsteMes = this.clientes.filter(c => {
      const fechaCreacion = new Date(c.creation || '');
      return fechaCreacion >= inicioMes;
    }).length;
    
    console.log('📊 Estadísticas individuales:');
    console.log(`   Total: ${total}`);
    console.log(`   VIP: ${vip}`);
    console.log(`   Activos: ${activos}`);
    console.log(`   Nuevos este mes: ${nuevosEsteMes}`);
    
    this.estadisticas = {
      total: total,
      vip: vip,
      activos: activos,
      nuevosEsteMes: nuevosEsteMes
    };
    
    console.log('✅ Estadísticas finales:', this.estadisticas);
    
    // Forzar detección de cambios para actualizar la UI
    this.cdr.detectChanges();
    console.log('🔄 Change detection forzada para actualizar estadísticas en UI');
  }

  buscarClientes(event: any) {
    this.terminoBusqueda = event.target.value;
    this.aplicarFiltros();
  }

  filtrarPorTipoSelect(event: any) {
    this.filtroTipo = event.detail.value;
    this.aplicarFiltros();
  }

  filtrarPorActividad(event: any) {
    this.filtroActividad = typeof event === 'string' ? event : event.detail.value;
    this.aplicarFiltros();
  }

  filtrarPorFecha(event: any) {
    this.filtroFecha = typeof event === 'string' ? event : event.detail.value;
    if (this.filtroFecha !== 'custom') {
      this.fechaDesde = null;
      this.fechaHasta = null;
    }
    this.aplicarFiltros();
  }

  cambiarFechaDesde(event: any) {
    this.fechaDesde = event.detail.value;
    this.aplicarFiltros();
  }

  cambiarFechaHasta(event: any) {
    this.fechaHasta = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let clientesFiltrados = [...this.clientes];

    // Filtro por búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        (cliente.name && cliente.name.toLowerCase().includes(termino)) ||
        (cliente.whatsAppName && cliente.whatsAppName.toLowerCase().includes(termino)) ||
        (cliente.id && cliente.id.includes(termino)) ||
        (cliente.email && cliente.email.toLowerCase().includes(termino))
      );
    }

    // Filtro por tipo
    if (this.filtroTipo !== 'todos') {
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        this.getClienteType(cliente) === this.filtroTipo
      );
    }

    // Filtro por actividad
    if (this.filtroActividad !== 'todos') {
      clientesFiltrados = clientesFiltrados.filter(cliente => {
        if (this.filtroActividad === 'activos') return cliente.isWAContact;
        if (this.filtroActividad === 'inactivos') return !cliente.isWAContact;
        return true;
      });
    }

    // Filtro por fecha
    if (this.filtroFecha !== 'todos') {
      clientesFiltrados = clientesFiltrados.filter(cliente => {
        if (!cliente.creation) return false;
        
        const fechaCreacion = new Date(cliente.creation);
        const hoy = new Date();
        
        switch (this.filtroFecha) {
          case 'este_mes':
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            return fechaCreacion >= inicioMes;
          case 'mes_pasado':
            const inicioMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
            const finMesPasado = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
            return fechaCreacion >= inicioMesPasado && fechaCreacion <= finMesPasado;
          case 'este_ano':
            const inicioAno = new Date(hoy.getFullYear(), 0, 1);
            return fechaCreacion >= inicioAno;
          case 'custom':
            if (this.fechaDesde && this.fechaHasta) {
              const desde = new Date(this.fechaDesde);
              const hasta = new Date(this.fechaHasta);
              hasta.setHours(23, 59, 59, 999);
              return fechaCreacion >= desde && fechaCreacion <= hasta;
            }
            return true;
          default:
            return true;
        }
      });
    }

    this.clientesFiltrados = clientesFiltrados;
  }

  contarPorTipo(tipo: string): number {
    return this.clientes.filter(c => this.getClienteType(c) === tipo).length;
  }

  trackByClienteId(index: number, cliente: Cliente): string {
    return cliente.id || index.toString();
  }

  formatearFecha(fecha?: Date | string): string {
    if (!fecha) return 'N/A';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return `Hace ${Math.floor(dias / 365)} años`;
  }

  // Acciones
  nuevoCliente() {
    this.router.navigate(['/clientes/nuevo']);
  }

  exportarClientes() {
    console.log('Exportar clientes');
  }

  verDetalleCliente(cliente: Cliente) {
    console.log('Ver detalle:', cliente);
    this.router.navigate(['/clientes', cliente.id]);
  }

  editarCliente(cliente: Cliente, event: Event) {
    event.stopPropagation();
    console.log('Editar cliente:', cliente);
    this.router.navigate(['/clientes', cliente.id, 'editar']);
  }

  contactarCliente(cliente: Cliente, event: Event) {
    event.stopPropagation();
    console.log('Contactar cliente:', cliente);
  }

  verHistorial(cliente: Cliente, event: Event) {
    event.stopPropagation();
    console.log('Ver historial:', cliente);
    // this.router.navigate(['/clientes', cliente.id, 'historial']);
  }

  // Métodos para gestión de clientes

  async convertirAVip(cliente: Cliente, event: Event) {
    event.stopPropagation();
    
    if (!cliente.id) {
      await this.presentToast('Error: Cliente sin ID válido', 'danger');
      return;
    }
    
    try {
      console.log('🌟 Convirtiendo cliente a VIP:', cliente.name);
      await this.presentToast('Convirtiendo cliente a VIP...', 'warning');
      
      const clienteActualizado = await this.clienteService.convertirAVip(cliente.id);
      console.log('✅ Cliente convertido a VIP:', clienteActualizado);
      
      // Refrescar la lista de clientes
      await this.cargarClientes();
      
      // Forzar detección de cambios para actualizar la UI
      this.cdr.detectChanges();
      
      await this.presentToast(`${cliente.name} ha sido convertido a cliente VIP`, 'success');
    } catch (error) {
      console.error('❌ Error convirtiendo cliente a VIP:', error);
      await this.presentToast('Error al convertir cliente a VIP', 'danger');
    }
  }

  async toggleActivarCliente(cliente: Cliente, event: Event) {
    event.stopPropagation();
    
    if (!cliente.id) {
      await this.presentToast('Error: Cliente sin ID válido', 'danger');
      return;
    }
    
    try {
      const isActive = cliente.isWAContact;
      const accion = isActive ? 'inactivar' : 'activar';
      
      console.log(`⏯️ ${accion} cliente:`, cliente.name);
      await this.presentToast(`${accion === 'inactivar' ? 'Inactivando' : 'Activando'} cliente...`, 'warning');
      
      let clienteActualizado: Cliente;
      if (isActive) {
        clienteActualizado = await this.clienteService.inactivarCliente(cliente.id);
      } else {
        clienteActualizado = await this.clienteService.reactivarCliente(cliente.id);
      }
      
      console.log(`✅ Cliente ${accion}:`, clienteActualizado);
      
      // Refrescar la lista de clientes
      await this.cargarClientes();
      
      // Forzar detección de cambios para actualizar la UI
      this.cdr.detectChanges();
      
      await this.presentToast(`${cliente.name} ha sido ${accion === 'inactivar' ? 'inactivado' : 'activado'}`, 'success');
    } catch (error) {
      console.error('❌ Error cambiando estado del cliente:', error);
      await this.presentToast('Error al cambiar estado del cliente', 'danger');
    }
  }

  // ====================================================
  // MÉTODOS PARA LAS MEJORAS IMPLEMENTADAS
  // ====================================================

  // Actualizar lista (nuevo método para el botón de refresh mejorado)
  async actualizarLista() {
    this.cargando = true;
    try {
      await this.cargarClientes();
      await this.calcularEstadisticas();
      await this.presentToast('Lista actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error actualizando lista:', error);
      await this.presentToast('Error al actualizar la lista', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  // Filtrar por tipo desde las tarjetas mejoradas
  filtrarPorTipo(tipo: string) {
    this.filtroTipo = tipo || 'todos';
    this.aplicarFiltros();
    
    // Feedback visual
    let mensaje = 'Mostrando todos los clientes';
    if (tipo === 'vip') mensaje = 'Mostrando clientes VIP';
    else if (tipo === 'activos') mensaje = 'Mostrando clientes activos';
    else if (tipo === 'este_mes') mensaje = 'Mostrando clientes nuevos del mes';
    
    this.presentToast(mensaje, 'success');
  }

  // ====================================================
  // MÉTODOS DE FORMATEO DE FECHA Y HORA
  // ====================================================

  formatearFechaHora(fecha: string | Date | undefined): string {
    if (!fecha) return 'No disponible';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    
    return fechaObj.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  calcularTiempoTranscurrido(fecha: string | Date | undefined): string {
    if (!fecha) return 'No disponible';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `${dias} día${dias > 1 ? 's' : ''}`;
    
    return fechaObj.toLocaleDateString('es-CO');
  }

  // Métodos de utilidad
  obtenerTipoLabel(cliente: Cliente): string {
    const tipo = this.getClienteType(cliente);
    const labels: Record<string, string> = {
      'vip': 'VIP',
      'regular': 'Regular',
      'corporativo': 'Corporativo'
    };
    return labels[tipo] || tipo;
  }

  obtenerClaseTipo(cliente: Cliente): string {
    const tipo = this.getClienteType(cliente);
    const clases: Record<string, string> = {
      'vip': 'type-vip',
      'regular': 'type-regular',
      'corporativo': 'type-corporativo'
    };
    return clases[tipo] || '';
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }
}