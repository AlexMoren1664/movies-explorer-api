const mongoose = require('mongoose');
const Movie = require('../models/movie');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
  } = req.body;
  Movie.create({
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    owner: req.user._id,
  })
    .then((movie) => {
      if (!movie) {
        throw new BadRequest('Некорректные данные запроса');
      }
      res.send({
        _id: movie._id,
        movieId: movie.movieId,
        country: movie.country,
        director: movie.director,
        duration: movie.duration,
        year: movie.year,
        description: movie.description,
        image: movie.image,
        trailer: movie.trailer,
        nameRU: movie.nameRU,
        nameEN: movie.nameEN,
        thumbnail: movie.thumbnail,
      });
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId).select('+owner')
    .orFail(() => {
      throw new NotFound('Фильм не найден');
    })
    .then((movieId) => {
      if (movieId.owner.toString() !== req.user._id) {
        throw new Forbidden('Нельзя удалить чужой фильм');
      }
      Movie.findByIdAndRemove(movieId._id)
        .then(() => {
          res.send({ message: 'Фильм удален' });
        });
    })
    .catch((err) => {
      if (err instanceof mongoose.CastError) {
        const errorBadRequest = new BadRequest('Запрос не был обработан, неверные данные');
        return next(errorBadRequest);
      }
      return next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
