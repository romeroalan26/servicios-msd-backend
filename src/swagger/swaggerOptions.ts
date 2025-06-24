export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Servicios MSD Backend API',
      version: '1.0.0',
      description: `
        API para la gestión de servicios y selección de turnos para 20 empleados y 1 administrador.
        
        ## Características
        - 🔐 Autenticación JWT
        - 🏥 Gestión de servicios y turnos
        - 📄 Paginación escalable
        - 🔄 Sistema de prioridades
        - 📊 Auditoría y trazabilidad
        
        ## Estructura de Respuesta
        Todas las respuestas siguen un formato estándar:
        \`\`\`json
        {
          "success": true,
          "data": { ... },
          "message": "Mensaje descriptivo",
          "timestamp": "2024-01-15T10:30:00.000Z"
        }
        \`\`\`
        
        ## Paginación
        Los endpoints que retornan listas incluyen información de paginación:
        \`\`\`json
        {
          "pagination": {
            "page": 1,
            "limit": 10,
            "totalElements": 25,
            "totalPages": 3,
            "hasNext": true,
            "hasPrevious": false
          }
        }
        \`\`\`
      `,
      contact: {
        name: 'Desarrollador',
        email: 'alan2@serviciosmsd.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.serviciosmsd.com/api',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /auth/login',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa',
            },
            data: {
              description: 'Datos de la respuesta',
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo',
            },
            error: {
              type: 'string',
              description: 'Descripción del error (solo en caso de error)',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp de la respuesta',
            },
          },
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Número de página actual',
            },
            limit: {
              type: 'integer',
              description: 'Elementos por página',
            },
            totalElements: {
              type: 'integer',
              description: 'Total de elementos disponibles',
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas',
            },
            hasNext: {
              type: 'boolean',
              description: 'Indica si hay página siguiente',
            },
            hasPrevious: {
              type: 'boolean',
              description: 'Indica si hay página anterior',
            },
          },
        },
        Empleado: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del empleado',
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del empleado',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del empleado',
            },
            rol: {
              type: 'string',
              enum: ['admin', 'empleado'],
              description: 'Rol del empleado',
            },
            prioridad: {
              type: 'integer',
              nullable: true,
              description: 'Prioridad para rotación de servicios (1-20)',
            },
            activo: {
              type: 'boolean',
              description: 'Indica si el empleado está activo',
            },
          },
        },
        Servicio: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del servicio',
            },
            nombre: {
              type: 'string',
              description: 'Nombre del servicio',
            },
            descripcion: {
              type: 'string',
              description: 'Descripción detallada del servicio',
            },
            activo: {
              type: 'boolean',
              description: 'Indica si el servicio está activo',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        ServicioDia: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del día de servicio',
            },
            servicio_id: {
              type: 'integer',
              description: 'ID del servicio',
            },
            fecha: {
              type: 'string',
              format: 'date',
              description: 'Fecha del día de servicio',
            },
            tanda: {
              type: 'string',
              enum: ['mañana', 'tarde', 'noche'],
              description: 'Tanda del día',
            },
            turno_id: {
              type: 'integer',
              description: 'ID del turno asignado',
            },
            turno_codigo: {
              type: 'string',
              description: 'Código del turno',
            },
            turno_nombre: {
              type: 'string',
              description: 'Nombre del turno',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        Seleccion: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la selección',
            },
            empleado_id: {
              type: 'integer',
              description: 'ID del empleado que realizó la selección',
            },
            servicio_id: {
              type: 'integer',
              description: 'ID del servicio seleccionado',
            },
            anno: {
              type: 'integer',
              description: 'Año para el cual se realizó la selección',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la selección',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para autenticación y gestión de usuarios',
      },
      {
        name: 'Servicios',
        description: 'Endpoints para gestión de servicios y días de servicio',
      },
      {
        name: 'Sistema',
        description: 'Endpoints del sistema y health checks',
      },
    ],
  },
  apis: ['./src/**/*.ts'],
};
