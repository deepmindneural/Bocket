import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  
  private currentTheme = new BehaviorSubject<Theme>('light');
  public theme$ = this.currentTheme.asObservable();
  
  constructor() {
    // Cargar tema guardado o detectar preferencia del sistema
    this.initializeTheme();
  }
  
  private initializeTheme() {
    // Verificar si hay un tema guardado
    const savedTheme = localStorage.getItem('bocket-theme') as Theme;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme.value === 'auto') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  setTheme(theme: Theme) {
    this.currentTheme.next(theme);
    localStorage.setItem('bocket-theme', theme);
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    } else {
      this.applyTheme(theme);
    }
  }
  
  private applyTheme(theme: 'light' | 'dark') {
    // Remover clases anteriores
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Aplicar nueva clase
    document.body.classList.add(`theme-${theme}`);
    
    // Actualizar meta theme-color
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#3880ff');
    }
    
    // Aplicar variables CSS personalizadas
    this.setThemeVariables(theme);
  }
  
  private setThemeVariables(theme: 'light' | 'dark') {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      // Colores para tema oscuro
      root.style.setProperty('--ion-background-color', '#1a1a1a');
      root.style.setProperty('--ion-background-color-rgb', '26,26,26');
      root.style.setProperty('--ion-text-color', '#ffffff');
      root.style.setProperty('--ion-text-color-rgb', '255,255,255');
      
      // Colores de tarjetas y superficies
      root.style.setProperty('--ion-card-background', '#2a2a2a');
      root.style.setProperty('--ion-item-background', '#2a2a2a');
      root.style.setProperty('--ion-toolbar-background', '#2a2a2a');
      
      // Bordes y divisores
      root.style.setProperty('--ion-border-color', '#3a3a3a');
      root.style.setProperty('--ion-item-border-color', '#3a3a3a');
      
      // Colores de texto secundario
      root.style.setProperty('--ion-text-color-step-400', '#999999');
      root.style.setProperty('--ion-text-color-step-600', '#cccccc');
      
      // Overlays
      root.style.setProperty('--ion-backdrop-color', 'rgba(0,0,0,0.7)');
      root.style.setProperty('--ion-overlay-background-color', '#2a2a2a');
      
      // Inputs
      root.style.setProperty('--ion-placeholder-color', '#666666');
      
    } else {
      // Restaurar colores claros predeterminados
      root.style.setProperty('--ion-background-color', '#ffffff');
      root.style.setProperty('--ion-background-color-rgb', '255,255,255');
      root.style.setProperty('--ion-text-color', '#000000');
      root.style.setProperty('--ion-text-color-rgb', '0,0,0');
      
      root.style.setProperty('--ion-card-background', '#ffffff');
      root.style.setProperty('--ion-item-background', '#ffffff');
      root.style.setProperty('--ion-toolbar-background', '#f8f9fa');
      
      root.style.setProperty('--ion-border-color', '#c8c7cc');
      root.style.setProperty('--ion-item-border-color', '#c8c7cc');
      
      root.style.setProperty('--ion-text-color-step-400', '#666666');
      root.style.setProperty('--ion-text-color-step-600', '#333333');
      
      root.style.setProperty('--ion-backdrop-color', 'rgba(0,0,0,0.4)');
      root.style.setProperty('--ion-overlay-background-color', '#ffffff');
      
      root.style.setProperty('--ion-placeholder-color', '#999999');
    }
    
    // Variables personalizadas para componentes
    this.setCustomComponentVariables(theme);
  }
  
  private setCustomComponentVariables(theme: 'light' | 'dark') {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      // Dashboard
      root.style.setProperty('--dashboard-bg', '#1a1a1a');
      root.style.setProperty('--metric-card-bg', '#2a2a2a');
      root.style.setProperty('--metric-card-hover', '#333333');
      root.style.setProperty('--chart-grid-color', '#3a3a3a');
      
      // Formularios
      root.style.setProperty('--form-bg', '#2a2a2a');
      root.style.setProperty('--input-bg', '#333333');
      root.style.setProperty('--input-border', '#444444');
      root.style.setProperty('--input-focus-border', '#5a9fd4');
      
      // Tablas y listas
      root.style.setProperty('--table-header-bg', '#333333');
      root.style.setProperty('--table-row-hover', '#2a2a2a');
      root.style.setProperty('--list-item-hover', '#333333');
      
      // Sombras
      root.style.setProperty('--box-shadow-light', '0 2px 8px rgba(0,0,0,0.3)');
      root.style.setProperty('--box-shadow-medium', '0 4px 16px rgba(0,0,0,0.4)');
      root.style.setProperty('--box-shadow-heavy', '0 8px 32px rgba(0,0,0,0.5)');
      
    } else {
      // Dashboard
      root.style.setProperty('--dashboard-bg', '#f5f7fa');
      root.style.setProperty('--metric-card-bg', '#ffffff');
      root.style.setProperty('--metric-card-hover', '#f8f9fa');
      root.style.setProperty('--chart-grid-color', '#e9ecef');
      
      // Formularios
      root.style.setProperty('--form-bg', '#ffffff');
      root.style.setProperty('--input-bg', '#ffffff');
      root.style.setProperty('--input-border', '#ced4da');
      root.style.setProperty('--input-focus-border', '#80bdff');
      
      // Tablas y listas
      root.style.setProperty('--table-header-bg', '#f8f9fa');
      root.style.setProperty('--table-row-hover', '#f5f5f5');
      root.style.setProperty('--list-item-hover', '#f8f9fa');
      
      // Sombras
      root.style.setProperty('--box-shadow-light', '0 2px 8px rgba(0,0,0,0.08)');
      root.style.setProperty('--box-shadow-medium', '0 4px 16px rgba(0,0,0,0.12)');
      root.style.setProperty('--box-shadow-heavy', '0 8px 32px rgba(0,0,0,0.16)');
    }
  }
  
  toggleTheme() {
    const current = this.currentTheme.value;
    const next = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }
  
  getCurrentTheme(): Theme {
    return this.currentTheme.value;
  }
  
  isDarkMode(): boolean {
    if (this.currentTheme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return this.currentTheme.value === 'dark';
  }
}