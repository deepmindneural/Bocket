const express = require('express');
const path = require('path');
const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos de Angular
app.use(express.static(path.join(__dirname, 'www')));

// Configurar CORS para Firebase
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Manejar rutas de Angular - SPA routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Bocket CRM ejecutándose en puerto ${PORT}`);
  console.log(`📱 Aplicación disponible en: http://localhost:${PORT}`);
});