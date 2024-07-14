const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  bookname: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  page: {
    type: Number,
    required: true,
  },
  stopInPage: {
    type: Number,
    required: true,
  },
  statusOfreading: {
    type: String,
    required: true,
    enum: ['Completo', 'Lendo', 'Dropado', 'Pausado'],
    default: 'Lendo',
  },
  timeSpent: {
    type: String,
    required: true,
  },
  markers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Marker',
    },
  ],
});

bookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
