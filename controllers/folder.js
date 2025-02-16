const jwt = require('jsonwebtoken');
const router = require('express').Router();
const Folder = require('../models/folder');
const Book = require('../models/book');
const Marker = require('../models/marker');
const User = require('../models/user');
const userExtractor = require('../utils/middleware').userExtractor;

router.get('/', async (request, response) => {
  const folders = await Folder.find({}).populate('books', {
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
});

router.get('/:folderId', async (request, response) => {
  try {
    const folder = await Folder.findById(request.params.folderId).populate(
      'books',
      {
        bookname: 1,
        id: 1,
        statusOfreading: 1,
        author: 1,
        createdAt: 1,
        updatedAt: 1,
        pagesNumber: 1,
        stopInPage: 1,
      },
    );

    if (!folder) {
      return response.status(404).json({ error: 'folder not found' });
    }

    response.json(folder.books);
  } catch (error) {
    response.status(500).json({ error: 'internal server error' });
  }
});

router.get('/', async (request, response) => {
  const folders = await Folder.find({}).populate('books', {
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

  const userObject = user.toObject();
  const filteredUser = {
    username: userObject.username,
    email: userObject.email,
    id: userObject._id,
  };

  const savedFolderObject = savedFolder.toObject();
  savedFolderObject.user = filteredUser;

  response.status(201).json(savedFolderObject);
});

router.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user;

  const folder = await Folder.findById(request.params.id).populate('books');
  if (!folder) {
    return response.status(204).end();
  }

  if (user.id.toString() !== folder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  for (const book of folder.books) {
    await Marker.deleteMany({ book: book._id });
    await Book.findByIdAndDelete(book._id);
  }

  await folder.deleteOne();

  user.folders = user.folders.filter(
    (f) => f._id.toString() !== folder._id.toString(),
  );

  await user.save();

  response.status(204).end();
});

router.put('/:id', userExtractor, async (request, response) => {
  const { name, color, books } = request.body;

  const user = request.user;
  const folder = await Folder.findById(request.params.id);

  if (!folder) {
    return response.status(204).end();
  }

  if (user._id.toString() !== folder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  const updatedFolder = await Folder.findByIdAndUpdate(
    request.params.id,
    { name, color, books },
    { new: true },
  );

  response.json(updatedFolder);
});

module.exports = router;
