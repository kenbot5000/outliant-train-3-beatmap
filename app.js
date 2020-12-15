require('dotenv').config();

const host = process.env.HOST;
const port = process.env.PORT;

const express = require('express');
const consola = require('consola');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const userRoute = require('./routes/userRoute');
app.use('/users', userRoute);

const osuRoute = require('./routes/osuRoute');
app.use('/maps', osuRoute);

app.listen(port, () => {
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
});
