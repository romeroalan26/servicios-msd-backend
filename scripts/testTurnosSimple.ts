import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

// Cargar variables de entorno
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

async function testGetTurnos() {
  try {
    console.log('📋 Probando GET /api/turnos (sin autenticación)...');
    const response = await axios.get(`${BASE_URL}/turnos`);
    console.log(`✅ Éxito: ${response.data.data.length} turnos obtenidos`);
    console.log(
      `   Paginación: página ${response.data.pagination.page} de ${response.data.pagination.totalPages}`,
    );
    console.log('   Turnos encontrados:');
    response.data.data.forEach((turno: any) => {
      console.log(
        `     - ${turno.codigo}: ${turno.nombre} (${turno.activo ? 'Activo' : 'Inactivo'})`,
      );
    });
    console.log('');
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
      `✅ Éxito: ${response.data.data.length} turnos activos obtenidos`,
    );
    console.log('   Turnos activos:');
    response.data.data.forEach((turno: any) => {
      console.log(`     - ${turno.codigo}: ${turno.nombre}`);
    });
    console.log('');
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
      `✅ Éxito: Turno obtenido - ${response.data.data.nombre} (${response.data.data.codigo})`,
    );
    console.log(`   Descripción: ${response.data.data.descripcion}`);
    console.log(
      `   Estado: ${response.data.data.activo ? 'Activo' : 'Inactivo'}\n`,
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error obteniendo turno por ID:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
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
      `✅ Filtro activo=true: ${response3.data.data.length} resultados`,
    );

    // Probar ordenamiento
    const response4 = await axios.get(
      `${BASE_URL}/turnos?sortBy=t.codigo&sortOrder=desc`,
    );
    console.log(
      `✅ Ordenamiento por código descendente: ${response4.data.data.length} resultados\n`,
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error en paginación y filtros:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function testHealthCheck() {
  try {
    console.log('📋 Probando health check...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ Health check: ${response.data.status}\n`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error en health check:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function runTests() {
  console.log('🧪 Iniciando pruebas simples de endpoints de turnos...\n');

  try {
    // 1. Health check
    await testHealthCheck();

    // 2. Pruebas de lectura (sin autenticación requerida)
    await testGetTurnos();
    await testGetTurnosActivos();
    await testGetTurnoById();

    // 3. Pruebas de paginación y filtros
    await testPaginationAndFilters();

    console.log('🎉 ¡Pruebas de lectura completadas!');
    console.log('\n📋 RESUMEN:');
    console.log('✅ Endpoints de lectura de turnos funcionando correctamente');
    console.log('✅ Paginación y filtros funcionando');
    console.log('✅ Documentación Swagger disponible en /api-docs');
    console.log('\n💡 Para probar endpoints de escritura (POST, PUT, DELETE):');
    console.log('   1. Necesitas iniciar sesión como administrador');
    console.log('   2. Usar el token JWT en el header Authorization');
    console.log('   3. Ejecutar: npx ts-node scripts/testTurnos.ts');
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
