import express from 'express';
import { logger } from '../utils/logger.js';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export const codeRoutes = express.Router();

// Инициализация клиентов AI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

codeRoutes.post('/generate', async (req, res, next) => {
  try {
    const { prompt, model = 'openai' } = req.body;

    if (!prompt) {
      logger.error('Отсутствует prompt в запросе');
      return res.status(400).json({ 
        error: 'Необходимо указать prompt',
        details: 'Поле prompt является обязательным для генерации кода'
      });
    }

    let result;
    
    if (model === 'openai') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates code based on user prompts. Always provide clean, well-documented code with explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      
      result = completion.choices[0].message.content;
      logger.info('Код успешно сгенерирован через OpenAI');

    } else if (model === 'anthropic') {
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `Generate code based on this description: ${prompt}\nProvide clean, well-documented code with explanations.`
        }],
        temperature: 0.7
      });
      
      result = message.content[0].text;
      logger.info('Код успешно сгенерирован через Anthropic');

    } else {
      logger.error(`Неподдерживаемая модель: ${model}`);
      return res.status(400).json({ 
        error: 'Неподдерживаемая модель',
        details: 'Поддерживаются только модели: openai, anthropic'
      });
    }

    res.json({ 
      result,
      model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Ошибка при генерации кода:', {
      error: error.message,
      stack: error.stack,
      model: req.body.model
    });
    
    // Определяем тип ошибки для возврата соответствующего статус-кода
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Ошибка аутентификации API',
        details: 'Проверьте правильность API ключей'
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Превышен лимит запросов',
        details: 'Попробуйте повторить запрос позже'
      });
    }

    next(error);
  }
});