const express = require('express');
const router = express.Router();
const axios = require('axios');

// Route to fetch data from external API
router.get('/api/data', async (req, res) => {
    try {
        const response = await axios.get('https://api.example.com/resource', {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`, // Use environment variables
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error fetching data');
    }
});

module.exports = router;
