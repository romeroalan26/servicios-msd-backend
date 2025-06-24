import dotenv from 'dotenv';
dotenv.config();

import pool from './database';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  try {
    // Leer el archivo SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el esquema
    await pool.query(schema);

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Base de datos lista');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default initDatabase;
