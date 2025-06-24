import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/config/database';

async function verifyData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');

    // Verificar turnos
    console.log('📋 Verificando turnos:');
    const turnos = await pool.query('SELECT * FROM turnos ORDER BY id');
    console.log(`   - ${turnos.rows.length} turnos encontrados`);
    turnos.rows.forEach((turno: any) => {
      console.log(`     ${turno.id}. ${turno.codigo} - ${turno.nombre}`);
    });

    console.log('\n👥 Verificando empleados:');
    const empleados = await pool.query('SELECT * FROM empleados ORDER BY id');
    console.log(`   - ${empleados.rows.length} empleados encontrados`);
    console.log(
      `   - ${empleados.rows.filter((e: any) => e.rol === 'admin').length} administradores`,
    );
    console.log(
      `   - ${empleados.rows.filter((e: any) => e.rol === 'empleado').length} empleados`,
    );

    console.log('\n📊 Verificando tablas:');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`   - ${tables.rows.length} tablas encontradas:`);
    tables.rows.forEach((row: any) => {
      console.log(`     - ${row.table_name}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
    await pool.end();
  }
}

verifyData();
