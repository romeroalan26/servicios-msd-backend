import dotenv from 'dotenv';
dotenv.config();

import pool from '../src/config/database';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Turno {
  id: number;
  codigo: string;
  nombre: string;
}

interface DiaServicio {
  servicio_id: number;
  fecha: string;
  tanda: string;
  turno_id: number;
}

// Servicios predefinidos con nombres variados
const serviciosPredefinidos = [
  {
    nombre: 'Servicio de Guardia Nocturna',
    descripcion: 'Guardia de seguridad en turno nocturno',
  },
  {
    nombre: 'Servicio de Operaciones Diurnas',
    descripcion: 'Operaciones técnicas durante el día',
  },
  {
    nombre: 'Servicio de Mantenimiento Técnico',
    descripcion: 'Mantenimiento preventivo y correctivo',
  },
  {
    nombre: 'Servicio de Supervisión General',
    descripcion: 'Supervisión de operaciones y personal',
  },
  {
    nombre: 'Servicio de Control de Acceso',
    descripcion: 'Control de entrada y salida de personal',
  },
  {
    nombre: 'Servicio de Monitoreo de Sistemas',
    descripcion: 'Monitoreo de sistemas críticos',
  },
  {
    nombre: 'Servicio de Logística',
    descripcion: 'Gestión de materiales y suministros',
  },
  {
    nombre: 'Servicio de Comunicaciones',
    descripcion: 'Gestión de comunicaciones internas',
  },
  {
    nombre: 'Servicio de Emergencias',
    descripcion: 'Respuesta a emergencias y contingencias',
  },
  {
    nombre: 'Servicio de Calidad',
    descripcion: 'Control de calidad y auditorías',
  },
  {
    nombre: 'Servicio de Capacitación',
    descripcion: 'Capacitación y desarrollo de personal',
  },
  {
    nombre: 'Servicio de Inventarios',
    descripcion: 'Control y gestión de inventarios',
  },
  {
    nombre: 'Servicio de Seguridad Industrial',
    descripcion: 'Seguridad y prevención de riesgos',
  },
  {
    nombre: 'Servicio de Limpieza y Aseo',
    descripcion: 'Limpieza y mantenimiento de áreas',
  },
  {
    nombre: 'Servicio de Transporte',
    descripcion: 'Gestión de transporte y movilidad',
  },
  {
    nombre: 'Servicio de Almacén',
    descripcion: 'Gestión de almacén y distribución',
  },
  {
    nombre: 'Servicio de Informática',
    descripcion: 'Soporte técnico y sistemas informáticos',
  },
  {
    nombre: 'Servicio de Administración',
    descripcion: 'Tareas administrativas y contables',
  },
  {
    nombre: 'Servicio de Atención al Cliente',
    descripcion: 'Atención y servicio al cliente',
  },
  {
    nombre: 'Servicio de Investigación',
    descripcion: 'Investigación y desarrollo de proyectos',
  },
];

// Patrones de trabajo variados (4 días sí, 2 días no)
const patronesTrabajo = [
  // Patrón 1: Lunes a Jueves
  [
    1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1,
    2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0,
  ],
  // Patrón 2: Martes a Viernes
  [
    0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0,
    1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0,
  ],
  // Patrón 3: Miércoles a Sábado
  [
    0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0,
    0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4, 0, 0, 1, 2, 3, 4,
  ],
  // Patrón 4: Jueves a Domingo
  [
    0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 1,
    2, 3, 4, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 1, 2, 3, 4,
  ],
  // Patrón 5: Viernes a Lunes
  [
    0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 1, 2, 3, 4, 0,
    0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0,
  ],
  // Patrón 6: Sábado a Martes
  [
    0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 1, 2,
    3, 4, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 1,
  ],
  // Patrón 7: Domingo a Miércoles
  [
    0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0,
    0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0,
  ],
  // Patrón 8: Lunes, Martes, Jueves, Viernes
  [
    1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0, 1,
    2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0,
  ],
  // Patrón 9: Martes, Miércoles, Viernes, Sábado
  [
    0, 1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0,
    1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4, 0, 1, 2, 0, 3, 4,
  ],
  // Patrón 10: Miércoles, Jueves, Sábado, Domingo
  [
    0, 0, 1, 2, 0, 3, 4, 0, 0, 1, 2, 0, 3, 4, 0, 0, 1, 2, 0, 3, 4, 0, 0, 1, 2,
    0, 3, 4, 0, 0, 1, 2, 0, 3, 4, 0, 0, 1, 2, 0, 3, 4,
  ],
];

