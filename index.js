const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config(); // Подключение .env для локальной разработки

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Переменная окружения для OpenAI API ключа
});

const openai = new OpenAIApi(configuration);

// Middleware для обработки JSON-запросов
app.use(express.json());

// Маршрут для тестирования API
app.get('/', (req, res) => {
  res.send('Сервер работает!');
});

// Маршрут для генерации кода с помощью OpenAI
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Необходимо предоставить prompt' });
  }

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 100,
    });

    res.json({ code: response.data.choices[0].text });
  } catch (error) {
    console.error('Ошибка при работе с OpenAI API:', error.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
