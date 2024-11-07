const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.post('/process', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const newPayment = new Payment({
            userId,
            amount,
            status: 'Pending',
        });

        await newPayment.save();
        res.status(200).json({ message: 'Payment initiated' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment', error });
    }
});
module.exports = router;