import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../servicios/producto.service';
import { Producto, CategoriaProducto } from '../../modelos';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-formulario-producto',
  templateUrl: './formulario-producto.component.html',
  styleUrls: ['./formulario-producto.component.scss'],
  standalone: false
})
export class FormularioProductoComponent implements OnInit {

  formularioProducto!: FormGroup;
  productoId: string | null = null;
  esEdicion = false;
  guardando = false;
  cargando = false;
  error: string | null = null;

  // Categorías disponibles
  categorias: CategoriaProducto[] = [
    { id: 'entradas', nombre: 'Entradas', descripcion: 'Aperitivos y entradas', orden: 1, activa: true },
    { id: 'principales', nombre: 'Platos Principales', descripcion: 'Platos fuertes', orden: 2, activa: true },
    { id: 'bebidas', nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes', orden: 3, activa: true },
    { id: 'postres', nombre: 'Postres', descripcion: 'Dulces y postres', orden: 4, activa: true },
    { id: 'acompanantes', nombre: 'Acompañantes', descripcion: 'Guarniciones y extras', orden: 5, activa: true }
  ];

  // Opciones para campos
  tiposProducto = [
    { value: 'plato', label: 'Plato' },
    { value: 'bebida', label: 'Bebida' },
    { value: 'postre', label: 'Postre' },
    { value: 'entrada', label: 'Entrada' },
    { value: 'acompanante', label: 'Acompañante' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private toastController: ToastController
  ) {
    this.inicializarFormulario();
  }

  async ngOnInit() {
    this.productoId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = this.productoId !== null && this.productoId !== 'nuevo';

    if (this.esEdicion && this.productoId) {
      await this.cargarProducto(this.productoId);
    }
  }

  inicializarFormulario() {
    this.formularioProducto = this.fb.group({
      // Información básica
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      categoria: this.fb.group({
        id: ['', Validators.required],
        nombre: [''],
        descripcion: [''],
        activo: [true]
      }),
      
      // Estado y disponibilidad
      disponible: [true],
      destacado: [false],
      nuevo: [false],
      
      // Información nutricional y detalles
      ingredientes: [''],
      alergenos: [''],
      calorias: [0, [Validators.min(0)]],
      tiempoPreparacion: [15, [Validators.min(1), Validators.max(120)]],
      
      // Organización
      orden: [0, [Validators.min(0)]],
      tags: [''],
      
      // Imágenes
      imagen: [''],
      imagenSecundaria: [''],
      
      // Configuración adicional
      permitirPersonalizacion: [false],
      opciones: [''],
      descuento: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  async cargarProducto(id: string) {
    try {
      this.cargando = true;
      const producto = await this.productoService.obtenerPorId(id);
      
      if (producto) {
        this.formularioProducto.patchValue(producto);
      } else {
        this.error = 'Producto no encontrado';
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
      this.error = 'Error al cargar el producto';
    } finally {
      this.cargando = false;
    }
  }

  async guardarProducto() {
    if (this.formularioProducto.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    try {
      this.guardando = true;
      this.error = null;

      const datosProducto = { ...this.formularioProducto.value };
      
      // Procesar categoría
      if (datosProducto.categoria.id) {
        const categoriaSeleccionada = this.categorias.find(c => c.id === datosProducto.categoria.id);
        if (categoriaSeleccionada) {
          datosProducto.categoria = categoriaSeleccionada;
        }
      }

      // Procesar tags
      if (datosProducto.tags) {
        datosProducto.tags = datosProducto.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      }

      // Procesar ingredientes y alérgenos
      if (datosProducto.ingredientes) {
        datosProducto.ingredientes = datosProducto.ingredientes.split(',').map((ing: string) => ing.trim()).filter((ing: string) => ing.length > 0);
      }
      
      if (datosProducto.alergenos) {
        datosProducto.alergenos = datosProducto.alergenos.split(',').map((alg: string) => alg.trim()).filter((alg: string) => alg.length > 0);
      }

      let productoGuardado: Producto;

      if (this.esEdicion && this.productoId) {
        productoGuardado = await this.productoService.actualizar(this.productoId, datosProducto);
      } else {
        productoGuardado = await this.productoService.crear(datosProducto);
      }

      await this.presentToast(
        this.esEdicion ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
        'success'
      );
      this.router.navigate(['/productos']);
      
    } catch (error) {
      console.error('Error guardando producto:', error);
      this.error = 'Error al guardar el producto. Intente nuevamente.';
      await this.presentToast('Error al guardar el producto', 'danger');
    } finally {
      this.guardando = false;
    }
  }

  onCategoriaChange() {
    const categoriaId = this.formularioProducto.get('categoria.id')?.value;
    const categoriaSeleccionada = this.categorias.find(c => c.id === categoriaId);
    
    if (categoriaSeleccionada) {
      this.formularioProducto.patchValue({
        categoria: categoriaSeleccionada
      });
    }
  }

  calcularPrecioConDescuento(): number {
    const precio = this.formularioProducto.get('precio')?.value || 0;
    const descuento = this.formularioProducto.get('descuento')?.value || 0;
    return precio - (precio * descuento / 100);
  }

  aplicarPresetComida() {
    this.formularioProducto.patchValue({
      categoria: { id: 'principales' },
      tiempoPreparacion: 25,
      calorias: 350,
      permitirPersonalizacion: true
    });
    this.onCategoriaChange();
  }

  aplicarPresetBebida() {
    this.formularioProducto.patchValue({
      categoria: { id: 'bebidas' },
      tiempoPreparacion: 5,
      calorias: 150,
      permitirPersonalizacion: false
    });
    this.onCategoriaChange();
  }

  aplicarPresetPostre() {
    this.formularioProducto.patchValue({
      categoria: { id: 'postres' },
      tiempoPreparacion: 10,
      calorias: 280,
      permitirPersonalizacion: false
    });
    this.onCategoriaChange();
  }

  formatearPrecio(): string {
    const precio = this.formularioProducto.get('precio')?.value || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  cancelar() {
    this.router.navigate(['/productos']);
  }

  private marcarCamposComoTocados() {
    Object.keys(this.formularioProducto.controls).forEach(key => {
      this.formularioProducto.get(key)?.markAsTouched();
    });
  }

  // Validaciones del formulario
  esCampoInvalido(campo: string): boolean {
    const control = this.formularioProducto.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeError(campo: string): string {
    const control = this.formularioProducto.get(campo);
    
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors['minlength']) {
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['min']) {
        return `El valor mínimo es ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `El valor máximo es ${control.errors['max'].max}`;
      }
    }
    
    return '';
  }

  onImageError(event: any) {
    if (event.target) {
      (event.target as HTMLImageElement).style.display = 'none';
    }
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