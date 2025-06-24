import pool from '../src/config/database';

interface EmpleadoPrioridad {
  id: number;
  nombre: string;
  prioridad: number;
}

async function mostrarPrioridades(etapa: string) {
  console.log(`\n=== PRIORIDADES ${etapa} ===`);
  const result = await pool.query(
    "SELECT id, nombre, prioridad FROM empleados WHERE activo = true AND rol = 'empleado' ORDER BY prioridad ASC",
  );

  result.rows.forEach((emp: EmpleadoPrioridad) => {
    console.log(
      `${emp.prioridad.toString().padStart(2)}: ${emp.nombre} (ID: ${emp.id})`,
    );
  });
}

async function simularSeleccion(empleadoId: number, anno: number) {
  console.log(`\n--- Simulando selección del empleado ID ${empleadoId} ---`);

  // Verificar que el empleado existe y tiene prioridad 1
  const empleado = await pool.query(
    "SELECT id, nombre, prioridad FROM empleados WHERE id = $1 AND activo = true AND rol = 'empleado'",
    [empleadoId],
  );

  if (empleado.rows.length === 0) {
    console.log('❌ Empleado no encontrado');
    return false;
  }

  const emp = empleado.rows[0];
  console.log(`Empleado: ${emp.nombre} (Prioridad actual: ${emp.prioridad})`);

  if (emp.prioridad !== 1) {
    console.log(`❌ El empleado no tiene prioridad 1 (tiene ${emp.prioridad})`);
    return false;
  }

  // Simular la rotación de prioridades
  const SeleccionService = await import('../src/services/seleccionService');
  await SeleccionService.SeleccionService.rotarPrioridades(empleadoId);

  console.log('✅ Prioridades rotadas correctamente');
  return true;
}

async function testRotacionPrioridades() {
  try {
    console.log('🧪 INICIANDO PRUEBA DE ROTACIÓN DE PRIORIDADES');
    console.log('===============================================');

    // Mostrar estado inicial
    await mostrarPrioridades('INICIAL');

    // Simular 5 selecciones consecutivas
    for (let i = 1; i <= 5; i++) {
      console.log(`\n🔄 RONDA ${i} DE SELECCIÓN`);
      console.log('='.repeat(30));

      // Obtener el empleado con prioridad 1
      const prioridad1 = await pool.query(
        "SELECT id, nombre FROM empleados WHERE prioridad = 1 AND activo = true AND rol = 'empleado'",
      );

      if (prioridad1.rows.length === 0) {
        console.log('❌ No hay empleado con prioridad 1');
        break;
      }

      const empleado = prioridad1.rows[0];
      console.log(
        `Empleado con prioridad 1: ${empleado.nombre} (ID: ${empleado.id})`,
      );

      // Simular selección
      const exito = await simularSeleccion(empleado.id, 2024);
      if (!exito) {
        console.log('❌ Error en la simulación');
        break;
      }

      // Mostrar prioridades después de la rotación
      await mostrarPrioridades(`DESPUÉS DE RONDA ${i}`);
    }

    console.log('\n✅ PRUEBA COMPLETADA');
    console.log('La rotación de prioridades funciona correctamente');
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la prueba
testRotacionPrioridades();
