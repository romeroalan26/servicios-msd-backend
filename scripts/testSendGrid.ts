import dotenv from 'dotenv';
import { NotificationService } from '../src/services/notificationService';

// Cargar variables de entorno
dotenv.config();

console.log('🔎 Variables de entorno usadas para la conexión:');
console.log(`   DB_USER: ${process.env.DB_USER}`);
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_NAME: ${process.env.DB_NAME}`);
console.log(
  `   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'No definida'}`,
);
console.log(`   DB_PORT: ${process.env.DB_PORT}`);

async function testSendGrid() {
  console.log('🧪 Iniciando prueba de SendGrid (sin base de datos)...\n');

  try {
    // 1. Verificar configuración
    console.log('📋 Verificando configuración:');
    console.log(
      `   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Configurada' : '❌ No configurada'}`,
    );
    console.log(
      `   SENDGRID_FROM_EMAIL: ${process.env.SENDGRID_FROM_EMAIL || '❌ No configurado'}`,
    );
    console.log(
      `   SENDGRID_TEMPLATE_ID: ${process.env.SENDGRID_TEMPLATE_ID || '❌ No configurado (usará HTML personalizado)'}`,
    );
    console.log(
      `   ADMIN_EMAILS: ${process.env.ADMIN_EMAILS || '❌ No configurado'}`,
    );
    console.log(
      `   ADDITIONAL_EMAILS: ${process.env.ADDITIONAL_EMAILS || '❌ No configurado'}\n`,
    );

    // 2. Inicializar servicio de notificaciones
    console.log('🔧 Inicializando servicio de notificaciones...');
    NotificationService.initialize();

    // 3. Crear datos de prueba ficticios
    console.log('📊 Creando datos de prueba ficticios...');

    const empleadoPrueba = {
      id: 1,
      nombre: 'Empleado de Prueba',
      email: 'alanromerod.266@gmail.com',
      rol: 'empleado' as const,
      prioridad: 1,
      activo: true,
      password_hash: 'test_hash',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const servicioPrueba = {
      id: 1,
      nombre: 'Servicio de Prueba',
      descripcion: 'Este es un servicio de prueba para verificar SendGrid',
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log(
      `   Empleado de prueba: ${empleadoPrueba.nombre} (${empleadoPrueba.email})`,
    );
    console.log(`   Servicio de prueba: ${servicioPrueba.nombre}\n`);

    // 4. Crear datos de notificación de prueba
    const notificationData = {
      empleado: empleadoPrueba,
      servicio: servicioPrueba,
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      tanda: 'mañana',
      turnoNombre: 'Turno de Prueba',
    };

    // 5. Probar envío de notificación al empleado
    console.log('📧 Probando envío de notificación al empleado...');
    const resultadoEmpleado =
      await NotificationService.sendSelectionNotification(notificationData);
    console.log(
      `   Resultado: ${resultadoEmpleado ? '✅ Éxito' : '❌ Falló'}\n`,
    );

    // 6. Probar envío de notificación al administrador
    console.log('📧 Probando envío de notificación al administrador...');
    const resultadoAdmin =
      await NotificationService.sendAdminNotification(notificationData);
    console.log(`   Resultado: ${resultadoAdmin ? '✅ Éxito' : '❌ Falló'}\n`);

    // 7. Probar envío de notificaciones adicionales
    console.log('📧 Probando envío de notificaciones adicionales...');
    const resultadoAdicionales =
      await NotificationService.sendAdditionalNotifications(notificationData);
    console.log(
      `   Resultado: ${resultadoAdicionales ? '✅ Éxito' : '❌ Falló'}\n`,
    );

    // 8. Probar envío de todas las notificaciones
    console.log('📧 Probando envío de todas las notificaciones...');
    const resultadosCompletos =
      await NotificationService.sendAllNotifications(notificationData);
    console.log('   Resultados completos:', resultadosCompletos);

    // 9. Resumen final
    console.log('\n📋 RESUMEN DE LA PRUEBA:');
    console.log('========================');

    if (resultadoEmpleado && resultadoAdmin && resultadoAdicionales) {
      console.log('🎉 ¡Todas las notificaciones se enviaron correctamente!');
      console.log('✅ SendGrid está funcionando perfectamente');
    } else {
      console.log('⚠️  Algunas notificaciones fallaron:');
      console.log(`   - Empleado: ${resultadoEmpleado ? '✅' : '❌'}`);
      console.log(`   - Administrador: ${resultadoAdmin ? '✅' : '❌'}`);
      console.log(`   - Adicionales: ${resultadoAdicionales ? '✅' : '❌'}`);

      if (!process.env.SENDGRID_API_KEY) {
        console.log(
          '\n💡 SUGERENCIA: Configura SENDGRID_API_KEY en tu archivo .env',
        );
      }
      if (!process.env.SENDGRID_FROM_EMAIL) {
        console.log(
          '\n💡 SUGERENCIA: Configura SENDGRID_FROM_EMAIL en tu archivo .env',
        );
      }
    }
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.log('\n💡 VERIFICACIONES:');
    console.log(
      '   1. ¿Tienes configurada SENDGRID_API_KEY en tu archivo .env?',
    );
    console.log('   2. ¿La API key de SendGrid es válida?');
    console.log('   3. ¿El correo remitente está verificado en SendGrid?');
    console.log('   4. ¿Tienes conexión a internet?');
  }
}

// Ejecutar la prueba
testSendGrid()
  .then(() => {
    console.log('\n🏁 Prueba completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
