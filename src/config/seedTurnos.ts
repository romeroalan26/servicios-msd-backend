import dotenv from 'dotenv';
dotenv.config();

import pool from './database';

const turnosBasicos = [
  {
    codigo: 'CA',
    nombre: 'Cabina',
    descripcion: 'Posición en cabina de control',
  },
  {
    codigo: 'OF',
    nombre: 'Oficina',
    descripcion: 'Posición en oficina administrativa',
  },
  {
    codigo: 'GU',
    nombre: 'Guardia',
    descripcion: 'Posición de guardia de seguridad',
  },
  {
    codigo: 'MA',
    nombre: 'Mantenimiento',
    descripcion: 'Posición de mantenimiento técnico',
  },
  {
    codigo: 'OP',
    nombre: 'Operador',
    descripcion: 'Posición de operador de equipos',
  },
  {
    codigo: 'SU',
    nombre: 'Supervisor',
    descripcion: 'Posición de supervisión',
  },
  {
    codigo: 'AU',
    nombre: 'Auxiliar',
    descripcion: 'Posición de auxiliar general',
  },
  {
    codigo: 'TE',
    nombre: 'Técnico',
    descripcion: 'Posición técnica especializada',
  },
];

async function seedTurnos() {
  try {
    console.log('🌱 Insertando códigos de turno básicos...');

    for (const turno of turnosBasicos) {
      await pool.query(
        'INSERT INTO turnos (codigo, nombre, descripcion) VALUES ($1, $2, $3) ON CONFLICT (codigo) DO NOTHING',
        [turno.codigo, turno.nombre, turno.descripcion],
      );
    }

    console.log('✅ Códigos de turno insertados correctamente');
  } catch (error) {
    console.error('❌ Error al insertar códigos de turno:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedTurnos()
    .then(() => {
      console.log('Códigos de turno listos');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default seedTurnos;
