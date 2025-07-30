import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardMejoradoComponent } from './dashboard-mejorado.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardMejoradoComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    PipesModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardMejoradoComponent
      },
      {
        path: 'clasico',
        component: DashboardComponent
      }
    ])
  ]
})
export class DashboardModule { }