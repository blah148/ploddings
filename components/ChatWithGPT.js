// components/ChatWithGPT.js
import React, { useState } from 'react';
import axios from 'axios';

function ChatWithGPT() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/chatgpt', { prompt });
            setResponse(res.data.response);
        } catch (error) {
            console.error('Error fetching response:', error);
            setResponse('Failed to get response');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt"
                />
                <button type="submit">Send</button>
            </form>
            {response && <div><strong>Response:</strong> <p>{response}</p></div>}
        </div>
    );
}

export default ChatWithGPT;

