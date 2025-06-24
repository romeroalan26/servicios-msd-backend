import dotenv from 'dotenv';
dotenv.config();

import { AuthService } from '../services/authService';

async function testAuth() {
  try {
    console.log('🔐 Probando autenticación...\n');

    // Probar login de admin
    console.log('👨‍💼 Probando login de admin:');
    try {
      const adminAuth = await AuthService.login({
        email: 'admin@serviciosmsd.com',
        password: 'admin123',
      });
      console.log('✅ Login admin exitoso');
      console.log(`  Token: ${adminAuth.token.substring(0, 50)}...`);
      console.log(
        `  Empleado: ${adminAuth.empleado.nombre} (${adminAuth.empleado.rol})`,
      );

      // Probar verificación de token
      const adminUser = await AuthService.getCurrentUser(adminAuth.token);
      console.log(
        `  Verificación: ${adminUser.nombre} autenticado correctamente\n`,
      );
    } catch (error: any) {
      console.log('❌ Error en login admin:', error.message);
    }

    // Probar login de empleado
    console.log('👤 Probando login de empleado:');
    try {
      const empleadoAuth = await AuthService.login({
        email: 'juan.perez@serviciosmsd.com',
        password: 'empleado123',
      });
      console.log('✅ Login empleado exitoso');
      console.log(`  Token: ${empleadoAuth.token.substring(0, 50)}...`);
      console.log(
        `  Empleado: ${empleadoAuth.empleado.nombre} (${empleadoAuth.empleado.rol}) - Prioridad: ${empleadoAuth.empleado.prioridad}`,
      );

      // Probar verificación de token
      const empleadoUser = await AuthService.getCurrentUser(empleadoAuth.token);
      console.log(
        `  Verificación: ${empleadoUser.nombre} autenticado correctamente\n`,
      );
    } catch (error: any) {
      console.log('❌ Error en login empleado:', error.message);
    }

    // Probar credenciales inválidas
    console.log('🚫 Probando credenciales inválidas:');
    try {
      await AuthService.login({
        email: 'admin@serviciosmsd.com',
        password: 'password_incorrecto',
      });
      console.log('❌ Error: Debería haber fallado');
    } catch (error: any) {
      console.log('✅ Correcto: Credenciales inválidas rechazadas');
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testAuth();
