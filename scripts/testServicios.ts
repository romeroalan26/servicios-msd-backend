import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/config/database';
import { ServicioService } from '../src/services/servicioService';

async function testServicios() {
  try {
    console.log('🧪 Probando endpoints de servicios...\n');

    // Probar obtener servicios sin empleado
    console.log('1️⃣ Probando getServiciosConDias sin empleado:');
    const serviciosSinEmpleado = await ServicioService.getServiciosConDias();
    console.log(`   - ${serviciosSinEmpleado.length} servicios encontrados`);

    if (serviciosSinEmpleado.length > 0) {
      console.log('   - Primer servicio:', serviciosSinEmpleado[0].nombre);
      console.log(
        `   - Días del primer servicio: ${serviciosSinEmpleado[0].dias.length}`,
      );
    }

    // Probar obtener servicios con empleado (ID 1)
    console.log('\n2️⃣ Probando getServiciosConDias con empleado ID 1:');
    const serviciosConEmpleado = await ServicioService.getServiciosConDias(1);
    console.log(`   - ${serviciosConEmpleado.length} servicios encontrados`);

    // Probar obtener servicio específico
    if (serviciosSinEmpleado.length > 0) {
      console.log('\n3️⃣ Probando getServicioConDias con ID 1:');
      const servicioEspecifico = await ServicioService.getServicioConDias(1);
      if (servicioEspecifico) {
        console.log(`   - Servicio encontrado: ${servicioEspecifico.nombre}`);
        console.log(`   - Días: ${servicioEspecifico.dias.length}`);
      } else {
        console.log('   - Servicio no encontrado');
      }
    }

    // Probar crear un servicio
    console.log('\n4️⃣ Probando createServicio:');
    const nuevoServicio = await ServicioService.createServicio({
      nombre: 'Servicio de Prueba',
      descripcion: 'Servicio creado para pruebas',
    });
    console.log(
      `   - Servicio creado: ${nuevoServicio.nombre} (ID: ${nuevoServicio.id})`,
    );

    // Probar agregar día al servicio
    console.log('\n5️⃣ Probando addDiaServicio:');
    const nuevoDia = await ServicioService.addDiaServicio({
      servicio_id: nuevoServicio.id,
      fecha: new Date('2024-01-20'),
      tanda: 'mañana',
      turno_id: 1,
    });
    console.log(`   - Día agregado: ${nuevoDia.fecha} ${nuevoDia.tanda}`);

    console.log('\n✅ Todas las pruebas completadas exitosamente!');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await pool.end();
  }
}

testServicios();
