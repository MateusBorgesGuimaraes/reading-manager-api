const jwt = require('jsonwebtoken');
const router = require('express').Router();
const Book = require('../models/book');
const User = require('../models/user');
const Folder = require('../models/folder');
const userExtractor = require('../utils/middleware').userExtractor;

router.get('/', async (request, response) => {
  const books = await Book.find({}).populate('marker', {
    markerName: 1,
    page: 1,
    color: 1,
    createdAt: 1,
    id: 1,
  });
  response.json(books);
});

router.post('/', userExtractor, async (request, response) => {
  const {
    bookname,
    author,
    pagesNumber,
    stopInPage,
    statusOfreading,
    timeSpent,
    folderId,
  } = request.body;

  if (
    !bookname ||
    !author ||
    !pagesNumber ||
    !stopInPage ||
    !statusOfreading ||
    !timeSpent
  ) {
    return response.status(400).json({ error: 'missing required fields' });
  }

  const user = request.user;

  if (!user) {
    return response.status(403).json({ error: 'user missing' });
  }

  const folder = await Folder.findById(folderId);

  if (!folder) {
    return response.status(400).json({ error: 'folder not found' });
  }

  if (user._id.toString() !== bookFolder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  const book = new Book({
    bookname,
    author,
    pagesNumber,
    stopInPage,
    statusOfreading,
    timeSpent,
    folder: folder._id,
  });

  const savedBook = await book.save();

  folder.books = folder.books.concat(savedBook._id);
  await folder.save();

  response.status(201).json(savedBook);
});

router.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user;
  const book = await Book.findById(request.params.id);

  if (!book) {
    return response.status(204).end();
  }

  const folder = await Folder.findById(book.folder);

  if (user.id.toString() !== folder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  await book.deleteOne();

  folder.books = folder.books.filter(
    (b) => b._id.toString() !== book._id.toString(),
  );

  await folder.save();

  response.status(204).end();
});

router.put('/:id', userExtractor, async (request, response) => {
  const {
    bookname,
    author,
    pagesNumber,
    stopInPage,
    statusOfreading,
    timeSpent,
    folder,
    markers,
  } = request.body;

  const user = request.user;
  const book = await Book.findById(request.params.id);

  if (!book) {
    return response.status(204).end();
  }

  const bookFolder = await Folder.findById(book.folder);
  if (user._id.toString() !== bookFolder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  const updatedBook = await Book.findByIdAndUpdate(
    request.params.id,
    {
      bookname,
      author,
      pagesNumber,
      stopInPage,
      statusOfreading,
      timeSpent,
      folder,
      markers,
    },
    { new: true },
  );

  response.json(updatedBook);
});

module.exports = router;
