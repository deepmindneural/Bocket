import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminRestaurantesComponent } from './admin-restaurantes.component';
import { AdminPedidosComponent } from './admin-pedidos.component';
import { AdminClientesComponent } from './admin-clientes.component';
import { AdminReservasComponent } from './admin-reservas.component';
import { AdminUsuariosComponent } from './admin-usuarios.component';
import { TestFirestoreComponent } from './test-firestore.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AdminDashboardComponent
      },
      {
        path: 'restaurantes',
        component: AdminRestaurantesComponent
      },
      {
        path: 'pedidos',
        component: AdminPedidosComponent
      },
      {
        path: 'clientes',
        component: AdminClientesComponent
      },
      {
        path: 'reservas',
        component: AdminReservasComponent
      },
      {
        path: 'usuarios',
        component: AdminUsuariosComponent
      },
      {
        path: 'test',
        component: TestFirestoreComponent
      }
    ])
  ]
})
export class AdminModule { }