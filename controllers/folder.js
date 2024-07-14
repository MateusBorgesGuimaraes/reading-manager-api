const jwt = require('jsonwebtoken');
const router = require('express').Router();
const Folder = require('../models/folder');
const User = require('../models/user');
const userExtractor = require('../utils/middleware').userExtractor;

router.get('/', async (request, response) => {
  const folders = await Folder.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  response.json(folders);
});

router.post('/', userExtractor, async (request, response) => {
  const folder = new Folder(request.body);

  const user = request.user;

  if (!user) {
    return response.status(403).json({ error: 'user missing' });
  }

  if (!folder.name) {
    return response.status(400).json({ error: 'name missing' });
  }

  folder.name = folder.name;
  folder.color = folder.color;
  folder.user = user;
  user.folders = user.folders.concat(folder._id);

  await user.save();

  const savedFolder = await folder.save();

  response.status(201).json(savedFolder);
});

router.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user;

  const folder = await Folder.findById(request.params.id);
  if (!folder) {
    return response.status(204).end();
  }

  if (user.id.toString() !== folder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  await folder.deleteOne();

  user.folders = user.folders.filter(
    (b) => b._id.toString() !== folder._id.toString(),
  );

  await user.save();

  response.status(204).end();
});

router.put('/:id', async (request, response) => {
  const body = request.body;

  const folder = {
    name: body.name,
    color: body.color,
    books: body.books,
  };

  const updatedFolder = await Folder.findByIdAndUpdate(
    request.params.id,
    folder,
    { new: true },
  );
  response.json(updatedFolder);
});

module.exports = router;
