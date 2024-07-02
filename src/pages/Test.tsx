import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Test() {
    const [sessionValid, setSessionValid] = useState<boolean | null>(null);

    useEffect(() => {
        const config = {
            withCredentials: true, // Send cookies along with the request
        };

        axios.get('http://localhost:5252/api/checksession', config)
            .then(response => {
                console.log(response.data);
                if (response.status === 200 && response.data.message === 'success') {
                    setSessionValid(true);
                } else {
                    setSessionValid(false);
                }
            })
            .catch(error => {
                console.error('Error checking session:', error);
                setSessionValid(false);
            });
    }, []);

    return (
        <div>
            {sessionValid === null && <p>Checking session...</p>}
            {sessionValid === true && <p>Session is valid</p>}
            {sessionValid === false && <p>Session is invalid</p>}
        </div>
    );
}

export default Test;
