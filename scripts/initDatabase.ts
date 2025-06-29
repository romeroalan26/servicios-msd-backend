import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/config/database';
import initDatabase from '../src/config/initDb';
import { seedEmpleados } from '../src/config/seedEmpleados';
import seedTurnos from '../src/config/seedTurnos';

async function initDatabaseComplete() {
  try {
    console.log('🚀 Iniciando configuración completa de la base de datos...\n');

    // 1. Crear tablas
    console.log('📋 Creando tablas...');
    await initDatabase();
    console.log('✅ Tablas creadas exitosamente\n');

    // 2. Insertar turnos
    console.log('🔄 Insertando turnos...');
    await seedTurnos();
    console.log('✅ Turnos insertados exitosamente\n');

    // 3. Insertar empleados
    console.log('👥 Insertando empleados...');
    await seedEmpleados();
    console.log('✅ Empleados insertados exitosamente\n');

    // 4. Insertar servicios
    console.log('🛠️ Insertando servicios...');
    await seedServicios();
    console.log('✅ Servicios insertados exitosamente\n');

    console.log('🎉 ¡Base de datos inicializada completamente!');
    console.log('\n📊 Resumen de datos insertados:');
    console.log(
      '   - Tablas: empleados, servicios, turnos, selecciones, excepciones',
    );
    console.log('   - Turnos: 8 códigos de turno básicos');
    console.log('   - Empleados: 20 empleados + 1 admin');
    console.log('   - Servicios: 5 servicios con días asignados');
    console.log('\n🔗 Endpoints disponibles:');
    console.log('   - API: http://localhost:3000/api');
    console.log('   - Documentación: http://localhost:3000/api-docs');
    console.log('\n🔐 Credenciales de prueba:');
    console.log('   - Admin: admin@serviciosmsd.com / admin123');
    console.log('   - Empleado: juan.perez@serviciosmsd.com / empleado123');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Función para insertar servicios (extraída del archivo seedServicios.ts)
async function seedServicios() {
  const servicios = [
    {
      nombre: 'Servicio de Guardia Nocturna',
      descripcion:
        'Servicio de guardia en turno de noche para vigilancia y seguridad',
    },
    {
      nombre: 'Servicio de Emergencias',
      descripcion:
        'Servicio de atención de emergencias médicas en turno de 24 horas',
    },
    {
      nombre: 'Servicio de Mantenimiento',
      descripcion:
        'Servicio de mantenimiento preventivo y correctivo de equipos',
    },
    {
      nombre: 'Servicio de Limpieza',
      descripcion: 'Servicio de limpieza y aseo de instalaciones',
    },
    {
      nombre: 'Servicio de Administración',
      descripcion: 'Servicio administrativo y de gestión documental',
    },
  ];

  const diasServicio = [
    { servicio_id: 1, fecha: '2024-01-15', tanda: 'noche', turno_id: 1 },
    { servicio_id: 1, fecha: '2024-01-16', tanda: 'noche', turno_id: 1 },
    { servicio_id: 1, fecha: '2024-01-17', tanda: 'noche', turno_id: 1 },
    { servicio_id: 2, fecha: '2024-01-15', tanda: 'mañana', turno_id: 2 },
    { servicio_id: 2, fecha: '2024-01-15', tanda: 'tarde', turno_id: 3 },
    { servicio_id: 2, fecha: '2024-01-15', tanda: 'noche', turno_id: 4 },
    { servicio_id: 3, fecha: '2024-01-16', tanda: 'mañana', turno_id: 5 },
    { servicio_id: 3, fecha: '2024-01-16', tanda: 'tarde', turno_id: 6 },
    { servicio_id: 4, fecha: '2024-01-17', tanda: 'mañana', turno_id: 7 },
    { servicio_id: 4, fecha: '2024-01-17', tanda: 'tarde', turno_id: 8 },
    { servicio_id: 5, fecha: '2024-01-18', tanda: 'mañana', turno_id: 5 },
    { servicio_id: 5, fecha: '2024-01-18', tanda: 'tarde', turno_id: 6 },
  ];

  try {
    // Insertar servicios
    for (const servicio of servicios) {
      const result = await pool.query(
        'INSERT INTO servicios (nombre, descripcion, activo, created_at, updated_at) VALUES ($1, $2, true, NOW(), NOW()) RETURNING id, nombre',
        [servicio.nombre, servicio.descripcion],
      );
      console.log(
        `✅ Servicio creado: ${result.rows[0].nombre} (ID: ${result.rows[0].id})`,
      );
    }

    // Insertar días de servicio
    for (const dia of diasServicio) {
      await pool.query(
        'INSERT INTO servicio_dias (servicio_id, fecha, tanda, turno_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
        [dia.servicio_id, dia.fecha, dia.tanda, dia.turno_id],
      );
    }
  } catch (error) {
    console.error('❌ Error al insertar servicios:', error);
    throw error;
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  initDatabaseComplete();
}

export { initDatabaseComplete };
