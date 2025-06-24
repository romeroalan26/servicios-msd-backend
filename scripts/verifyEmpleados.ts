import dotenv from 'dotenv';
dotenv.config();

import pool from './database';

async function verifyEmpleados() {
  try {
    console.log('🔍 Verificando empleados en la base de datos...\n');

    // Mostrar todos los empleados
    console.log('👥 Todos los empleados:');
    const empleados = await pool.query(`
      SELECT id, nombre, email, rol, prioridad, activo 
      FROM empleados 
      ORDER BY rol DESC, prioridad ASC NULLS LAST
    `);

    empleados.rows.forEach((emp) => {
      const prioridad = emp.prioridad
        ? `(Prioridad: ${emp.prioridad})`
        : '(Sin prioridad)';
      console.log(
        `  ${emp.id}. ${emp.nombre} - ${emp.email} - ${emp.rol} ${prioridad}`,
      );
    });

    console.log(`\n📊 Total de empleados: ${empleados.rows.length}`);

    // Verificar prioridades
    console.log('\n🎯 Verificación de prioridades:');
    const prioridades = await pool.query(`
      SELECT prioridad, COUNT(*) as cantidad
      FROM empleados 
      WHERE prioridad IS NOT NULL
      GROUP BY prioridad
      ORDER BY prioridad
    `);

    const prioridadesExistentes = prioridades.rows.map((p) => p.prioridad);
    console.log('Prioridades existentes:', prioridadesExistentes.join(', '));

    // Verificar si faltan prioridades
    const prioridadesEsperadas = Array.from({ length: 20 }, (_, i) => i + 1);
    const prioridadesFaltantes = prioridadesEsperadas.filter(
      (p) => !prioridadesExistentes.includes(p),
    );

    if (prioridadesFaltantes.length > 0) {
      console.log('❌ Prioridades faltantes:', prioridadesFaltantes.join(', '));
    } else {
      console.log('✅ Todas las prioridades del 1 al 20 están presentes');
    }

    // Verificar admin
    const admin = await pool.query(`
      SELECT id, nombre, email 
      FROM empleados 
      WHERE rol = 'admin'
    `);

    console.log('\n👨‍💼 Administrador:');
    if (admin.rows.length > 0) {
      console.log(`  ${admin.rows[0].nombre} - ${admin.rows[0].email}`);
    } else {
      console.log('  ❌ No hay administrador');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error al verificar empleados:', error);
    await pool.end();
  }
}

verifyEmpleados();
