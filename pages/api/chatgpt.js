// pages/api/chat.js
import { getOpenAIResponse } from '../utils/openai-utils';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const prompt = req.body.prompt;
            const response = await getOpenAIResponse(prompt);
            res.status(200).json({ response });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get response from OpenAI' });
        }
    } else {
        res.status(405).end('Method Not Allowed');
    }
}

