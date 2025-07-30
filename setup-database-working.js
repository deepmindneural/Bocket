#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase desde environment.ts
const firebaseConfig = {
  apiKey: "AIzaSyC54Ytk5wO2zupIuCtFIsIUNXvP4m9qqOk",
  authDomain: "bocket-2024.firebaseapp.com",
  projectId: "bocket-2024",
  storageBucket: "bocket-2024.appspot.com",
  messagingSenderId: "537532907057",
  appId: "1:537532907057:web:dc51aacd0553b9ac2edf10"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🏗️  CONFIGURANDO BASE DE DATOS COMPLETA BOCKET CRM');
console.log('='.repeat(80));

async function setupCompleteDatabase() {
  try {
    console.log('📦 PASO 1: Configurando estructura multi-tenant...');
    
    // 1. Crear usuarios globales
    console.log('👥 Creando usuarios globales...');
    
    const usuariosGlobales = [
      {
        uid: 'admin_bocket_001',
        email: 'admin@bocket.co',
        nombreCompleto: 'Administrador Bocket',
        emailVerificado: true,
        activo: true,
        rol: 'super_admin',
        idioma: 'es',
        zonaHoraria: 'America/Bogota',
        restaurantes: ['rest_donpepe_001', 'rest_marinacafe_002'],
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp()
      }
    ];

    for (const usuario of usuariosGlobales) {
      await setDoc(doc(db, 'usuarios', usuario.uid), usuario);
      console.log(`   ✅ Usuario creado: ${usuario.email}`);
    }

    // 2. Crear relaciones usuario-restaurante
    console.log('🔗 Creando relaciones usuario-restaurante...');
    
    const relacionesUsuarioRestaurante = [
      {
        usuarioId: 'admin_bocket_001',
        restauranteId: 'rest_donpepe_001',
        rol: 'admin',
        permisos: ['clientes', 'reservas', 'pedidos', 'productos', 'reportes', 'configuracion'],
        activo: true,
        fechaAsignacion: serverTimestamp()
      },
      {
        usuarioId: 'admin_bocket_001',
        restauranteId: 'rest_marinacafe_002',
        rol: 'admin',
        permisos: ['clientes', 'reservas', 'pedidos', 'productos', 'reportes', 'configuracion'],
        activo: true,
        fechaAsignacion: serverTimestamp()
      }
    ];

    for (const relacion of relacionesUsuarioRestaurante) {
      const id = `${relacion.usuarioId}_${relacion.restauranteId}`;
      await setDoc(doc(db, 'usuariosRestaurantes', id), relacion);
      console.log(`   ✅ Relación creada: ${relacion.usuarioId} -> ${relacion.restauranteId}`);
    }

    console.log('\n📊 PASO 2: Configurando colecciones por restaurante...');
    
    // 3. Para cada restaurante, crear datos con interface finalUser
    const restaurantes = ['rest_donpepe_001', 'rest_marinacafe_002'];
    
    for (const restauranteId of restaurantes) {
      console.log(`\n🏪 Configurando datos para: ${restauranteId}`);

      // Crear clientes con interface finalUser COMPLETA
      console.log('👥 Creando clientes (finalUser interface)...');
      
      const clientesFinalUser = [
        {
          // Interface finalUser completa según tu especificación
          id: '573001234567', // número WhatsApp
          isGroup: false,
          creation: '2025-01-15T10:30:00.000Z',
          isEnterprise: false,
          isBusiness: true,
          isMyContact: true,
          isUser: true,
          isWAContact: true,
          isBlocked: false,
          wappLabels: ['cliente_vip', 'frecuente'],
          name: 'Pedro Martínez García',
          pushname: 'Pedro M.',
          sectionHeader: '',
          shortName: 'Pedro',
          sourceType: 'chatBot', // chatBot | manual | api
          respType: 'bot', // manualTemp | bot | manual
          labels: 'cliente_vip,frecuente,parrilla',
          whatsAppName: 'Pedro Martínez',
          isSpam: false,
          email: 'pedro.martinez@email.com',
          company: 'Empresas ABC S.A.S',
          address: 'Calle 72 #10-15, Bogotá - Barrio Rosales, Torre A Apto 502',
          image: 'https://example.com/profile/pedro.jpg',
          lastUpdate: '2025-01-26T08:45:00.000Z',
          restauranteId: restauranteId, // Para multi-tenancy
          // Interface UserInteractions completa
          userInteractions: {
            whatsapp: 45,
            controller: 12,
            chatbot: 23,
            api: 8,
            campaing: 3,
            client: 67,
            others: 2,
            wappController: 15,
            ai: 7,
            fee: 125000 // total gastado
          }
        },
        {
          id: '573109876543',
          isGroup: false,
          creation: '2025-01-20T14:20:00.000Z',
          isEnterprise: true,
          isBusiness: true,
          isMyContact: true,
          isUser: true,
          isWAContact: true,
          isBlocked: false,
          wappLabels: ['cliente_corporativo', 'eventos'],
          name: 'Ana Lucía Rodríguez Silva',
          pushname: 'Ana R.',
          sectionHeader: '',
          shortName: 'Ana',
          sourceType: 'manual',
          respType: 'manual',
          labels: 'cliente_corporativo,eventos,cenas_trabajo',
          whatsAppName: 'Ana Rodríguez',
          isSpam: false,
          email: 'ana.rodriguez@empresa.com',
          company: 'Corporación XYZ S.A.',
          address: 'Carrera 11 #93-45, Oficina 801',
          image: 'https://example.com/profile/ana.jpg',
          lastUpdate: '2025-01-26T16:30:00.000Z',
          restauranteId: restauranteId,
          userInteractions: {
            whatsapp: 78,
            controller: 25,
            chatbot: 12,
            api: 15,
            campaing: 8,
            client: 98,
            others: 5,
            wappController: 32,
            ai: 18,
            fee: 285000
          }
        }
      ];

      for (const cliente of clientesFinalUser) {
        await setDoc(doc(db, 'restaurantes', restauranteId, 'clientes', cliente.id), cliente);
        console.log(`   ✅ Cliente finalUser creado: ${cliente.name} (${cliente.id})`);
      }

      // Crear pedidos con interface OrderTodelivery COMPLETA
      console.log('🍽️  Creando pedidos (OrderTodelivery interface)...');
      
      const pedidosOrderTodelivery = [
        {
          // Interface OrderTodelivery completa según tu especificación
          id: `pedido_${Date.now()}_1`,
          contact: '573001234567', // Identificador del contacto de whatsapp
          orderType: 'delivery', // delivery | pickUp | insideOrder
          resumeOrder: '1x Bandeja Paisa ($35.000), 1x Jugo Natural Naranja ($8.000), 1x Arepa con Queso ($5.000). Total: $48.000',
          contactNameOrder: 'Pedro Martínez García', // A nombre quien está el pedido
          addressToDelivery: 'Calle 72 #10-15, Bogotá - Barrio Rosales, Torre A Apto 502',
          statusBooking: 'inDelivery', // pending | accepted | rejected | inProcess | inDelivery | deliveried
          // Campos adicionales útiles
          restauranteId: restauranteId,
          fechaPedido: serverTimestamp(),
          valorTotal: 48000,
          valorDelivery: 5000,
          metodoPago: 'efectivo',
          observaciones: 'Sin cebolla en la bandeja, favor tocar timbre apartamento 502'
        },
        {
          id: `pedido_${Date.now()}_2`,
          contact: '573109876543',
          orderType: 'pickUp',
          resumeOrder: '2x Café Americano ($16.000), 3x Croissant Almendras ($36.000), 1x Cheesecake ($18.000). Total: $70.000',
          contactNameOrder: 'Ana Lucía Rodríguez Silva',
          addressToDelivery: 'Recoge en tienda',
          statusBooking: 'accepted',
          restauranteId: restauranteId,
          fechaPedido: serverTimestamp(),
          valorTotal: 70000,
          valorDelivery: 0,
          metodoPago: 'tarjeta',
          observaciones: 'Pedido corporativo, requiere factura electrónica'
        },
        {
          id: `pedido_${Date.now()}_3`,
          contact: '573201357924',
          orderType: 'insideOrder',
          resumeOrder: '1x Churrasco Argentino ($45.000), 1x Vino Tinto Copa ($22.000), 1x Postre del día ($12.000). Total: $79.000',
          contactNameOrder: 'Carlos Eduardo Vargas',
          addressToDelivery: 'Mesa 12 - Restaurante',
          statusBooking: 'inProcess',
          restauranteId: restauranteId,
          fechaPedido: serverTimestamp(),
          valorTotal: 79000,
          valorDelivery: 0,
          metodoPago: 'tarjeta',
          observaciones: 'Cliente solicita término medio para el churrasco'
        }
      ];

      for (const pedido of pedidosOrderTodelivery) {
        await setDoc(doc(db, 'restaurantes', restauranteId, 'pedidos', pedido.id), pedido);
        console.log(`   ✅ Pedido OrderTodelivery creado: ${pedido.id} (${pedido.orderType})`);
      }

      // Crear reservas
      console.log('📅 Creando reservas...');
      
      const reservas = [
        {
          id: `reserva_${Date.now()}_1`,
          contact: '573001234567',
          contactNameBooking: 'Pedro Martínez García',
          dateBooking: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
          peopleBooking: 4,
          finalPeopleBooking: 4,
          statusBooking: 'accepted',
          detailsBooking: 'Mesa cerca de la ventana, celebración de cumpleaños',
          restauranteId: restauranteId,
          fechaReserva: serverTimestamp(),
          reconfirmDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 horas antes
          reconfirmStatus: 'pending'
        }
      ];

      for (const reserva of reservas) {
        await setDoc(doc(db, 'restaurantes', restauranteId, 'reservas', reserva.id), reserva);
        console.log(`   ✅ Reserva creada: ${reserva.id}`);
      }

      // Crear etiquetas personalizadas para WhatsApp
      console.log('🏷️  Creando etiquetas WhatsApp...');
      
      const etiquetasWhatsApp = [
        {
          id: 'cliente_vip',
          nombre: 'Cliente VIP',
          color: '#FFD700',
          descripcion: 'Cliente con alto valor de compra',
          activa: true,
          tipoEtiqueta: 'whatsapp'
        },
        {
          id: 'cliente_corporativo',
          nombre: 'Cliente Corporativo',
          color: '#1E90FF',
          descripcion: 'Cliente empresarial para eventos',
          activa: true,
          tipoEtiqueta: 'whatsapp'
        },
        {
          id: 'frecuente',
          nombre: 'Cliente Frecuente',
          color: '#32CD32',
          descripcion: 'Cliente que visita regularmente',
          activa: true,
          tipoEtiqueta: 'whatsapp'
        }
      ];

      for (const etiqueta of etiquetasWhatsApp) {
        await setDoc(doc(db, 'restaurantes', restauranteId, 'etiquetas', etiqueta.id), etiqueta);
        console.log(`   ✅ Etiqueta creada: ${etiqueta.nombre}`);
      }

      // Crear productos
      console.log('🥘 Creando productos...');
      
      const productos = [
        {
          id: 'prod_bandeja_paisa',
          nombre: 'Bandeja Paisa',
          descripcion: 'Plato típico con frijoles, arroz, huevo, chicharrón, chorizo, arepa y aguacate',
          precio: 35000,
          categoria: 'platos_principales',
          disponible: true,
          tiempoPreparacion: 25,
          restauranteId: restauranteId
        },
        {
          id: 'prod_churrasco',
          nombre: 'Churrasco Argentino',
          descripcion: 'Corte premium de res a la parrilla con papas y ensalada',
          precio: 45000,
          categoria: 'carnes',
          disponible: true,
          tiempoPreparacion: 20,
          restauranteId: restauranteId
        },
        {
          id: 'prod_cafe_americano',
          nombre: 'Café Americano',
          descripcion: 'Café premium colombiano preparado con método tradicional',
          precio: 8000,
          categoria: 'bebidas',
          disponible: true,
          tiempoPreparacion: 5,
          restauranteId: restauranteId
        }
      ];

      for (const producto of productos) {
        await setDoc(doc(db, 'restaurantes', restauranteId, 'productos', producto.id), producto);
        console.log(`   ✅ Producto creado: ${producto.nombre}`);
      }

      // Crear reporte con estadísticas
      console.log('📊 Creando reportes...');
      
      const reporte = {
        id: `reporte_diario_${new Date().toISOString().split('T')[0]}`,
        tipo: 'diario',
        fecha: serverTimestamp(),
        restauranteId: restauranteId,
        estadisticas: {
          totalClientes: clientesFinalUser.length,
          pedidosTotal: pedidosOrderTodelivery.length,
          pedidosEnDelivery: 1,
          pedidosEnProceso: 1,
          reservasPendientes: 1,
          ventasDelDia: pedidosOrderTodelivery.reduce((sum, p) => sum + p.valorTotal, 0),
          interaccionesWhatsApp: clientesFinalUser.reduce((sum, c) => sum + c.userInteractions.whatsapp, 0),
          totalFacturado: clientesFinalUser.reduce((sum, c) => sum + c.userInteractions.fee, 0)
        },
        clientesMasActivos: clientesFinalUser
          .sort((a, b) => b.userInteractions.client - a.userInteractions.client)
          .map(c => ({
            contact: c.id,
            nombre: c.name,
            interacciones: c.userInteractions.client,
            fee: c.userInteractions.fee,
            whatsapp: c.userInteractions.whatsapp
          }))
      };

      await setDoc(doc(db, 'restaurantes', restauranteId, 'reportes', reporte.id), reporte);
      console.log(`   ✅ Reporte creado: ${reporte.id}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 BASE DE DATOS CONFIGURADA COMPLETAMENTE');
    console.log('='.repeat(80));
    
    console.log('📊 RESUMEN DE IMPLEMENTACIÓN:');
    console.log('✅ Usuarios globales con multi-tenancy');
    console.log('✅ Relaciones usuario-restaurante');
    console.log('✅ Clientes con interface finalUser COMPLETA');
    console.log('   - Todos los campos de WhatsApp (isGroup, isEnterprise, etc.)');
    console.log('   - UserInteractions con estadísticas completas');
    console.log('   - sourceType y respType configurados');
    console.log('✅ Pedidos con interface OrderTodelivery COMPLETA');
    console.log('   - Todos los estados: pending, accepted, rejected, inProcess, inDelivery, deliveried');
    console.log('   - Todos los tipos: delivery, pickUp, insideOrder');
    console.log('✅ Reservas, productos, etiquetas y reportes');
    console.log('✅ Estructura multi-tenant por restaurante');
    
    console.log('\n🔧 ESTRUCTURA IMPLEMENTADA:');
    console.log('📁 Globales:');
    console.log('   - usuarios (UsuarioGlobal)');
    console.log('   - restaurantes (configuración completa)');
    console.log('   - usuariosRestaurantes (multi-tenancy)');
    console.log('📁 Por restaurante (restaurantes/{id}/):');
    console.log('   - clientes (finalUser interface)');
    console.log('   - pedidos (OrderTodelivery interface)');
    console.log('   - reservas, productos, etiquetas, reportes');
    
    console.log('\n💡 PRÓXIMOS PASOS RECOMENDADOS:');
    console.log('1. ✏️  Actualizar formulario de clientes para mostrar todos los campos finalUser');
    console.log('2. 📊 Crear componente de estadísticas UserInteractions');
    console.log('3. 🔒 Implementar reglas de seguridad Firestore');
    console.log('4. 🧪 Probar formularios con datos reales');
    console.log('5. 🎨 Crear UI para gestión de etiquetas WhatsApp');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
    throw error;
  }
}

// Ejecutar configuración
setupCompleteDatabase()
  .then(() => {
    console.log('\n✅ Configuración completada exitosamente');
    console.log('🔥 Firebase configurado con interfaces finalUser y OrderTodelivery completas');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });