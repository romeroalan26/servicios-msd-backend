import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let empleadoId = 0;

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testAuth() {
  logInfo('🔐 Probando autenticación...');

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@serviciosmsd.com',
      password: 'admin123',
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      logSuccess('Autenticación exitosa');
      return true;
    } else {
      logError('Error en autenticación');
      return false;
    }
  } catch (error) {
    logError('Error en autenticación: ' + (error as any).message);
    return false;
  }
}

async function testGetEmpleados() {
  logInfo('📋 Probando GET /empleados...');

  try {
    const response = await axios.get(`${BASE_URL}/empleados`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess(`Empleados obtenidos: ${response.data.data.length}`);
      if (response.data.data.length > 0) {
        empleadoId = response.data.data[0].id;
        logInfo(`ID del primer empleado: ${empleadoId}`);
      }
      return true;
    } else {
      logError('Error obteniendo empleados');
      return false;
    }
  } catch (error) {
    logError('Error obteniendo empleados: ' + (error as any).message);
    return false;
  }
}

async function testGetEmpleadosConFiltros() {
  logInfo('🔍 Probando GET /empleados con filtros...');

  try {
    const response = await axios.get(
      `${BASE_URL}/empleados?rol=empleado&activo=true&limit=5`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    if (response.data.success) {
      logSuccess(`Empleados filtrados obtenidos: ${response.data.data.length}`);
      return true;
    } else {
      logError('Error obteniendo empleados filtrados');
      return false;
    }
  } catch (error) {
    logError('Error obteniendo empleados filtrados: ' + (error as any).message);
    return false;
  }
}

async function testGetEmpleadosActivos() {
  logInfo('👥 Probando GET /empleados/activos...');

  try {
    const response = await axios.get(`${BASE_URL}/empleados/activos`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess(`Empleados activos obtenidos: ${response.data.data.length}`);
      return true;
    } else {
      logError('Error obteniendo empleados activos');
      return false;
    }
  } catch (error) {
    logError('Error obteniendo empleados activos: ' + (error as any).message);
    return false;
  }
}

async function testGetEmpleadoById() {
  if (!empleadoId) {
    logWarning('No hay empleado ID disponible para probar');
    return false;
  }

  logInfo(`👤 Probando GET /empleados/${empleadoId}...`);

  try {
    const response = await axios.get(`${BASE_URL}/empleados/${empleadoId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess(`Empleado obtenido: ${response.data.data.nombre}`);
      return true;
    } else {
      logError('Error obteniendo empleado por ID');
      return false;
    }
  } catch (error) {
    logError('Error obteniendo empleado por ID: ' + (error as any).message);
    return false;
  }
}

async function testCreateEmpleado() {
  logInfo('➕ Probando POST /empleados...');

  try {
    const nuevoEmpleado = {
      nombre: 'Empleado Test',
      email: 'test@serviciosmsd.com',
      password: 'test123',
      rol: 'empleado' as const,
      prioridad: 21,
    };

    const response = await axios.post(`${BASE_URL}/empleados`, nuevoEmpleado, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess(`Empleado creado: ${response.data.data.nombre}`);
      empleadoId = response.data.data.id;
      return true;
    } else {
      logError('Error creando empleado');
      return false;
    }
  } catch (error) {
    if ((error as any).response?.status === 409) {
      logWarning('Empleado ya existe, continuando con el existente');
      return true;
    }
    logError('Error creando empleado: ' + (error as any).message);
    return false;
  }
}

async function testUpdateEmpleado() {
  if (!empleadoId) {
    logWarning('No hay empleado ID disponible para probar');
    return false;
  }

  logInfo(`✏️  Probando PUT /empleados/${empleadoId}...`);

  try {
    const updateData = {
      nombre: 'Empleado Test Actualizado',
      email: 'test.updated@serviciosmsd.com',
    };

    const response = await axios.put(
      `${BASE_URL}/empleados/${empleadoId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    if (response.data.success) {
      logSuccess(`Empleado actualizado: ${response.data.data.nombre}`);
      return true;
    } else {
      logError('Error actualizando empleado');
      return false;
    }
  } catch (error) {
    logError('Error actualizando empleado: ' + (error as any).message);
    return false;
  }
}

async function testCambiarRol() {
  if (!empleadoId) {
    logWarning('No hay empleado ID disponible para probar');
    return false;
  }

  logInfo(`🔄 Probando PUT /empleados/${empleadoId}/rol...`);

  try {
    const response = await axios.put(
      `${BASE_URL}/empleados/${empleadoId}/rol`,
      {
        rol: 'admin',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    if (response.data.success) {
      logSuccess(`Rol cambiado a: ${response.data.data.rol}`);
      return true;
    } else {
      logError('Error cambiando rol');
      return false;
    }
  } catch (error) {
    logError('Error cambiando rol: ' + (error as any).message);
    return false;
  }
}

async function testCambiarPrioridad() {
  if (!empleadoId) {
    logWarning('No hay empleado ID disponible para probar');
    return false;
  }

  logInfo(`📊 Probando PUT /empleados/${empleadoId}/prioridad...`);

  try {
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
      logSuccess(`Prioridad cambiada a: ${response.data.data.prioridad}`);
      return true;
    } else {
      logError('Error cambiando prioridad');
      return false;
    }
  } catch (error) {
    logError('Error cambiando prioridad: ' + (error as any).message);
    return false;
  }
}

async function testResetearPrioridades() {
  logInfo('🔄 Probando POST /empleados/reset-prioridades...');

  try {
    const response = await axios.post(
      `${BASE_URL}/empleados/reset-prioridades`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    if (response.data.success) {
      logSuccess('Prioridades reseteadas exitosamente');
      return true;
    } else {
      logError('Error reseteando prioridades');
      return false;
    }
  } catch (error) {
    logError('Error reseteando prioridades: ' + (error as any).message);
    return false;
  }
}

async function testDeleteEmpleado() {
  if (!empleadoId) {
    logWarning('No hay empleado ID disponible para probar');
    return false;
  }

  logInfo(`🗑️  Probando DELETE /empleados/${empleadoId}...`);

  try {
    const response = await axios.delete(`${BASE_URL}/empleados/${empleadoId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success) {
      logSuccess('Empleado eliminado exitosamente');
      return true;
    } else {
      logError('Error eliminando empleado');
      return false;
    }
  } catch (error) {
    if ((error as any).response?.status === 400) {
      logWarning('No se puede eliminar empleado con selecciones activas');
      return true;
    }
    logError('Error eliminando empleado: ' + (error as any).message);
    return false;
  }
}

async function runTests() {
  log('🚀 Iniciando pruebas de endpoints de empleados...', colors.bold);
  log('');

  const tests = [
    { name: 'Autenticación', test: testAuth },
    { name: 'Obtener empleados', test: testGetEmpleados },
    { name: 'Obtener empleados con filtros', test: testGetEmpleadosConFiltros },
    { name: 'Obtener empleados activos', test: testGetEmpleadosActivos },
    { name: 'Obtener empleado por ID', test: testGetEmpleadoById },
    { name: 'Crear empleado', test: testCreateEmpleado },
    { name: 'Actualizar empleado', test: testUpdateEmpleado },
    { name: 'Cambiar rol', test: testCambiarRol },
    { name: 'Cambiar prioridad', test: testCambiarPrioridad },
    { name: 'Resetear prioridades', test: testResetearPrioridades },
    { name: 'Eliminar empleado', test: testDeleteEmpleado },
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    log(`\n${colors.bold}${name}:${colors.reset}`);
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Error inesperado en ${name}: ${(error as any).message}`);
      failed++;
    }
  }

  log('\n' + '='.repeat(50));
  log(`📊 Resumen de pruebas:`, colors.bold);
  log(`✅ Exitosas: ${passed}`, colors.green);
  log(`❌ Fallidas: ${failed}`, colors.red);
  log(`📈 Total: ${passed + failed}`, colors.blue);
  log('='.repeat(50));

  if (failed === 0) {
    log(
      '\n🎉 ¡Todas las pruebas pasaron exitosamente!',
      colors.green + colors.bold,
    );
  } else {
    log(
      '\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.',
      colors.yellow + colors.bold,
    );
  }
}

// Ejecutar las pruebas
runTests().catch((error) => {
  logError('Error ejecutando pruebas: ' + error.message);
  process.exit(1);
});
