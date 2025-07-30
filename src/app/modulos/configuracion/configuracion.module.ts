import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { ConfiguracionRestauranteComponent } from './configuracion-restaurante.component';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracionRestauranteComponent
  }
];

@NgModule({
  declarations: [
    ConfiguracionRestauranteComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class ConfiguracionModule { }