// Distribución de tandas por día (mañana, tarde, noche)
const tandasPorDia = ['mañana', 'tarde', 'noche'];

// Distribución de turnos por tanda
const turnosPorTanda = {
  mañana: ['CA', 'OF', 'OP', 'SU', 'AU'],
  tarde: ['GU', 'MA', 'TE', 'CA', 'OF'],
  noche: ['GU', 'OP', 'SU', 'AU', 'TE'],
};

async function obtenerTurnos(): Promise<Turno[]> {
  const result = await pool.query(
    'SELECT id, codigo, nombre FROM turnos ORDER BY id',
  );
  return result.rows;
}

async function crearServicios(): Promise<Servicio[]> {
  const servicios: Servicio[] = [];

  for (const servicioData of serviciosPredefinidos) {
    // Primero verificar si el servicio ya existe
    const existingResult = await pool.query(
      'SELECT id, nombre, descripcion FROM servicios WHERE nombre = $1',
      [servicioData.nombre],
    );

    if (existingResult.rows.length > 0) {
      // Actualizar descripción si es necesario
      await pool.query(
        'UPDATE servicios SET descripcion = $1, updated_at = NOW() WHERE nombre = $2',
        [servicioData.descripcion, servicioData.nombre],
      );
      servicios.push(existingResult.rows[0]);
    } else {
      // Crear nuevo servicio
      const result = await pool.query(
        'INSERT INTO servicios (nombre, descripcion, activo, created_at, updated_at) VALUES ($1, $2, true, NOW(), NOW()) RETURNING id, nombre, descripcion',
        [servicioData.nombre, servicioData.descripcion],
      );
      servicios.push(result.rows[0]);
    }
  }

  return servicios;
}

function generarDiasDelAno(anio: number): string[] {
  const dias: string[] = [];
  const fechaInicio = new Date(anio, 0, 1); // 1 de enero
  const fechaFin = new Date(anio, 11, 31); // 31 de diciembre

  for (
    let fecha = new Date(fechaInicio);
    fecha <= fechaFin;
    fecha.setDate(fecha.getDate() + 1)
  ) {
    dias.push(fecha.toISOString().split('T')[0]);
  }

  return dias;
}

function obtenerPatronTrabajo(servicioId: number): number[] {
  // Usar el patrón correspondiente al servicio (ciclo entre los patrones)
  const patronIndex = (servicioId - 1) % patronesTrabajo.length;
  return patronesTrabajo[patronIndex];
}

function obtenerTurnoParaTanda(
  tanda: string,
  diaIndex: number,
  servicioId: number,
): string {
  const turnosDisponibles =
    turnosPorTanda[tanda as keyof typeof turnosPorTanda];
  // Usar una combinación de día y servicio para variar los turnos
  const turnoIndex = (diaIndex + servicioId) % turnosDisponibles.length;
  return turnosDisponibles[turnoIndex];
}

