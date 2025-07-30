import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, from, map, catchError, of } from 'rxjs';
import { AuthService } from '../servicios/auth.service';
import { RestauranteService } from '../servicios/restaurante.service';

@Injectable({
  providedIn: 'root'
})
export class TenantGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private restauranteService: RestauranteService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const restauranteSlug = route.paramMap.get('restauranteSlug');
    
    if (!restauranteSlug) {
      // No hay slug de restaurante - redirigir a selección
      return this.router.createUrlTree(['/seleccionar-restaurante']);
    }

    return this.checkTenantAccess(restauranteSlug, state.url);
  }

  private checkTenantAccess(slug: string, url: string): Observable<boolean | UrlTree> {
    // Primero verificar que el usuario esté autenticado
    if (!this.authService.estaAutenticado()) {
      return of(this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: url }
      }));
    }

    // Verificar que el restaurante existe y el usuario tiene acceso
    return from(this.verificarAccesoRestaurante(slug)).pipe(
      map(tieneAcceso => {
        if (tieneAcceso) {
          return true;
        } else {
          // Sin acceso - redirigir a login
          return this.router.createUrlTree(['/login'], {
            queryParams: { error: 'sin-acceso', restaurante: slug }
          });
        }
      }),
      catchError(error => {
        console.error('Error verificando acceso al restaurante:', error);
        return of(this.router.createUrlTree(['/login'], {
          queryParams: { error: 'restaurante-no-encontrado' }
        }));
      })
    );
  }

  private async verificarAccesoRestaurante(slug: string): Promise<boolean> {
    try {
      // 1. Verificar que el restaurante existe y está activo
      const restaurante = await this.restauranteService.obtenerPorSlug(slug);
      
      if (!restaurante || !restaurante.activo) {
        return false;
      }

      // 2. Verificar que el usuario tiene acceso a este restaurante
      const tieneAcceso = await this.authService.tieneAccesoRestaurante(restaurante.id!);
      
      return tieneAcceso;

    } catch (error) {
      console.error('Error en verificarAccesoRestaurante:', error);
      return false;
    }
  }
}