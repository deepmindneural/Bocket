import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PipesModule } from '../../pipes/pipes.module';

// Componentes
import { ClientesListaComponent } from './clientes-lista.component';
import { ListaClientesComponent } from './components/lista-clientes.component';
import { FormularioClienteComponent } from './components/formulario-cliente.component';

const routes = [
  {
    path: '',
    component: ClientesListaComponent
  },
  {
    path: 'nuevo',
    component: FormularioClienteComponent
  },
  {
    path: ':id',
    component: FormularioClienteComponent
  },
  {
    path: ':id/editar',
    component: FormularioClienteComponent
  }
];

@NgModule({
  declarations: [
    ClientesListaComponent,
    ListaClientesComponent,
    FormularioClienteComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    PipesModule,
    RouterModule.forChild(routes)
  ]
})
export class ClientesModule {}