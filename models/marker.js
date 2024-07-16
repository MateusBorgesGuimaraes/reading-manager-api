const mongoose = require('mongoose');

const markerSchema = mongoose.Schema(
  {
    markerName: {
      type: String,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      enum: [
        'amarelo',
        'azul',
        'ciano',
        'verde',
        'vermelho',
        'laranja',
        'roxo',
        'cinza',
      ],
      default: 'cinza',
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  },
  { timestamps: true },
);

markerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Marker = mongoose.model('Marker', markerSchema);

module.exports = Marker;
