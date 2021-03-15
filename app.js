require('dotenv').config();
const express = require('express');

const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const {
  CelebrateError,
} = require('celebrate');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFound = require('./errors/NotFound');
const router = require('./routes');

app.use(cors());

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
mongoose.connection.on('open', () => console.log('db connect'));
app.use(express.json());
const { PORT = 3000 } = process.env;

app.use(requestLogger);
app.use('/', router);

app.use('/', auth, usersRouter);
app.use('/', auth, moviesRouter);

app.use(errorLogger);

app.use('*', () => {
  throw new NotFound('Запрашиваемый ресурс не найден');
});

app.use((err, req, res, next) => {
  if (err instanceof CelebrateError) {
    res.status(400).send({ message: err.details.get('body').details[0].message });
  }
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
