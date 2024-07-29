const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/user');
const Folder = require('../models/folder');
const jwt = require('jsonwebtoken');
const userExtractor = require('../utils/middleware').userExtractor;

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
  //   const users = await User.find({}).populate('folders', {
  //     name: 1,
  //     color: 1,
  //     id: 1,
  //     books: 1,
  //     createdAt: 1,
  //   });
  //   response.json(users);
  // });
  const users = await User.find({});
  response.json(users);
});

router.get('/userFolders', userExtractor, async (request, response) => {
  const userId = request.user._id;

  try {
    const folders = await Folder.find({ user: userId }).populate('books', {
      bookname: 1,
      id: 1,
      statusOfreading: 1,
      author: 1,
      createdAt: 1,
      updatedAt: 1,
      pagesNumber: 1,
      stopInPage: 1,
    });
    response.json(folders);
  } catch (error) {
    logger.error('Error fetching folders:', error);
    response.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
