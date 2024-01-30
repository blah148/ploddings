// components/ChatWithGPT.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChatWithGPT({ initialPrompt }) {

    const [response, setResponse] = useState('');

		useEffect(() => {
			if (initialPrompt) {
				fetchResponse(initialPrompt);
			}
		}, []);

		const fetchResponse = async (prompt) => {

			try {
				const res = await axios.post('/api/chatgpt', { prompt });
				setResponse(res.data.response);
			} catch (error) {
					console.error('Error fetching response:', error);
					setResponse('Failed to get repsonse');
				}
		};

    return (
        <div>
            {response && <div><strong>Response:</strong> <p style={{color:"red"}}>{response}</p></div>}
        </div>
    );
}

export default ChatWithGPT;

