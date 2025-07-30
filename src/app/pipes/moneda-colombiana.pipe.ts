import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monedaColombiana',
  standalone: false
})
export class MonedaColombianaPipe implements PipeTransform {

  transform(value: number, showSymbol: boolean = true, showCode: boolean = true): string {
    if (value == null || isNaN(value)) {
      return '';
    }

    // Formatear el número con separadores de miles
    const formatted = value.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    // Construir el resultado
    let result = '';
    
    if (showSymbol) {
      result += '$';
    }
    
    result += formatted;
    
    if (showCode) {
      result += ' COP';
    }

    return result;
  }
}

@Pipe({
  name: 'numeroCompacto',
  standalone: false
})
export class NumeroCompactoPipe implements PipeTransform {

  transform(value: number): string {
    if (value == null || isNaN(value)) {
      return '';
    }

    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }

    return value.toString();
  }
}