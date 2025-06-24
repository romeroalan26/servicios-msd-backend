import dotenv from 'dotenv';
dotenv.config();

import pool from './database';
import bcrypt from 'bcryptjs';

const empleados = [
  // Admin (sin prioridad)
  {
    nombre: 'Administrador Sistema',
    email: 'admin@serviciosmsd.com',
    password: 'admin123',
    rol: 'admin' as const,
    prioridad: null,
  },
  // Empleados con prioridades del 1 al 20
  {
    nombre: 'Juan Pérez',
    email: 'juan.perez@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 1,
  },
  {
    nombre: 'María García',
    email: 'maria.garcia@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 2,
  },
  {
    nombre: 'Carlos López',
    email: 'carlos.lopez@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 3,
  },
  {
    nombre: 'Ana Rodríguez',
    email: 'ana.rodriguez@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 4,
  },
  {
    nombre: 'Luis Martínez',
    email: 'luis.martinez@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 5,
  },
  {
    nombre: 'Carmen Sánchez',
    email: 'carmen.sanchez@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 6,
  },
  {
    nombre: 'Roberto Torres',
    email: 'roberto.torres@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 7,
  },
  {
    nombre: 'Isabel Morales',
    email: 'isabel.morales@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 8,
  },
  {
    nombre: 'Fernando Herrera',
    email: 'fernando.herrera@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 9,
  },
  {
    nombre: 'Patricia Jiménez',
    email: 'patricia.jimenez@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 10,
  },
  {
    nombre: 'Miguel Ruiz',
    email: 'miguel.ruiz@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 11,
  },
  {
    nombre: 'Sofia Vargas',
    email: 'sofia.vargas@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 12,
  },
  {
    nombre: 'Diego Castro',
    email: 'diego.castro@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 13,
  },
  {
    nombre: 'Valeria Silva',
    email: 'valeria.silva@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 14,
  },
  {
    nombre: 'Ricardo Mendoza',
    email: 'ricardo.mendoza@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 15,
  },
  {
    nombre: 'Gabriela Rojas',
    email: 'gabriela.rojas@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 16,
  },
  {
    nombre: 'Alejandro Flores',
    email: 'alejandro.flores@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 17,
  },
  {
    nombre: 'Daniela Ortiz',
    email: 'daniela.ortiz@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 18,
  },
  {
    nombre: 'Héctor Ramírez',
    email: 'hector.ramirez@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 19,
  },
  {
    nombre: 'Natalia Cruz',
    email: 'natalia.cruz@serviciosmsd.com',
    password: 'empleado123',
    rol: 'empleado' as const,
    prioridad: 20,
  },
];

async function seedEmpleados() {
  try {
    console.log('👥 Insertando empleados...');

    for (const empleado of empleados) {
      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(empleado.password, 10);

      // Insertar empleado
      await pool.query(
        `INSERT INTO empleados (nombre, email, password_hash, rol, prioridad) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (email) DO NOTHING`,
        [
          empleado.nombre,
          empleado.email,
          passwordHash,
          empleado.rol,
          empleado.prioridad,
        ],
      );
    }

    console.log('✅ Empleados insertados correctamente');

    // Mostrar resumen
    const result = await pool.query(`
      SELECT rol, COUNT(*) as cantidad 
      FROM empleados 
      GROUP BY rol 
      ORDER BY rol
    `);

    console.log('\n📊 Resumen de empleados:');
    result.rows.forEach((row) => {
      console.log(`  ${row.rol}: ${row.cantidad} empleados`);
    });

    // Mostrar empleados con prioridad
    const empleadosConPrioridad = await pool.query(`
      SELECT nombre, prioridad 
      FROM empleados 
      WHERE prioridad IS NOT NULL 
      ORDER BY prioridad
    `);

    console.log('\n🎯 Empleados con prioridad:');
    empleadosConPrioridad.rows.forEach((emp) => {
      console.log(`  ${emp.prioridad}. ${emp.nombre}`);
    });
  } catch (error) {
    console.error('❌ Error al insertar empleados:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedEmpleados()
    .then(() => {
      console.log('\n👥 Empleados listos');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default seedEmpleados;
