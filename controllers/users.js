const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/user');

router.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (!password || password.length < 3) {
    return response
      .status(400)
      .json({ error: 'password missing or too short' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });
  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

//pode ser folder
router.get('/', async (request, response) => {
  const users = await User.find({}).populate('folders', {
    name: 1,
    color: 1,
    id: 1,
    books: 1,
    _createdAt: 1,
    //não sei se é assim
  });
  response.json(users);
});

module.exports = router;
