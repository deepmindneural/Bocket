import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { ThemeService, Theme } from '../servicios/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-button fill="clear" size="small" (click)="toggleTheme()">
      <ion-icon [name]="currentIcon" slot="icon-only"></ion-icon>
    </ion-button>
  `
})
export class ThemeToggleComponent implements OnInit {
  currentTheme: Theme = 'light';
  currentIcon = 'sunny';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
      this.updateIcon();
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  private updateIcon() {
    switch (this.currentTheme) {
      case 'dark':
        this.currentIcon = 'moon';
        break;
      case 'auto':
        this.currentIcon = 'contrast';
        break;
      default:
        this.currentIcon = 'sunny';
    }
  }
}

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-list lines="none">
      <ion-list-header>
        <ion-label>Seleccionar Tema</ion-label>
      </ion-list-header>
      
      <ion-item button (click)="selectTheme('light')" [class.selected]="currentTheme === 'light'">
        <ion-icon name="sunny" slot="start" color="warning"></ion-icon>
        <ion-label>
          <h3>Claro</h3>
          <p>Tema claro tradicional</p>
        </ion-label>
        <ion-icon *ngIf="currentTheme === 'light'" name="checkmark" slot="end" color="primary"></ion-icon>
      </ion-item>
      
      <ion-item button (click)="selectTheme('dark')" [class.selected]="currentTheme === 'dark'">
        <ion-icon name="moon" slot="start" color="medium"></ion-icon>
        <ion-label>
          <h3>Oscuro</h3>
          <p>Reduce fatiga visual</p>
        </ion-label>
        <ion-icon *ngIf="currentTheme === 'dark'" name="checkmark" slot="end" color="primary"></ion-icon>
      </ion-item>
      
      <ion-item button (click)="selectTheme('auto')" [class.selected]="currentTheme === 'auto'">
        <ion-icon name="contrast" slot="start" color="tertiary"></ion-icon>
        <ion-label>
          <h3>Automático</h3>
          <p>Sigue al sistema</p>
        </ion-label>
        <ion-icon *ngIf="currentTheme === 'auto'" name="checkmark" slot="end" color="primary"></ion-icon>
      </ion-item>
    </ion-list>
  `,
  styles: [`
    ion-list {
      margin: 0;
      padding: 0;
    }
    
    ion-list-header {
      font-weight: 600;
      padding-bottom: 8px;
    }
    
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      margin-bottom: 4px;
      
      &.selected {
        --background: var(--ion-color-primary-tint, rgba(56, 128, 255, 0.1));
      }
      
      ion-icon[slot="start"] {
        margin-right: 16px;
        font-size: 1.5rem;
      }
      
      ion-label {
        h3 {
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        p {
          font-size: 0.85rem;
          color: var(--ion-text-color-step-600);
        }
      }
    }
  `]
})
export class ThemeSelectorComponent implements OnInit {
  currentTheme: Theme = 'light';

  constructor(
    private themeService: ThemeService,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  selectTheme(theme: Theme) {
    this.themeService.setTheme(theme);
    this.popoverController.dismiss();
  }
}