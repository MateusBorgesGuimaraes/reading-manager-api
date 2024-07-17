const router = require('express').Router();
const User = require('../models/user');
const Book = require('../models/book');
const Folder = require('../models/folder');
const Marker = require('../models/marker');
const userExtractor = require('../utils/middleware').userExtractor;

router.get('/user', userExtractor, async (request, response) => {
  const userId = request.user.id.toString();

  if (!userId) {
    return response.status(403).json({ error: 'user not authorized' });
  }

  try {
    const user = await User.findById(userId).populate({
      path: 'folders',
      populate: {
        path: 'books',
        populate: {
          path: 'markers',
        },
      },
    });

    if (!user) {
      return response.status(404).json({ error: 'user not found' });
    }

    const books = user.folders.flatMap((folder) => folder.books);
    const markers = books.flatMap((book) => book.markers);

    const totalBooks = books.length;
    const totalMarkers = markers.length;

    const booksByStatus = books.reduce(
      (acc, book) => {
        acc[book.statusOfreading] = (acc[book.statusOfreading] || 0) + 1;
        return acc;
      },
      { Completo: 0, Lendo: 0, Dropado: 0, Pausado: 0 },
    );

    const booksByCategory = user.folders.reduce((acc, folder) => {
      acc[folder.name] = folder.books.length;
      return acc;
    }, {});

    const markersByBook = books.reduce((acc, book) => {
      acc[book.bookname] = book.markers.length;
      return acc;
    }, {});

    const totalReadingTime = books.reduce((acc, book) => {
      const timeParts = book.timeSpent.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const seconds = parseInt(timeParts[2], 10);
      return acc + hours * 3600 + minutes * 60 + seconds;
    }, 0);

    const completionRate =
      booksByStatus.Completo / (booksByStatus.Completo + booksByStatus.Dropado);

    const statistics = {
      totalBooks,
      booksByCategory,
      totalMarkers,
      markersByBook,
      booksByStatus,
      completionRate,
      totalReadingTime,
    };

    response.json(statistics);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
