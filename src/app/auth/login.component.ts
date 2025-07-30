import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {

  formularioLogin!: FormGroup;
  cargando = false;
  error: string | null = null;
  mostrarPassword = false;
  recordarme = false;
  esProduccion = environment.production;

  // Para redirigir después del login
  private returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    // Si ya está autenticado, redirigir
    if (this.authService.estaAutenticado()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Obtener URL de retorno de los parámetros de consulta
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  inicializarFormulario() {
    this.formularioLogin = this.fb.group({
      email: ['admin@donpepe.com', [Validators.required, Validators.email]],
      password: ['DonPepe2024!', [Validators.required, Validators.minLength(6)]],
      recordarme: [false]
    });
  }

  async iniciarSesion() {
    if (this.formularioLogin.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    try {
      this.cargando = true;
      this.error = null;

      const { email, password, recordarme } = this.formularioLogin.value;
      this.recordarme = recordarme;

      console.log('LoginComponent: Intentando login con:', email);
      const exito = await this.authService.login(email, password);
      console.log('LoginComponent: Resultado del login:', exito);

      if (exito) {
        // Guardar preferencia de recordar
        if (recordarme) {
          localStorage.setItem('bocket_remember_email', email);
        } else {
          localStorage.removeItem('bocket_remember_email');
        }

        // Verificar que la autenticación fue exitosa
        const usuario = this.authService.obtenerUsuarioActual();
        const restaurante = this.authService.obtenerRestauranteActual();
        console.log('LoginComponent: Usuario después del login:', usuario);
        console.log('LoginComponent: Restaurante después del login:', restaurante);

        if (!this.authService.estaAutenticado()) {
          this.error = 'Error en la autenticación. Intente nuevamente.';
        }
      } else {
        this.error = 'Email o contraseña incorrectos.';
      }

    } catch (error: any) {
      console.error('Error en login:', error);
      this.error = this.obtenerMensajeError(error);
    } finally {
      this.cargando = false;
    }
  }

  async iniciarSesionConGoogle() {
    try {
      this.cargando = true;
      this.error = null;

      // TODO: Implementar login con Google
      console.log('Login con Google - Por implementar');
      this.error = 'Login con Google aún no implementado';

    } catch (error: any) {
      console.error('Error en login con Google:', error);
      this.error = this.obtenerMensajeError(error);
    } finally {
      this.cargando = false;
    }
  }

  irARegistro() {
    this.router.navigate(['/registro'], { 
      queryParams: { returnUrl: this.returnUrl } 
    });
  }

  irARecuperarPassword() {
    this.router.navigate(['/recuperar-password']);
  }

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  private marcarCamposComoTocados() {
    Object.keys(this.formularioLogin.controls).forEach(key => {
      this.formularioLogin.get(key)?.markAsTouched();
    });
  }

  private obtenerMensajeError(error: any): string {
    // Mapear errores de Firebase a mensajes amigables
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No existe una cuenta con este email.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/invalid-email': 'El formato del email no es válido.',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intente más tarde.',
      'auth/network-request-failed': 'Error de conexión. Verifique su internet.',
      'auth/invalid-credential': 'Credenciales inválidas. Verifique sus datos.'
    };

    const errorCode = error?.code || error?.message || '';
    return errorMessages[errorCode] || 'Error al iniciar sesión. Intente nuevamente.';
  }

  // Validaciones del formulario
  esCampoInvalido(campo: string): boolean {
    const control = this.formularioLogin.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerMensajeErrorCampo(campo: string): string {
    const control = this.formularioLogin.get(campo);
    
    if (control?.errors) {
      if (control.errors['required']) {
        return campo === 'email' ? 'El email es obligatorio' : 'La contraseña es obligatoria';
      }
      if (control.errors['email']) {
        return 'Ingrese un email válido';
      }
      if (control.errors['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    
    return '';
  }

  // Autocompletar email si se guardó anteriormente
  ngAfterViewInit() {
    const emailGuardado = localStorage.getItem('bocket_remember_email');
    if (emailGuardado) {
      this.formularioLogin.patchValue({
        email: emailGuardado,
        recordarme: true
      });
    }
  }

  // Manejar Enter en el formulario
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.cargando) {
      this.iniciarSesion();
    }
  }

  // Cargar credenciales de prueba - Comentado para producción
  /*
  cargarCredenciales(email: string, password: string) {
    this.formularioLogin.patchValue({
      email: email,
      password: password,
      recordarme: false
    });
  }
  */

  // Ir a la página de prueba Firebase
  irAPruebaFirebase() {
    this.router.navigate(['/firebase-test']);
  }
}