import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/config/database';

async function testConnection() {
  try {
    console.log('🔍 Verificando variables de entorno:');
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log(
      'DB_PASSWORD:',
      process.env.DB_PASSWORD ? '***' : 'NO DEFINIDA',
    );

    console.log('\n🔌 Probando conexión a la base de datos...');

    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexión exitosa!');
    console.log('Hora del servidor:', result.rows[0].current_time);

    await pool.end();
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    await pool.end();
  }
}

testConnection();
