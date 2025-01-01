const { Configuration, OpenAIApi } = require('openai');

// Инициализация OpenAI с использованием переменной окружения
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Получение ключа API из переменной окружения
});

const openai = new OpenAIApi(configuration);

// Пример запроса к OpenAI API
(async () => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Напиши пример кода на JavaScript",
      max_tokens: 100,
    });
    console.log(response.data.choices[0].text);
  } catch (error) {
    console.error("Ошибка при запросе к OpenAI API:", error.message);
  }
})();
