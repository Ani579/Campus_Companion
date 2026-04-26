import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from './authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an AI Study Assistant for a college student inside the "Campus Companion" web portal. 
If the user asks you to generate, create, or draw a picture/image, YOU MUST reply with exactly this markdown format: ![Image](https://image.pollinations.ai/prompt/detailed_visual_description)
Replace "detailed_visual_description" with a highly detailed, descriptive text of what the image should be, with spaces replaced by %20. Do not add any other text.
Otherwise, help the student with their request and answer concisely. 
User Request: ${message}`;
    
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    res.json({ reply: responseText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate response from Gemini API' });
  }
});

export default router;
