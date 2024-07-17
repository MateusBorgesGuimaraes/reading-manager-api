const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/user');

router.post('/', async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username }).populate('folders', {
    name: 1,
    color: 1,
    books: 1,
    createdAt: 1,
  });

  try {
    await bcrypt.compare(password, user.passwordHash);
  } catch (error) {
    console.log('error:', error);
  }

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  response.status(200).send({
    token,
    username: user.username,
    email: user.email,
    folders: user.folders,
  });
});

module.exports = router;
