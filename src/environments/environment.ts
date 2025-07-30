// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
  // Configuración de Firebase - Datos reales del proyecto
  firebaseConfig: {
    apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
    authDomain: "bocket-2024.firebaseapp.com",
    projectId: "bocket-2024",
    storageBucket: "bocket-2024.appspot.com",
    messagingSenderId: "537532907057",
    appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
  },

  // URLs de la aplicación
  appUrl: 'http://localhost:8100',
  
  // Configuración de la aplicación
  app: {
    name: 'Bocket CRM',
    version: '1.0.0',
    supportEmail: 'soporte@bocketcrm.com'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
