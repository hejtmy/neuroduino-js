const express = require('express');
const app = express();
const path = require('path');
const Neuroduino = require('../src/neuroduino');

let neuroduino = new Neuroduino();

app.get('/connect', async (req, res) => {
    let connected = await neuroduino.connect();
    res.send({ connected });
});

app.get('/blink', (req, res) => {
    neuroduino.blink();
    res.send({ message: 'Blink command sent' });
});

app.use(express.static(path.join(__dirname, 'web')));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});