async function crearDiasServicio(
  servicios: Servicio[],
  turnos: Turno[],
  anio: number,
): Promise<void> {
  const diasDelAno = generarDiasDelAno(anio);
  const turnosMap = new Map(turnos.map((t) => [t.codigo, t]));

  console.log(
    `📅 Generando ${diasDelAno.length} días para ${servicios.length} servicios...`,
  );

  for (const servicio of servicios) {
    const patron = obtenerPatronTrabajo(servicio.id);
    const diasServicio: DiaServicio[] = [];

    diasDelAno.forEach((fecha, diaIndex) => {
      // Determinar si este día corresponde trabajar según el patrón
      const semanaIndex = Math.floor(diaIndex / 7);
      const diaSemana = diaIndex % 7;
      const patronIndex = semanaIndex * 7 + diaSemana;
      const debeTrabajar = patron[patronIndex % patron.length] === 1;

      if (debeTrabajar) {
        // Crear las 3 tandas para este día
        tandasPorDia.forEach((tanda) => {
          const turnoCodigo = obtenerTurnoParaTanda(
            tanda,
            diaIndex,
            servicio.id,
          );
          const turno = turnosMap.get(turnoCodigo);

          if (turno) {
            diasServicio.push({
              servicio_id: servicio.id,
              fecha,
              tanda,
              turno_id: turno.id,
            });
          }
        });
      }
    });

    // Insertar días en lotes para mejor rendimiento
    if (diasServicio.length > 0) {
      const values = diasServicio
        .map((_, index) => {
          const baseIndex = index * 4;
          return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, NOW(), NOW())`;
        })
        .join(', ');

      const params = diasServicio.flatMap((dia) => [
        dia.servicio_id,
        dia.fecha,
        dia.tanda,
        dia.turno_id,
      ]);

      await pool.query(
        `INSERT INTO servicio_dias (servicio_id, fecha, tanda, turno_id, created_at, updated_at) 
         VALUES ${values} 
         ON CONFLICT (servicio_id, fecha, tanda) DO NOTHING`,
        params,
      );

      console.log(
        `✅ Servicio "${servicio.nombre}": ${diasServicio.length} días creados`,
      );
    }
  }
}

async function limpiarDatosExistentes(): Promise<void> {
  console.log('🧹 Limpiando datos existentes...');

  // Eliminar en orden para respetar las foreign keys
  await pool.query('DELETE FROM servicio_dias');
  await pool.query("DELETE FROM servicios WHERE nombre LIKE 'Servicio de %'");

  console.log('✅ Datos limpiados');
}

async function mostrarEstadisticas(anio: number): Promise<void> {
  console.log('\n📊 Estadísticas de la generación:');

  // Total de servicios
  const serviciosResult = await pool.query(
    'SELECT COUNT(*) as total FROM servicios WHERE activo = true',
  );
  console.log(`   - Servicios activos: ${serviciosResult.rows[0].total}`);

  // Total de días de servicio
  const diasResult = await pool.query(
    'SELECT COUNT(*) as total FROM servicio_dias',
  );
  console.log(`   - Días de servicio totales: ${diasResult.rows[0].total}`);

  // Días por servicio
  const diasPorServicioResult = await pool.query(`
    SELECT s.nombre, COUNT(sd.id) as dias
    FROM servicios s
    LEFT JOIN servicio_dias sd ON s.id = sd.servicio_id
    WHERE s.activo = true
    GROUP BY s.id, s.nombre
    ORDER BY s.nombre
  `);

  console.log('\n   Días por servicio:');
  diasPorServicioResult.rows.forEach((row) => {
    console.log(`     - ${row.nombre}: ${row.dias} días`);
  });

  // Distribución por tandas
  const tandasResult = await pool.query(`
    SELECT tanda, COUNT(*) as total
    FROM servicio_dias
    GROUP BY tanda
    ORDER BY tanda
  `);

  console.log('\n   Distribución por tandas:');
  tandasResult.rows.forEach((row) => {
    console.log(`     - ${row.tanda}: ${row.total} días`);
  });

  // Distribución por turnos
  const turnosResult = await pool.query(`
    SELECT t.codigo, t.nombre, COUNT(sd.id) as total
    FROM turnos t
    LEFT JOIN servicio_dias sd ON t.id = sd.turno_id
    GROUP BY t.id, t.codigo, t.nombre
    ORDER BY total DESC
  `);

  console.log('\n   Distribución por turnos:');
  turnosResult.rows.forEach((row) => {
    console.log(`     - ${row.codigo} (${row.nombre}): ${row.total} días`);
  });
}

async function generateYearlyServices(
  anio: number = 2024,
  limpiar: boolean = false,
): Promise<void> {
  try {
    console.log(`🚀 Generando servicios para el año ${anio}...\n`);

    if (limpiar) {
      await limpiarDatosExistentes();
    }

    // Obtener turnos existentes
    const turnos = await obtenerTurnos();
    if (turnos.length === 0) {
      throw new Error(
        'No se encontraron turnos. Ejecuta primero el script de seed de turnos.',
      );
    }

    console.log(`📋 Turnos disponibles: ${turnos.length}`);

    // Crear servicios
    const servicios = await crearServicios();
    console.log(`✅ ${servicios.length} servicios creados/actualizados`);

    // Crear días de servicio
    await crearDiasServicio(servicios, turnos, anio);

    // Mostrar estadísticas
    await mostrarEstadisticas(anio);

    console.log(`\n🎉 Generación completada para el año ${anio}!`);
    console.log('👥 Los empleados ahora pueden elegir su servicio preferido.');
  } catch (error) {
    console.error('❌ Error durante la generación:', error);
    throw error;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const anio = parseInt(args[0]) || 2024;
  const limpiar = args.includes('--limpiar') || args.includes('-l');

  try {
    await generateYearlyServices(anio, limpiar);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

export default generateYearlyServices;
