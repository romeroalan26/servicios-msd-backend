"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAnno = resetAnno;
exports.executeResetAnno = executeResetAnno;
const database_1 = __importDefault(require("../src/config/database"));
const auditService_1 = require("../src/services/auditService");
async function resetAnno() {
    const client = await database_1.default.connect();
    try {
        console.log('🔄 Iniciando reseteo anual...');
        await client.query('BEGIN');
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const seleccionesResult = await client.query('SELECT * FROM selecciones WHERE anno = $1', [previousYear]);
        console.log(`📋 Encontradas ${seleccionesResult.rows.length} selecciones del año ${previousYear}`);
        const deleteResult = await client.query('DELETE FROM selecciones WHERE anno = $1', [previousYear]);
        console.log(`🗑️  Eliminadas ${deleteResult.rowCount} selecciones del año ${previousYear}`);
        const empleadosResult = await client.query("SELECT id, nombre, prioridad FROM empleados WHERE activo = true AND rol = 'empleado' ORDER BY prioridad ASC");
        console.log(`👥 Procesando ${empleadosResult.rows.length} empleados activos`);
        const updatePromises = empleadosResult.rows.map(async (empleado) => {
            const nuevaPrioridad = 21 - empleado.prioridad;
            await client.query('UPDATE empleados SET prioridad = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [nuevaPrioridad, empleado.id]);
            console.log(`🔄 ${empleado.nombre}: prioridad ${empleado.prioridad} → ${nuevaPrioridad}`);
            await auditService_1.AuditService.logUpdate('empleados', empleado.id, { prioridad: empleado.prioridad }, { prioridad: nuevaPrioridad }, 1);
        });
        await Promise.all(updatePromises);
        await auditService_1.AuditService.log({
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
            usuario_id: 1,
        });
        await client.query('COMMIT');
        console.log('✅ Reseteo anual completado exitosamente');
        console.log(`📊 Resumen:`);
        console.log(`   - Selecciones eliminadas: ${deleteResult.rowCount}`);
        console.log(`   - Empleados procesados: ${empleadosResult.rows.length}`);
        console.log(`   - Año anterior: ${previousYear}`);
        console.log(`   - Año nuevo: ${currentYear}`);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante el reseteo anual:', error);
        throw error;
    }
    finally {
        client.release();
    }
}
async function executeResetAnno() {
    try {
        await resetAnno();
        console.log('🎉 Proceso de reseteo anual finalizado correctamente');
        process.exit(0);
    }
    catch (error) {
        console.error('💥 Error fatal durante el reseteo anual:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    executeResetAnno();
}
//# sourceMappingURL=resetAnno.js.map