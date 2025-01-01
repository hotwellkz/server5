import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { codeRoutes } from './routes/code.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка лимита запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP за 15 минут
  message: 'Слишком много запросов с этого IP, попробуйте снова позже.',
});

// Настройка CORS
const corsOptions = {
  origin: ['https://sweet-llama-e0019a.netlify.app'], // Разрешённый фронтенд
  methods: ['GET', 'POST', 'OPTIONS'], // Разрешённые методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешённые заголовки
  credentials: true, // Разрешить отправку куки и других креденшелов
  maxAge: 86400, // Кэширование preflight-запроса на 24 часа
  optionsSuccessStatus: 200, // Успешный статус для preflight-запросов
};

// Middleware для защиты и логирования
app.use(helmet()); // Защита HTTP-заголовков
app.use(cors(corsOptions)); // Подключение CORS
app.use(express.json()); // Парсинг JSON-запросов
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }, // Логирование запросов
  })
);
app.use(limiter); // Лимит запросов

// Подключение маршрутов
app.use('/api/code', codeRoutes); // Маршрут для генерации кода

// Middleware для обработки ошибок
app.use(errorHandler);

// Запуск сервера
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
