import express, { Request, Response } from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

// Инициализация Express
const app = express();
const PORT = process.env.PORT || 3000;

// Подключение CORS для работы с фронтендом
app.use(
  cors({
    origin: '*', // Замените '*' на URL вашего фронтенда, если необходимо
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Обработка JSON-запросов
app.use(express.json());

// Инициализация OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Получение ключа API из переменной окружения
});
const openai = new OpenAIApi(configuration);

// Маршрут для генерации кода
app.post('/api/code/generate', async (req: Request, res: Response) => {
  const { prompt, model = 'text-davinci-003' } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: 'Необходимо указать prompt для генерации кода',
    });
  }

  try {
    const response = await openai.createCompletion({
      model,
      prompt,
      max_tokens: 150,
    });

    const generatedCode = response.data.choices[0]?.text || '';

    res.json({
      result: generatedCode,
      model,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Ошибка при запросе к OpenAI API:', error.message);
    res.status(500).json({
      error: 'Ошибка при генерации кода',
      details: error.message,
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
