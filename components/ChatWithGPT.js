// components/ChatWithGPT.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Typed from 'typed.js';

function ChatWithGPT({ initialPrompt }) {
    
    const [response, setResponse] = useState('');
    const typedElement = useRef(null); // Create a ref for the element where Typed will render

    useEffect(() => {
        if (initialPrompt) {
            fetchResponse(initialPrompt);
        }
    }, [initialPrompt]); // Added initialPrompt as a dependency

    useEffect(() => {
        if (response) {
            const options = {
                strings: [response],
                typeSpeed: 50,
            };
            
            // Initialize Typed.js on the ref element
            new Typed(typedElement.current, options);
        }
    }, [response]); // Effect for updating Typed.js when response updates

    const fetchResponse = async (prompt) => {
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
            <div style={{display: "flex"}}>
                <p style={{color: "red"}} ref={typedElement}></p>
            </div>
        </div>
    );
}

export default ChatWithGPT;

