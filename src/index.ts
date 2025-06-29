import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from './swagger/swaggerOptions';
import authRoutes from './routes/authRoutes';
import empleadoRoutes from './routes/empleadoRoutes';
import servicioRoutes from './routes/servicioRoutes';
import seleccionRoutes from './routes/seleccionRoutes';
import adminRoutes from './routes/adminRoutes';
import turnoRoutes from './routes/turnoRoutes';
import { NotificationService } from './services/notificationService';
import logger from './logger';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Logging HTTP requests con morgan + winston
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }),
);

// Inicializar servicios
NotificationService.initialize();

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Endpoint para obtener el JSON de Swagger (debe ir antes del middleware de Swagger UI)
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Verifica el estado de la API y retorna información básica del sistema
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                   description: Estado de la API
 *       500:
 *         description: Error interno del servidor
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de empleados
app.use('/api/empleados', empleadoRoutes);

// Rutas de servicios
app.use('/api/servicios', servicioRoutes);

// Rutas de selecciones
app.use('/api/selecciones', seleccionRoutes);

// Rutas de turnos
app.use('/api/turnos', turnoRoutes);

// Rutas de administración
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor escuchando en puerto ${PORT}`);
});
