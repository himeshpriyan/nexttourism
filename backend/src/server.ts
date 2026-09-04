import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, isMongoConnected } from './config/db.js';
import { contactRouter } from './routes/contactRoutes.js';
import { categoryRouter } from './routes/categoryRoutes.js';
import { ocrRouter } from './routes/ocrRoutes.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Middlewares
app.use(
  cors({
    origin: FRONTEND_URL ? [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000', 'https://nexttourism-phonenumberlist.vercel.app'] : '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// Health Check
app.get('/api/health', (_req, res) => {
  const mongoOnline = isMongoConnected();
  res.json({
    status: 'ok',
    database: mongoOnline ? 'MongoDB Atlas (Connected)' : 'Local File Database (backend/data/)',
    isMongoConnected: mongoOnline,
    service: 'ContactVault Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/contacts', contactRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/ocr', ocrRouter);

// Start Server after attempting DB connection
async function bootstrap() {
  await connectDB();

  const server = app.listen(PORT, '0.0.0.0', () => {
    const dbStatus = isMongoConnected() ? 'MongoDB Atlas Cloud' : 'Local File Storage';
    console.log(`\n======================================================`);
    console.log(`🚀 ContactVault Backend Server running!`);
    console.log(`📡 Server Port   : ${PORT}`);
    console.log(`💾 Database      : ${dbStatus}`);
    console.log(`🔗 Health Check  : http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
      console.error(`👉 Solution: Stop any existing running server on port ${PORT}, or set a different port in .env\n`);
    } else {
      console.error('Server error:', err);
    }
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrapping error:', err);
});
