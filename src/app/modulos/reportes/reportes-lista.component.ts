import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes-lista',
  templateUrl: './reportes-lista.component.html',
  styleUrls: ['./reportes-lista.component.scss'],
  standalone: false
})
export class ReportesListaComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('Reportes módulo cargado');
  }

  generarReporte() {
    console.log('Generar reporte');
  }
}