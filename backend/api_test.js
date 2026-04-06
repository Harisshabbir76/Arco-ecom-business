
const axios = require('axios');
require('dotenv').config();

async function test() {
    const url = `http://localhost:5001/api/apply-coupon`;
    const data = {
        code: 'Haris123',
        totalAmount: 2200,
        products: [{
            productId: '69ac39254fb71ed8a0d427b2',
            quantity: 1,
            price: 2200,
            category: 'bags'
        }]
    };

    try {
        const res = await axios.post(url, data);
        console.log('Response:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.log('Error:', err.response ? err.response.data : err.message);
    }
}

test();
