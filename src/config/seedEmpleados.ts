import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import pool from './database';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function seedEmpleados() {
  try {
    console.log('🌱 Iniciando seed de empleados...');

    // Verificar si ya existen empleados
    const existingEmpleados = await pool.query(
      'SELECT COUNT(*) as count FROM empleados',
    );

    if (parseInt(existingEmpleados.rows[0].count) > 0) {
      console.log('✅ Empleados ya existen, saltando seed...');
      return;
    }

    // Hash de la contraseña del admin
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash(
      DEFAULT_ADMIN_PASSWORD,
      saltRounds,
    );

    // Insertar admin por defecto
    await pool.query(
      `
      INSERT INTO empleados (nombre, email, password_hash, rol, prioridad, activo, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `,
      [
        'Administrador Sistema',
        'admin@serviciosmsd.com',
        adminPasswordHash,
        'admin',
        null, // Los admins no tienen prioridad
        true,
      ],
    );

    console.log('✅ Admin creado exitosamente');
    console.log(`📧 Email: admin@serviciosmsd.com`);
    console.log(`🔑 Contraseña: [CONFIGURADA EN .env O DEFAULT]`);

    // Crear 20 empleados de ejemplo
    const empleados = [];
    for (let i = 1; i <= 20; i++) {
      const passwordHash = await bcrypt.hash(`empleado${i}`, saltRounds);
      empleados.push({
        nombre: `Empleado ${i}`,
        email: `empleado${i}@serviciosmsd.com`,
        password_hash: passwordHash,
        rol: 'empleado',
        prioridad: i,
        activo: true,
      });
    }

    // Insertar empleados en lotes
    for (const empleado of empleados) {
      await pool.query(
        `
        INSERT INTO empleados (nombre, email, password_hash, rol, prioridad, activo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `,
        [
          empleado.nombre,
          empleado.email,
          empleado.password_hash,
          empleado.rol,
          empleado.prioridad,
          empleado.activo,
        ],
      );
    }

    console.log('✅ 20 empleados creados exitosamente');
    console.log('📋 Credenciales de empleados:');
    console.log(
      '   Ver documentación en SCRIPTS.md para credenciales de prueba',
    );

    console.log('🎉 Seed de empleados completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed de empleados:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedEmpleados()
    .then(() => {
      console.log('Seed completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
