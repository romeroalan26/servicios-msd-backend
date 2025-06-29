import pool from '../src/config/database';
import { AuditService } from '../src/services/auditService';

/**
 * Script para resetear el año:
 * 1. Limpia todas las selecciones del año anterior
 * 2. Recalcula las prioridades de los empleados
 * 3. Registra la acción en el log de auditoría
 */
async function resetAnno(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando reseteo anual...');

    // Iniciar transacción
    await client.query('BEGIN');

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // 1. Obtener todas las selecciones del año anterior
    const seleccionesResult = await client.query(
      'SELECT * FROM selecciones WHERE anno = $1',
      [previousYear],
    );

    console.log(
      `📋 Encontradas ${seleccionesResult.rows.length} selecciones del año ${previousYear}`,
    );

    // 2. Eliminar todas las selecciones del año anterior
    const deleteResult = await client.query(
      'DELETE FROM selecciones WHERE anno = $1',
      [previousYear],
    );

    console.log(
      `🗑️  Eliminadas ${deleteResult.rowCount} selecciones del año ${previousYear}`,
    );

    // 3. Obtener todos los empleados activos ordenados por prioridad actual
    const empleadosResult = await client.query(
      "SELECT id, nombre, prioridad FROM empleados WHERE activo = true AND rol = 'empleado' ORDER BY prioridad ASC",
    );

    console.log(
      `👥 Procesando ${empleadosResult.rows.length} empleados activos`,
    );

    // 4. Recalcular prioridades (rotación: 21 - prioridad actual)
    const updatePromises = empleadosResult.rows.map(async (empleado) => {
      const nuevaPrioridad = 21 - empleado.prioridad;

      await client.query(
        'UPDATE empleados SET prioridad = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [nuevaPrioridad, empleado.id],
      );

      console.log(
        `🔄 ${empleado.nombre}: prioridad ${empleado.prioridad} → ${nuevaPrioridad}`,
      );

      // Registrar en auditoría
      await AuditService.logUpdate(
        'empleados',
        empleado.id,
        { prioridad: empleado.prioridad },
        { prioridad: nuevaPrioridad },
        1, // Usuario sistema
      );
    });

    await Promise.all(updatePromises);

    // 5. Registrar el reseteo anual en auditoría
    await AuditService.log({
      tabla: 'sistema',
      accion: 'UPDATE',
      datos_nuevos: {
        tipo: 'reseteo_anual',
        anno_anterior: previousYear,
        anno_nuevo: currentYear,
        selecciones_eliminadas: deleteResult.rowCount,
        empleados_procesados: empleadosResult.rows.length,
        timestamp: new Date().toISOString(),
      },
      usuario_id: 1, // Usuario sistema
    });

    // Confirmar transacción
    await client.query('COMMIT');

    console.log('✅ Reseteo anual completado exitosamente');
    console.log(`📊 Resumen:`);
    console.log(`   - Selecciones eliminadas: ${deleteResult.rowCount}`);
    console.log(`   - Empleados procesados: ${empleadosResult.rows.length}`);
    console.log(`   - Año anterior: ${previousYear}`);
    console.log(`   - Año nuevo: ${currentYear}`);
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error('❌ Error durante el reseteo anual:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Función para ejecutar el reseteo anual con manejo de errores
 */
async function executeResetAnno(): Promise<void> {
  try {
    await resetAnno();
    console.log('🎉 Proceso de reseteo anual finalizado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error fatal durante el reseteo anual:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  executeResetAnno();
}

export { resetAnno, executeResetAnno };
