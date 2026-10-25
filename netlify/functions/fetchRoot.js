require('dotenv').config();


const fetch = global.fetch || require('node-fetch');

exports.handler = async (event) => {

    const API_BASE_URL = process.env.API_BASE_URL;
    const API_URL = `${API_BASE_URL}/`;


    const headers = {
        'X-API-Key': process.env.API_KEY,
        'Content-Type': 'application/json'
    }

    try {
        const response = await fetch(API_URL, { headers });
        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data.message })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }

}
