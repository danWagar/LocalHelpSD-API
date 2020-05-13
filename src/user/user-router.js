/* eslint-disable strict */
const express = require('express');
const path = require('path');
const UserService = require('./user-service');

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { password, email, first_name, last_name } = req.body;

  for (const field of ['email', 'first_name', 'last_name', 'password'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

  const passwordError = UserService.validatePassword(password);

  if (passwordError) return res.status(400).json({ error: passwordError });

  UserService.hasUserWithEmail(req.app.get('db'), email)
    .then((hasUserWithEmail) => {
      if (hasUserWithEmail) return res.status(400).json({ error: `Email already taken` });
      return UserService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          email,
          first_name,
          last_name,
          password: hashedPassword,
          date_created: 'now()',
        };
        return UserService.insertUser(req.app.get('db'), newUser).then((user) => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${user.id}`))
            .json(UserService.serializeUser(user));
        });
      });
    })
    .catch(next);
});

module.exports = userRouter;
