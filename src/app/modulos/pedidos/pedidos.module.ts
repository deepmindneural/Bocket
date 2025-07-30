import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PedidosListaComponent } from './pedidos-lista.component';
import { PedidoNuevoComponent } from './pedido-nuevo.component';

@NgModule({
  declarations: [
    PedidosListaComponent,
    PedidoNuevoComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: PedidosListaComponent
      },
      {
        path: 'nuevo',
        component: PedidoNuevoComponent
      },
      {
        path: ':id',
        component: PedidoNuevoComponent
      },
      {
        path: ':id/editar',
        component: PedidoNuevoComponent
      }
    ])
  ]
})
export class PedidosModule { }