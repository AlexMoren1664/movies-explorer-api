const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const controllers = require('../controllers/users');

usersRouter.get('/users/me', controllers.getUser);
usersRouter.patch('/users/me',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  controllers.updateUserProfile);

module.exports = usersRouter;
