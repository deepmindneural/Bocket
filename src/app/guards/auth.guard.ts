import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    
    return this.checkAuthentication(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    
    return this.checkAuthentication(state.url);
  }

  private checkAuthentication(url: string): boolean | UrlTree {
    // TEMPORAL: Usar método síncrono para desarrollo mock
    const isAuthenticated = this.authService.estaAutenticado();
    
    if (isAuthenticated) {
      // Usuario autenticado
      return true;
    } else {
      // Usuario no autenticado - redirigir a login
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: url }
      });
    }
  }
}