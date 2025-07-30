import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { LoginComponent } from './auth/login.component';
import { FirebaseTestComponent } from './admin/firebase-test.component';
import { AuthGuard } from './guards/auth.guard';
import { TenantGuard } from './guards/tenant.guard';

const routes: Routes = [
  // Ruta de login pública
  {
    path: 'login',
    component: LoginComponent
  },
  
  // Ruta de prueba Firebase (desarrollo)
  {
    path: 'firebase-test',
    component: FirebaseTestComponent
  },
  
  // Módulo de administración backend (sin layout principal)
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  
  // Rutas directas (temporal para desarrollo)
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      }
    ]
  },
  {
    path: 'clientes',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./modulos/clientes/clientes.module').then(m => m.ClientesModule)
      }
    ]
  },
  {
    path: 'reservas',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./modulos/reservas/reservas.module').then(m => m.ReservasModule)
      }
    ]
  },
  {
    path: 'pedidos',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./modulos/pedidos/pedidos.module').then(m => m.PedidosModule)
      }
    ]
  },
  {
    path: 'productos',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./modulos/productos/productos.module').then(m => m.ProductosModule)
      }
    ]
  },
  {
    path: 'reportes',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./modulos/reportes/reportes.module').then(m => m.ReportesModule)
      }
    ]
  },
  {
    path: 'configuracion-restaurante',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./modulos/configuracion/configuracion.module').then(m => m.ConfiguracionModule)
      }
    ]
  },
  
  // Rutas multi-tenant con protección
  {
    path: ':restauranteSlug',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, TenantGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'clientes',
        loadChildren: () => import('./modulos/clientes/clientes.module').then(m => m.ClientesModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'reservas',
        loadChildren: () => import('./modulos/reservas/reservas.module').then(m => m.ReservasModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'pedidos',
        loadChildren: () => import('./modulos/pedidos/pedidos.module').then(m => m.PedidosModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'productos',
        loadChildren: () => import('./modulos/productos/productos.module').then(m => m.ProductosModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'reportes',
        loadChildren: () => import('./modulos/reportes/reportes.module').then(m => m.ReportesModule),
        canActivate: [AuthGuard]
      }
      // {
      //   path: 'configuracion-restaurante',
      //   loadChildren: () => import('./modulos/configuracion/configuracion.module').then(m => m.ConfiguracionModule),
      //   canActivate: [AuthGuard]
      // }
    ]
  },
  
  // Páginas especiales (por implementar)
  // {
  //   path: 'sin-acceso',
  //   loadChildren: () => import('./pages/sin-acceso/sin-acceso.module').then(m => m.SinAccesoModule)
  // },
  
  // Redireccionamiento por defecto
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Wildcard route - debe ir al final
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      enableTracing: true, // Cambiar a true para debug
      useHash: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
