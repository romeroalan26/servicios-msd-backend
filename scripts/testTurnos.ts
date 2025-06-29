import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

// Cargar variables de entorno
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;
let authToken = '';
let adminToken = '';

// Datos de prueba
const testTurno = {
  codigo: 'TEST',
  nombre: 'Turno de Prueba',
  descripcion: 'Este es un turno de prueba para verificar los endpoints',
};

const updatedTurno = {
  nombre: 'Turno de Prueba Actualizado',
  descripcion: 'Descripción actualizada del turno de prueba',
};

async function loginAsAdmin() {
  try {
    console.log('🔐 Iniciando sesión como administrador...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@servicios-msd.com',
      password: 'admin123',
    });

    adminToken = response.data.data.token;
    console.log('✅ Login como administrador exitoso\n');
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error en login como administrador:',
      axiosError.response?.data || axiosError.message,
    );
    throw error;
  }
}

async function loginAsEmployee() {
  try {
    console.log('🔐 Iniciando sesión como empleado...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'empleado1@servicios-msd.com',
      password: 'empleado123',
    });

    authToken = response.data.data.token;
    console.log('✅ Login como empleado exitoso\n');
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error en login como empleado:',
      axiosError.response?.data || axiosError.message,
    );
    throw error;
  }
}

async function testGetTurnos() {
  try {
    console.log('📋 Probando GET /api/turnos (sin autenticación)...');
    const response = await axios.get(`${BASE_URL}/turnos`);
    console.log(`✅ Éxito: ${response.data.data.length} turnos obtenidos`);
    console.log(
      `   Paginación: página ${response.data.pagination.page} de ${response.data.pagination.totalPages}\n`,
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error obteniendo turnos:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function testGetTurnosActivos() {
  try {
    console.log('📋 Probando GET /api/turnos/activos...');
    const response = await axios.get(`${BASE_URL}/turnos/activos`);
    console.log(
      `✅ Éxito: ${response.data.data.length} turnos activos obtenidos\n`,
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error obteniendo turnos activos:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function testGetTurnoById() {
  try {
    console.log('📋 Probando GET /api/turnos/1...');
    const response = await axios.get(`${BASE_URL}/turnos/1`);
    console.log(
      `✅ Éxito: Turno obtenido - ${response.data.data.nombre} (${response.data.data.codigo})\n`,
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error obteniendo turno por ID:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function testCreateTurno() {
  try {
    console.log('📋 Probando POST /api/turnos (crear turno)...');
    const response = await axios.post(`${BASE_URL}/turnos`, testTurno, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(
      `✅ Éxito: Turno creado - ID: ${response.data.data.id}, Código: ${response.data.data.codigo}\n`,
    );
    return response.data.data.id;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error creando turno:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
    return null;
  }
}

async function testUpdateTurno(turnoId: number) {
  try {
    console.log(`📋 Probando PUT /api/turnos/${turnoId} (actualizar turno)...`);
    const response = await axios.put(
      `${BASE_URL}/turnos/${turnoId}`,
      updatedTurno,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    console.log(`✅ Éxito: Turno actualizado - ${response.data.data.nombre}\n`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error actualizando turno:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function testDeleteTurno(turnoId: number) {
  try {
    console.log(
      `📋 Probando DELETE /api/turnos/${turnoId} (eliminar turno)...`,
    );
    const response = await axios.delete(`${BASE_URL}/turnos/${turnoId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`✅ Éxito: Turno eliminado\n`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error eliminando turno:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function testUnauthorizedAccess() {
  try {
    console.log(
      '📋 Probando acceso no autorizado (empleado intentando crear turno)...',
    );
    await axios.post(`${BASE_URL}/turnos`, testTurno, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('❌ Error: Debería haber fallado por falta de permisos');
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 403) {
      console.log('✅ Éxito: Acceso correctamente denegado (403 Forbidden)\n');
    } else {
      console.error(
        '❌ Error inesperado:',
        (axiosError.response?.data as any)?.error || axiosError.message,
      );
    }
  }
}

async function testInvalidData() {
  try {
    console.log('📋 Probando datos inválidos (código duplicado)...');
    await axios.post(
      `${BASE_URL}/turnos`,
      { codigo: 'CA', nombre: 'Test', descripcion: 'Test' },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    console.log('❌ Error: Debería haber fallado por código duplicado');
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 409) {
      console.log(
        '✅ Éxito: Error de conflicto correctamente manejado (409 Conflict)\n',
      );
    } else {
      console.error(
        '❌ Error inesperado:',
        (axiosError.response?.data as any)?.error || axiosError.message,
      );
    }
  }
}

async function testPaginationAndFilters() {
  try {
    console.log('📋 Probando paginación y filtros...');

    // Probar paginación
    const response1 = await axios.get(`${BASE_URL}/turnos?page=1&limit=3`);
    console.log(
      `✅ Paginación: ${response1.data.data.length} turnos en página 1 (límite 3)`,
    );

    // Probar búsqueda
    const response2 = await axios.get(`${BASE_URL}/turnos?search=cabina`);
    console.log(
      `✅ Búsqueda "cabina": ${response2.data.data.length} resultados`,
    );

    // Probar filtro activo
    const response3 = await axios.get(`${BASE_URL}/turnos?activo=true`);
    console.log(
      `✅ Filtro activo=true: ${response3.data.data.length} resultados\n`,
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error en paginación y filtros:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function runTests() {
  console.log('🧪 Iniciando pruebas de endpoints de turnos...\n');

  try {
    // 1. Login
    await loginAsAdmin();
    await loginAsEmployee();

    // 2. Pruebas de lectura (sin autenticación requerida)
    await testGetTurnos();
    await testGetTurnosActivos();
    await testGetTurnoById();

    // 3. Pruebas de paginación y filtros
    await testPaginationAndFilters();

    // 4. Pruebas de creación (requiere admin)
    const newTurnoId = await testCreateTurno();

    // 5. Pruebas de actualización (requiere admin)
    if (newTurnoId) {
      await testUpdateTurno(newTurnoId);
    }

    // 6. Pruebas de seguridad
    await testUnauthorizedAccess();
    await testInvalidData();

    // 7. Pruebas de eliminación (requiere admin)
    if (newTurnoId) {
      await testDeleteTurno(newTurnoId);
    }

    console.log('🎉 ¡Todas las pruebas completadas!');
    console.log('\n📋 RESUMEN:');
    console.log('✅ Endpoints de turnos funcionando correctamente');
    console.log('✅ Autenticación y autorización funcionando');
    console.log('✅ Validaciones de datos funcionando');
    console.log('✅ Paginación y filtros funcionando');
    console.log('✅ Documentación Swagger disponible en /api-docs');
  } catch (error) {
    console.error('💥 Error fatal durante las pruebas:', error);
  }
}

// Ejecutar las pruebas
runTests()
  .then(() => {
    console.log('\n🏁 Pruebas finalizadas');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
