import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductosListaComponent } from './productos-lista.component';
import { FormularioProductoComponent } from './formulario-producto.component';

const routes = [
  {
    path: '',
    component: ProductosListaComponent
  },
  {
    path: 'nuevo',
    component: FormularioProductoComponent
  },
  {
    path: ':id',
    component: FormularioProductoComponent
  },
  {
    path: ':id/editar',
    component: FormularioProductoComponent
  }
];

@NgModule({
  declarations: [
    ProductosListaComponent,
    FormularioProductoComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductosModule { }