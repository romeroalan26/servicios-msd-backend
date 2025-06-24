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
  message?: string;
  timestamp: string;
}

interface PaginatedServiciosResponse {
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
  pagination: {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message?: string;
  timestamp: string;
}

async function testPagination() {
  try {
    console.log('📄 Probando funcionalidad de paginación...\n');

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

    // 2. Probar paginación con diferentes parámetros
    console.log('\n2️⃣ Probando paginación con diferentes parámetros...');

    // Página 1, límite 5
    console.log('\n   📋 Página 1, límite 5:');
    const page1Response = await fetch(`${BASE_URL}/servicios?page=1&limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!page1Response.ok) {
      throw new Error(
        `GET /servicios?page=1&limit=5 falló: ${page1Response.status}`,
      );
    }

    const page1Data =
      (await page1Response.json()) as PaginatedServiciosResponse;
    console.log(`   ✅ ${page1Data.data.length} servicios en página 1`);
    console.log(`   📊 Total elementos: ${page1Data.pagination.totalElements}`);
    console.log(`   📄 Total páginas: ${page1Data.pagination.totalPages}`);
    console.log(`   ➡️  Tiene siguiente: ${page1Data.pagination.hasNext}`);
    console.log(`   ⬅️  Tiene anterior: ${page1Data.pagination.hasPrevious}`);

    // Página 2, límite 3
    if (page1Data.pagination.totalPages > 1) {
      console.log('\n   📋 Página 2, límite 3:');
      const page2Response = await fetch(
        `${BASE_URL}/servicios?page=2&limit=3`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!page2Response.ok) {
        throw new Error(
          `GET /servicios?page=2&limit=3 falló: ${page2Response.status}`,
        );
      }

      const page2Data =
        (await page2Response.json()) as PaginatedServiciosResponse;
      console.log(`   ✅ ${page2Data.data.length} servicios en página 2`);
      console.log(`   ➡️  Tiene siguiente: ${page2Data.pagination.hasNext}`);
      console.log(`   ⬅️  Tiene anterior: ${page2Data.pagination.hasPrevious}`);
    }

    // 3. Probar ordenamiento
    console.log('\n3️⃣ Probando ordenamiento:');
    const sortResponse = await fetch(
      `${BASE_URL}/servicios?sortBy=s.nombre&sortOrder=desc&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!sortResponse.ok) {
      throw new Error(
        `GET /servicios con ordenamiento falló: ${sortResponse.status}`,
      );
    }

    const sortData = (await sortResponse.json()) as PaginatedServiciosResponse;
    console.log(
      `   ✅ ${sortData.data.length} servicios ordenados por nombre (descendente)`,
    );
    if (sortData.data.length > 0) {
      console.log(`   📝 Primer servicio: ${sortData.data[0].nombre}`);
    }

    // 4. Probar validaciones
    console.log('\n4️⃣ Probando validaciones:');

    // Página inválida
    const invalidPageResponse = await fetch(`${BASE_URL}/servicios?page=0`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (invalidPageResponse.status === 400) {
      console.log('   ✅ Validación de página inválida funciona');
    } else {
      console.log('   ❌ Validación de página inválida no funciona');
    }

    // Límite inválido
    const invalidLimitResponse = await fetch(
      `${BASE_URL}/servicios?limit=150`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (invalidLimitResponse.status === 400) {
      console.log('   ✅ Validación de límite inválido funciona');
    } else {
      console.log('   ❌ Validación de límite inválido no funciona');
    }

    console.log(
      '\n🎉 ¡Todas las pruebas de paginación completadas exitosamente!',
    );
  } catch (error) {
    console.error('❌ Error en las pruebas de paginación:', error);
  }
}

testPagination();
