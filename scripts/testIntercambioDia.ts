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

async function getMiSeleccion(anno: number) {
  const response = await axios.get(`${BASE_URL}/selecciones/mi-seleccion`, {
    headers: { Authorization: `Bearer ${authToken}` },
    params: { anno },
  });
  return response.data.data;
}

async function getDiasServicio(servicio_id: number) {
  // Buscar días del servicio (usando el endpoint de servicios/{id})
  const response = await axios.get(`${BASE_URL}/servicios/${servicio_id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data.data.dias;
}

async function intercambiarDia(
  liberar_dia_id: number,
  tomar_dia_id: number,
  anno: number,
) {
  const response = await axios.patch(
    `${BASE_URL}/selecciones/intercambiar-dia`,
    {
      liberar_dia_id,
      tomar_dia_id,
      anno,
    },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    },
  );
  return response.data;
}

async function main() {
  try {
    await login('juan.perez@serviciosmsd.com', 'empleado123');
    const anno = 2024;
    const seleccion = await getMiSeleccion(anno);
    console.log('✅ Selección actual:', seleccion);

    const dias = await getDiasServicio(seleccion.servicio_id);
    if (dias.length < 2) {
      console.error('No hay suficientes días para probar el intercambio.');
      return;
    }

    // Tomar el primer día para liberar y el segundo para tomar
    const liberar_dia_id = dias[0].id;
    const tomar_dia_id = dias[1].id;
    console.log(
      `Intentando intercambiar: liberar día ${liberar_dia_id}, tomar día ${tomar_dia_id}`,
    );

    const resultado = await intercambiarDia(liberar_dia_id, tomar_dia_id, anno);
    console.log('✅ Intercambio realizado:', resultado);
  } catch (error: any) {
    console.error(
      '❌ Error en la prueba de intercambio:',
      error.response?.data || error.message,
    );
  }
}

main();
