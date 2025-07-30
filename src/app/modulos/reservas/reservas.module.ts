import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReservasListaComponent } from './reservas-lista.component';
import { ReservaNuevaComponent } from './reserva-nueva.component';

@NgModule({
  declarations: [
    ReservasListaComponent,
    ReservaNuevaComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReservasListaComponent
      },
      {
        path: 'nueva',
        component: ReservaNuevaComponent
      },
      {
        path: ':id',
        component: ReservaNuevaComponent
      },
      {
        path: ':id/editar',
        component: ReservaNuevaComponent
      }
    ])
  ]
})
export class ReservasModule { }