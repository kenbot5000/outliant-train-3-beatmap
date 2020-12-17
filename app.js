require('dotenv').config();

const host = process.env.HOST;
const port = process.env.PORT;

const express = require('express');
const consola = require('consola');
const bodyParser = require('body-parser');

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

const app = express();

app.use(bodyParser.json());

const userRoute = require('./routes/userRoute');
app.use('/users', userRoute);

const osuRoute = require('./routes/osuRoute');
app.use('/maps', osuRoute);

const authRoute = require('./routes/authRoute');
app.use('/auth', authRoute);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(port, () => {
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
});
