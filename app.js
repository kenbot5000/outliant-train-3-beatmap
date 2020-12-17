require('dotenv').config();

const host = process.env.HOST;
const port = process.env.PORT;

const express = require('express');
const consola = require('consola');
const bodyParser = require('body-parser');

const swaggerJSdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();

app.use(bodyParser.json());

const userRoute = require('./routes/userRoute');
app.use('/users', userRoute);

const osuRoute = require('./routes/osuRoute');
app.use('/maps', osuRoute);

const authRoute = require('./routes/authRoute');
app.use('/auth', authRoute);

// Swagger UI Options
const options = {
  definition: {
    info: {
      title: 'osu! Beatmap API',
      description: 'An osu! beatmap API for a training task.'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/'
    }
  ],
  apis: ['./routes/osuRoute.js', './routes/authRoute.js', './routes/userRoute.js']
};
const specs = swaggerJSdoc(options);
app.use(
  '/docs',
  swaggerUI.serve,
  swaggerUI.setup(specs, { explorer: true })
);

app.listen(port, () => {
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
});
