import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

async function login(email: string, password: string) {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email,
    password,
  });
  authToken = response.data.data.token;
  return authToken;
}

async function liberarSeleccion(empleado_id: number, anno: number) {
  const response = await axios.post(
    `${BASE_URL}/selecciones/liberar`,
    {
      empleado_id,
      anno,
    },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    },
  );
  return response.data;
}

async function getEstadoSelecciones(anno: number) {
  const response = await axios.get(`${BASE_URL}/selecciones/estado`, {
    headers: { Authorization: `Bearer ${authToken}` },
    params: { anno },
  });
  return response.data.data;
}

async function main() {
  try {
    // Login como admin
    await login('admin@serviciosmsd.com', 'admin123');
    const anno = 2024;

    // Verificar estado antes de liberar
    console.log('📊 Estado antes de liberar:');
    const estadoAntes = await getEstadoSelecciones(anno);
    console.log(
      `   - Total selecciones: ${estadoAntes.estadisticas.total_selecciones}`,
    );
    console.log(
      `   - Próximo empleado: ${estadoAntes.proximo_empleado?.nombre || 'Ninguno'}`,
    );

    // Liberar selección del empleado ID 2 (Juan Pérez)
    console.log('\n🔓 Liberando selección del empleado ID 2...');
    const resultado = await liberarSeleccion(2, anno);
    console.log('✅ Resultado:', resultado);

    // Verificar estado después de liberar
    console.log('\n📊 Estado después de liberar:');
    const estadoDespues = await getEstadoSelecciones(anno);
    console.log(
      `   - Total selecciones: ${estadoDespues.estadisticas.total_selecciones}`,
    );
    console.log(
      `   - Próximo empleado: ${estadoDespues.proximo_empleado?.nombre || 'Ninguno'}`,
    );
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

main();
