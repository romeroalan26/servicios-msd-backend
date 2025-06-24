import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:3000/api';

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    empleado: {
      id: number;
      nombre: string;
      email: string;
      rol: string;
      prioridad: number | null;
    };
  };
}

interface ServiciosResponse {
  success: boolean;
  data: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    dias: Array<{
      id: number;
      fecha: string;
      tanda: string;
      turno_codigo: string;
      turno_nombre: string;
    }>;
  }>;
}

interface ServicioResponse {
  success: boolean;
  data: {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    dias: Array<{
      id: number;
      fecha: string;
      tanda: string;
      turno_codigo: string;
      turno_nombre: string;
    }>;
  };
}

interface CreateServicioResponse {
  success: boolean;
  data: {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface DiaServicioResponse {
  success: boolean;
  data: {
    id: number;
    servicio_id: number;
    fecha: string;
    tanda: string;
    turno_id: number;
    created_at: string;
    updated_at: string;
  };
}

async function testServiciosHTTP() {
  try {
    console.log('🌐 Probando endpoints HTTP de servicios...\n');

    // 1. Login para obtener token
    console.log('1️⃣ Obteniendo token de autenticación...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@serviciosmsd.com',
        password: 'admin123',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const loginData = (await loginResponse.json()) as LoginResponse;
    const token = loginData.data.token;
    console.log('   ✅ Token obtenido exitosamente');

    // 2. Probar GET /api/servicios
    console.log('\n2️⃣ Probando GET /api/servicios...');
    const serviciosResponse = await fetch(`${BASE_URL}/servicios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!serviciosResponse.ok) {
      throw new Error(`GET /servicios falló: ${serviciosResponse.status}`);
    }

    const serviciosData = (await serviciosResponse.json()) as ServiciosResponse;
    console.log(`   ✅ ${serviciosData.data.length} servicios obtenidos`);

    if (serviciosData.data.length > 0) {
      console.log(`   - Primer servicio: ${serviciosData.data[0].nombre}`);
    }

    // 3. Probar GET /api/servicios/:id
    if (serviciosData.data.length > 0) {
      console.log('\n3️⃣ Probando GET /api/servicios/1...');
      const servicioResponse = await fetch(`${BASE_URL}/servicios/1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!servicioResponse.ok) {
        throw new Error(`GET /servicios/1 falló: ${servicioResponse.status}`);
      }

      const servicioData = (await servicioResponse.json()) as ServicioResponse;
      console.log(`   ✅ Servicio obtenido: ${servicioData.data.nombre}`);
      console.log(`   - Días: ${servicioData.data.dias.length}`);
    }

    // 4. Probar POST /api/servicios (crear servicio)
    console.log('\n4️⃣ Probando POST /api/servicios...');
    const createResponse = await fetch(`${BASE_URL}/servicios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: 'Servicio HTTP Test',
        descripcion: 'Servicio creado vía HTTP',
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`POST /servicios falló: ${createResponse.status}`);
    }

    const createData = (await createResponse.json()) as CreateServicioResponse;
    console.log(
      `   ✅ Servicio creado: ${createData.data.nombre} (ID: ${createData.data.id})`,
    );

    // 5. Probar POST /api/servicios/:id/dias
    console.log('\n5️⃣ Probando POST /api/servicios/1/dias...');
    const diaResponse = await fetch(`${BASE_URL}/servicios/1/dias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fecha: '2024-01-25',
        tanda: 'tarde',
        turno_id: 2,
      }),
    });

    if (!diaResponse.ok) {
      throw new Error(`POST /servicios/1/dias falló: ${diaResponse.status}`);
    }

    const diaData = (await diaResponse.json()) as DiaServicioResponse;
    console.log(
      `   ✅ Día agregado: ${diaData.data.fecha} ${diaData.data.tanda}`,
    );

    console.log('\n🎉 ¡Todas las pruebas HTTP completadas exitosamente!');
  } catch (error) {
    console.error('❌ Error en las pruebas HTTP:', error);
  }
}

testServiciosHTTP();
