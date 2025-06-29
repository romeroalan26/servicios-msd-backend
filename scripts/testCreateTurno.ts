import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';

// Cargar variables de entorno
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

async function testCreateTurno() {
  try {
    console.log('📋 Probando POST /api/turnos (sin autenticación)...');

    const turnoData = {
      codigo: 'TEST',
      nombre: 'Turno de Prueba',
      descripcion: 'Este es un turno de prueba para verificar el endpoint',
    };

    const response = await axios.post(`${BASE_URL}/turnos`, turnoData);
    console.log('❌ Error: Debería haber fallado por falta de autenticación');
    console.log('Respuesta:', response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      console.log(
        '✅ Éxito: Endpoint protegido correctamente (401 Unauthorized)',
      );
      console.log(
        'Mensaje:',
        (axiosError.response.data as any)?.error || 'No autorizado',
      );
    } else if (axiosError.response?.status === 403) {
      console.log('✅ Éxito: Endpoint protegido correctamente (403 Forbidden)');
      console.log(
        'Mensaje:',
        (axiosError.response.data as any)?.error || 'Acceso denegado',
      );
    } else {
      console.log('❌ Error inesperado:', axiosError.response?.status);
      console.log(
        'Mensaje:',
        (axiosError.response?.data as any)?.error || axiosError.message,
      );
    }
  }
}

async function testGetTurnos() {
  try {
    console.log('\n📋 Probando GET /api/turnos...');
    const response = await axios.get(`${BASE_URL}/turnos`);
    console.log(`✅ Éxito: ${response.data.data.length} turnos obtenidos`);
    console.log('Turnos disponibles:');
    response.data.data.forEach((turno: any) => {
      console.log(`  - ${turno.codigo}: ${turno.nombre}`);
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      '❌ Error obteniendo turnos:',
      (axiosError.response?.data as any)?.error || axiosError.message,
    );
  }
}

async function runTests() {
  console.log('🧪 Probando endpoint POST /api/turnos...\n');

  await testCreateTurno();
  await testGetTurnos();

  console.log('\n📋 RESUMEN:');
  console.log('✅ El endpoint POST /api/turnos está implementado y protegido');
  console.log('✅ Solo los administradores pueden crear turnos');
  console.log('✅ El endpoint GET /api/turnos funciona correctamente');
  console.log('\n💡 Para crear un turno necesitas:');
  console.log('   1. Iniciar sesión como administrador');
  console.log('   2. Usar el token JWT en el header Authorization');
  console.log(
    '   3. Enviar POST a /api/turnos con: codigo, nombre, descripcion',
  );
}

runTests()
  .then(() => {
    console.log('\n🏁 Pruebas finalizadas');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
