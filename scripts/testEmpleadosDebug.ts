import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

async function testAuth() {
  console.log('🔐 Probando autenticación...');

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@serviciosmsd.com',
      password: 'admin123',
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Autenticación exitosa');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error en autenticación:', (error as any).message);
    return false;
  }
}

async function testCreateEmpleado() {
  console.log('➕ Probando crear empleado con email único...');

  try {
    const timestamp = Date.now();
    const nuevoEmpleado = {
      nombre: `Empleado Test ${timestamp}`,
      email: `test${timestamp}@serviciosmsd.com`,
      password: 'test123',
      rol: 'empleado' as const,
      prioridad: 21,
    };

    const response = await axios.post(`${BASE_URL}/empleados`, nuevoEmpleado, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      console.log(
        '✅ Empleado creado exitosamente:',
        response.data.data.nombre,
      );
      return response.data.data.id;
    }
    return null;
  } catch (error) {
    console.error(
      '❌ Error creando empleado:',
      (error as any).response?.data || (error as any).message,
    );
    return null;
  }
}

async function testCambiarPrioridad(empleadoId: number) {
  console.log(`📊 Probando cambiar prioridad del empleado ${empleadoId}...`);

  try {
    // Primero verificar el rol del empleado
    const empleadoResponse = await axios.get(
      `${BASE_URL}/empleados/${empleadoId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    console.log('Empleado actual:', empleadoResponse.data.data);

    if (empleadoResponse.data.data.rol === 'admin') {
      console.log('⚠️  No se puede cambiar prioridad de admin');
      return false;
    }

    const response = await axios.put(
      `${BASE_URL}/empleados/${empleadoId}/prioridad`,
      {
        prioridad: 1,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    if (response.data.success) {
      console.log(
        '✅ Prioridad cambiada exitosamente:',
        response.data.data.prioridad,
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error(
      '❌ Error cambiando prioridad:',
      (error as any).response?.data || (error as any).message,
    );
    return false;
  }
}

async function runDebugTests() {
  console.log('🚀 Iniciando pruebas de debug...\n');

  // 1. Autenticación
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.log('❌ No se pudo autenticar, abortando pruebas');
    return;
  }

  // 2. Crear empleado
  const empleadoId = await testCreateEmpleado();
  if (!empleadoId) {
    console.log('❌ No se pudo crear empleado, abortando pruebas');
    return;
  }

  // 3. Cambiar prioridad
  await testCambiarPrioridad(empleadoId);

  console.log('\n✅ Pruebas de debug completadas');
}

runDebugTests().catch((error) => {
  console.error('❌ Error ejecutando pruebas:', error.message);
});
