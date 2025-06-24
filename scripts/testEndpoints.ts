import dotenv from 'dotenv';
dotenv.config();

async function testEndpoints() {
  const baseUrl = 'http://localhost:3000/api';

  try {
    console.log('🌐 Probando endpoints HTTP...\n');

    // Probar health check
    console.log('1️⃣ Probando /health:');
    try {
      const healthResponse = await fetch(`${baseUrl}/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Health check:', healthData);
    } catch (error) {
      console.log('❌ Error en health check:', error);
    }

    // Probar login de admin
    console.log('\n2️⃣ Probando /auth/login (admin):');
    try {
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@serviciosmsd.com',
          password: 'admin123',
        }),
      });

      const loginData = await loginResponse.json();
      console.log('✅ Login admin:', {
        success: loginData.success,
        empleado: loginData.data?.empleado?.nombre,
        token: loginData.data?.token
          ? `${loginData.data.token.substring(0, 50)}...`
          : 'No token',
      });

      // Probar endpoint /me con el token
      if (loginData.data?.token) {
        console.log('\n3️⃣ Probando /auth/me con token de admin:');
        try {
          const meResponse = await fetch(`${baseUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${loginData.data.token}`,
            },
          });

          const meData = await meResponse.json();
          console.log('✅ /me admin:', {
            success: meData.success,
            empleado: meData.data?.nombre,
            rol: meData.data?.rol,
          });
        } catch (error) {
          console.log('❌ Error en /me:', error);
        }
      }
    } catch (error) {
      console.log('❌ Error en login admin:', error);
    }

    // Probar login de empleado
    console.log('\n4️⃣ Probando /auth/login (empleado):');
    try {
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'juan.perez@serviciosmsd.com',
          password: 'empleado123',
        }),
      });

      const loginData = await loginResponse.json();
      console.log('✅ Login empleado:', {
        success: loginData.success,
        empleado: loginData.data?.empleado?.nombre,
        prioridad: loginData.data?.empleado?.prioridad,
        token: loginData.data?.token
          ? `${loginData.data.token.substring(0, 50)}...`
          : 'No token',
      });
    } catch (error) {
      console.log('❌ Error en login empleado:', error);
    }

    // Probar credenciales inválidas
    console.log('\n5️⃣ Probando credenciales inválidas:');
    try {
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@serviciosmsd.com',
          password: 'password_incorrecto',
        }),
      });

      const loginData = await loginResponse.json();
      console.log('✅ Credenciales inválidas rechazadas:', {
        success: loginData.success,
        error: loginData.error,
      });
    } catch (error) {
      console.log('❌ Error en credenciales inválidas:', error);
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testEndpoints();
