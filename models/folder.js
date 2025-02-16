const mongoose = require('mongoose');

const folderSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 20,
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
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

folderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Folder', folderSchema);
