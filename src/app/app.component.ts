import { Component, OnInit } from '@angular/core';
import { ThemeService } from './servicios/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}
  
  ngOnInit() {
    // El servicio de temas se inicializa automáticamente
    console.log('Tema inicializado:', this.themeService.getCurrentTheme());
  }
}
