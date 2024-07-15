const jwt = require('jsonwebtoken');
const router = require('express').Router();
const Book = require('../models/book');
const Marker = require('../models/marker');
const User = require('../models/user');
const Folder = require('../models/folder');
const userExtractor = require('../utils/middleware').userExtractor;

router.get('/', async (request, response) => {
  const markers = await Marker.find({}).populate('book', {
    stopInPage: 1,
    bookname: 1,
    pagesNumber: 1,
    id: 1,
  });
  response.json(markers);
});

router.post('/', userExtractor, async (request, response) => {
  const { markerName, page, content, color, bookId } = request.body;

  if (!markerName || !page || !content || !bookId) {
    return response.status(400).json({ error: 'missing required fields' });
  }

  const user = request.user;

  if (!user) {
    return response.status(403).json({ error: 'user missing' });
  }

  const book = await Book.findById(bookId);

  if (!book) {
    return response.status(400).json({ error: 'book not found' });
  }

  const folder = await Folder.findById(book.folder);

  if (user._id.toString() !== folder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  const marker = new Marker({
    markerName,
    page,
    content,
    color,
    book: book._id,
  });

  const savedMarker = await marker.save();

  book.markers = book.markers.concat(savedMarker._id);
  await book.save();

  response.status(201).json(savedMarker);
});

router.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user;

  const marker = await Marker.findById(request.params.id);
  if (!marker) {
    return response.status(204).end();
  }

  const book = await Book.findById(marker.book);
  const folder = await Folder.findById(book.folder);

  if (user._id.toString() !== folder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  await marker.deleteOne();

  book.markers = book.markers.filter(
    (m) => m.toString() !== marker._id.toString(),
  );

  await book.save();

  response.status(204).end();
});

router.put('/:id', userExtractor, async (request, response) => {
  const { markerName, page, content, color } = request.body;

  const user = request.user;

  const marker = await Marker.findById(request.params.id);
  if (!marker) {
    return response.status(204).end();
  }

  const book = await Book.findById(marker.book);
  const folder = await Folder.findById(book.folder);

  if (user._id.toString() !== folder.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  const updatedMarker = await Marker.findByIdAndUpdate(
    request.params.id,
    { markerName, page, content, color },
    { new: true },
  );

  response.json(updatedMarker);
});

router.get('/:id', async (request, response) => {
  const marker = await Marker.findById(request.params.id).populate('book', {
    stopInPage: 1,
    bookname: 1,
    pagesNumber: 1,
    id: 1,
  });

  if (!marker) {
    return response.status(404).json({ error: 'marker not found' });
  }

  response.json(marker);
});

module.exports = router;
