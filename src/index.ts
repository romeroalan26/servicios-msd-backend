import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from './swagger/swaggerOptions';
import authRoutes from './routes/authRoutes';
import servicioRoutes from './routes/servicioRoutes';
import seleccionRoutes from './routes/seleccionRoutes';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

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

// Rutas de servicios
app.use('/api/servicios', servicioRoutes);

// Rutas de selecciones
app.use('/api/selecciones', seleccionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
