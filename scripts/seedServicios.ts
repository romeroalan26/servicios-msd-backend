import pool from '../src/config/database';

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
    descripcion: 'Servicio de mantenimiento preventivo y correctivo de equipos',
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
  // Servicio 1 - Guardia Nocturna
  {
    servicio_id: 1,
    fecha: '2024-01-15',
    tanda: 'noche',
    turno_id: 1, // GUA-NOC
  },
  {
    servicio_id: 1,
    fecha: '2024-01-16',
    tanda: 'noche',
    turno_id: 1,
  },
  {
    servicio_id: 1,
    fecha: '2024-01-17',
    tanda: 'noche',
    turno_id: 1,
  },
  // Servicio 2 - Emergencias
  {
    servicio_id: 2,
    fecha: '2024-01-15',
    tanda: 'mañana',
    turno_id: 2, // EME-MAN
  },
  {
    servicio_id: 2,
    fecha: '2024-01-15',
    tanda: 'tarde',
    turno_id: 3, // EME-TAR
  },
  {
    servicio_id: 2,
    fecha: '2024-01-15',
    tanda: 'noche',
    turno_id: 4, // EME-NOC
  },
  // Servicio 3 - Mantenimiento
  {
    servicio_id: 3,
    fecha: '2024-01-16',
    tanda: 'mañana',
    turno_id: 5, // MAN-MAN
  },
  {
    servicio_id: 3,
    fecha: '2024-01-16',
    tanda: 'tarde',
    turno_id: 6, // MAN-TAR
  },
  // Servicio 4 - Limpieza
  {
    servicio_id: 4,
    fecha: '2024-01-17',
    tanda: 'mañana',
    turno_id: 7, // LIM-MAN
  },
  {
    servicio_id: 4,
    fecha: '2024-01-17',
    tanda: 'tarde',
    turno_id: 8, // LIM-TAR
  },
  // Servicio 5 - Administración
  {
    servicio_id: 5,
    fecha: '2024-01-18',
    tanda: 'mañana',
    turno_id: 5, // MAN-MAN (reutilizamos turno de mantenimiento)
  },
  {
    servicio_id: 5,
    fecha: '2024-01-18',
    tanda: 'tarde',
    turno_id: 6, // MAN-TAR
  },
];

async function seedServicios() {
  try {
    console.log('🌱 Iniciando inserción de servicios...');

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

    console.log('\n📅 Insertando días de servicio...');

    // Insertar días de servicio
    for (const dia of diasServicio) {
      const result = await pool.query(
        'INSERT INTO servicio_dias (servicio_id, fecha, tanda, turno_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, servicio_id, fecha, tanda',
        [dia.servicio_id, dia.fecha, dia.tanda, dia.turno_id],
      );
      console.log(
        `✅ Día agregado: Servicio ${result.rows[0].servicio_id} - ${result.rows[0].fecha} ${result.rows[0].tanda}`,
      );
    }

    console.log('\n🎉 ¡Datos de servicios insertados exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${servicios.length} servicios creados`);
    console.log(`   - ${diasServicio.length} días de servicio agregados`);
  } catch (error) {
    console.error('❌ Error al insertar servicios:', error);
  } finally {
    await pool.end();
  }
}

seedServicios();
