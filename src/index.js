import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { codeRoutes } from './routes/code.js';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка безопасности
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // Лимит запросов с одного IP
});

// Настройка CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://lovable.dev',
        'https://tihzvdrwejnzeiaectey.supabase.co'
      ]
    : [
        'http://localhost:8080',
        'http://localhost:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:3000'
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 часа кэширование preflight запросов
};

// Middleware
app.use(helmet()); // Защита заголовков
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(limiter);

// Роуты
app.use('/api/code', codeRoutes);

// Обработка ошибок
app.use(errorHandler);

// Запуск сервера
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});