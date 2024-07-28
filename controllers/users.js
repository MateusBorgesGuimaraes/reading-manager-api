const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/', async (request, response) => {
  const { username, email, password } = request.body;

  if (!password || password.length < 3) {
    return response
      .status(400)
      .json({ error: 'password missing or too short' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    email,
    passwordHash,
  });
  const savedUser = await user.save();

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  response.status(200).send({ token });
});

router.get('/', async (request, response) => {
  const users = await User.find({}).populate('folders', {
    name: 1,
    color: 1,
    id: 1,
    books: 1,
    createdAt: 1,
  });
  response.json(users);
});

module.exports = router;
