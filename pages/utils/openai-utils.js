// utils/openai-utils.js
import OpenAI from 'openai';

const openai = new OpenAI('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');

export async function getOpenAIResponse(prompt) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            model: 'gpt-3.5-turbo',
						max_tokens: 5 
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error in OpenAI API call:', error);
        throw error;
    }
}

