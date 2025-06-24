import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

async function login(email: string, password: string) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });

    authToken = response.data.data.token;
    console.log(`✅ Login exitoso para ${email}`);
    return authToken;
  } catch (error: any) {
    console.error(
      `❌ Error en login para ${email}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function testSelecciones() {
  console.log('\n🧪 Probando Endpoints de Selecciones\n');

  // Test 1: Obtener estado inicial
  console.log('1️⃣ Obteniendo estado inicial de selecciones:');
  try {
    const response = await axios.get(`${BASE_URL}/selecciones/estado`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { anno: 2024 },
    });
    console.log('✅ Estado obtenido exitosamente');
    console.log(
      `   - Próximo empleado: ${response.data.data.proximo_empleado?.nombre || 'Ninguno'}`,
    );
    console.log(
      `   - Total selecciones: ${response.data.data.estadisticas.total_selecciones}`,
    );
  } catch (error: any) {
    console.error(
      '❌ Error obteniendo estado:',
      error.response?.data || error.message,
    );
  }

  // Test 2: Obtener servicios disponibles
  console.log('\n2️⃣ Obteniendo servicios disponibles:');
  try {
    const response = await axios.get(`${BASE_URL}/selecciones/disponibles`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { anno: 2024 },
    });
    console.log('✅ Servicios disponibles obtenidos exitosamente');
    console.log(`   - Servicios disponibles: ${response.data.data.length}`);
    if (response.data.data.length > 0) {
      console.log(`   - Primer servicio: ${response.data.data[0].nombre}`);
    }
  } catch (error: any) {
    console.error(
      '❌ Error obteniendo servicios disponibles:',
      error.response?.data || error.message,
    );
  }

  // Test 3: Intentar seleccionar un servicio
  console.log('\n3️⃣ Intentando seleccionar un servicio:');
  try {
    const response = await axios.post(
      `${BASE_URL}/selecciones`,
      {
        servicio_id: 1,
        anno: 2024,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    console.log('✅ Servicio seleccionado exitosamente');
    console.log(`   - Selección ID: ${response.data.data.id}`);
    console.log(`   - Servicio ID: ${response.data.data.servicio_id}`);
  } catch (error: any) {
    console.error(
      '❌ Error seleccionando servicio:',
      error.response?.data || error.message,
    );
  }

  // Test 4: Obtener mi selección
  console.log('\n4️⃣ Obteniendo mi selección actual:');
  try {
    const response = await axios.get(`${BASE_URL}/selecciones/mi-seleccion`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { anno: 2024 },
    });
    console.log('✅ Mi selección obtenida exitosamente');
    console.log(
      `   - Servicio seleccionado: ${response.data.data.servicio_id}`,
    );
  } catch (error: any) {
    console.error(
      '❌ Error obteniendo mi selección:',
      error.response?.data || error.message,
    );
  }

  // Test 5: Verificar estado después de la selección
  console.log('\n5️⃣ Verificando estado después de la selección:');
  try {
    const response = await axios.get(`${BASE_URL}/selecciones/estado`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { anno: 2024 },
    });
    console.log('✅ Estado actualizado obtenido exitosamente');
    console.log(
      `   - Próximo empleado: ${response.data.data.proximo_empleado?.nombre || 'Ninguno'}`,
    );
    console.log(
      `   - Total selecciones: ${response.data.data.estadisticas.total_selecciones}`,
    );
  } catch (error: any) {
    console.error(
      '❌ Error obteniendo estado actualizado:',
      error.response?.data || error.message,
    );
  }

  console.log('\n🎉 Pruebas de Selecciones completadas');
}

async function main() {
  try {
    // Login con el primer empleado (prioridad 1)
    await login('juan.perez@serviciosmsd.com', 'empleado123');
    await testSelecciones();
  } catch (error: any) {
    console.error('❌ Error en las pruebas:', error.message);
    process.exit(1);
  }
}

main();
