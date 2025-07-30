import { NgModule } from '@angular/core';
import { MonedaColombianaPipe, NumeroCompactoPipe } from './moneda-colombiana.pipe';

@NgModule({
  declarations: [
    MonedaColombianaPipe,
    NumeroCompactoPipe
  ],
  exports: [
    MonedaColombianaPipe,
    NumeroCompactoPipe
  ]
})
export class PipesModule { }