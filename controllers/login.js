const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/user');
const { userExtractor } = require('../utils/middleware');

router.post('/', async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username });

  if (!user) {
    return response.status(401).json({
      error: 'usuario ou senha invalidos',
    });
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!passwordCorrect) {
    return response.status(401).json({
      error: 'usuario ou senha invalidos',
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  response.status(200).send({ token });
});

router.get('/user', userExtractor, async (request, response) => {
  const user = request.user;

  const populatedUser = await User.findById(user._id).populate('folders', {
    name: 1,
    color: 1,
    books: 1,
    createdAt: 1,
  });

  response.status(200).json({
    username: populatedUser.username,
    email: populatedUser.email,
    folders: populatedUser.folders,
  });
});

module.exports = router;
