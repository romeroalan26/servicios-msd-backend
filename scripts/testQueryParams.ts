import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@serviciosmsd.com',
      password: 'admin123',
    });

    authToken = response.data.data.token;
    console.log('✅ Login exitoso');
    return authToken;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function testQueryParams() {
  console.log('\n🧪 Probando Query Parameters en Endpoints de Servicios\n');

  // Test 1: Filtros básicos en GET /servicios
  console.log('1️⃣ Probando filtros básicos en GET /servicios:');
  try {
    const response = await axios.get(`${BASE_URL}/servicios`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        page: 1,
        limit: 5,
        search: 'guardia',
        activo: true,
        sortBy: 's.nombre',
        sortOrder: 'asc',
      },
    });
    console.log('✅ Filtros básicos funcionando');
    console.log(
      `   - Total elementos: ${response.data.pagination.totalElements}`,
    );
    console.log(`   - Elementos en página: ${response.data.data.length}`);
  } catch (error) {
    console.error(
      '❌ Error en filtros básicos:',
      error.response?.data || error.message,
    );
  }

  // Test 2: Filtros de fecha en GET /servicios
  console.log('\n2️⃣ Probando filtros de fecha en GET /servicios:');
  try {
    const response = await axios.get(`${BASE_URL}/servicios`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        fechaDesde: '2024-01-01',
        fechaHasta: '2024-12-31',
        tanda: 'noche',
        incluirDias: true,
        incluirExcepciones: false,
      },
    });
    console.log('✅ Filtros de fecha funcionando');
    console.log(`   - Servicios encontrados: ${response.data.data.length}`);
  } catch (error) {
    console.error(
      '❌ Error en filtros de fecha:',
      error.response?.data || error.message,
    );
  }

  // Test 3: Filtros en GET /servicios/{id}
  console.log('\n3️⃣ Probando filtros en GET /servicios/{id}:');
  try {
    const response = await axios.get(`${BASE_URL}/servicios/1`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        fechaDesde: '2024-01-01',
        fechaHasta: '2024-12-31',
        tanda: 'noche',
        incluirExcepciones: true,
        soloFuturos: false,
      },
    });
    console.log('✅ Filtros en servicio específico funcionando');
    console.log(`   - Días del servicio: ${response.data.data.dias.length}`);
  } catch (error) {
    console.error(
      '❌ Error en filtros de servicio específico:',
      error.response?.data || error.message,
    );
  }

  // Test 4: Validaciones de parámetros
  console.log('\n4️⃣ Probando validaciones de parámetros:');

  // Test fecha inválida
  try {
    await axios.get(`${BASE_URL}/servicios`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { fechaDesde: 'fecha-invalida' },
    });
    console.log('❌ Debería haber fallado con fecha inválida');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validación de fecha inválida funcionando');
    } else {
      console.error(
        '❌ Error inesperado en validación de fecha:',
        error.response?.data,
      );
    }
  }

  // Test rango de fechas inválido
  try {
    await axios.get(`${BASE_URL}/servicios`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        fechaDesde: '2024-12-31',
        fechaHasta: '2024-01-01',
      },
    });
    console.log('❌ Debería haber fallado con rango de fechas inválido');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validación de rango de fechas funcionando');
    } else {
      console.error(
        '❌ Error inesperado en validación de rango:',
        error.response?.data,
      );
    }
  }

  // Test tanda inválida
  try {
    await axios.get(`${BASE_URL}/servicios`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { tanda: 'tanda-invalida' },
    });
    console.log('❌ Debería haber fallado con tanda inválida');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validación de tanda funcionando');
    } else {
      console.error(
        '❌ Error inesperado en validación de tanda:',
        error.response?.data,
      );
    }
  }

  // Test 5: Parámetros booleanos
  console.log('\n5️⃣ Probando parámetros booleanos:');
  try {
    const response = await axios.get(`${BASE_URL}/servicios`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        incluirDias: false,
        incluirExcepciones: false,
      },
    });
    console.log('✅ Parámetros booleanos funcionando');
    console.log(`   - Servicios sin días: ${response.data.data.length}`);
  } catch (error) {
    console.error(
      '❌ Error en parámetros booleanos:',
      error.response?.data || error.message,
    );
  }

  // Test 6: Solo futuros
  console.log('\n6️⃣ Probando filtro soloFuturos:');
  try {
    const response = await axios.get(`${BASE_URL}/servicios/1`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { soloFuturos: true },
    });
    console.log('✅ Filtro soloFuturos funcionando');
    console.log(`   - Días futuros: ${response.data.data.dias.length}`);
  } catch (error) {
    console.error(
      '❌ Error en soloFuturos:',
      error.response?.data || error.message,
    );
  }

  console.log('\n🎉 Pruebas de Query Parameters completadas');
}

async function main() {
  try {
    await login();
    await testQueryParams();
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    process.exit(1);
  }
}

main();
