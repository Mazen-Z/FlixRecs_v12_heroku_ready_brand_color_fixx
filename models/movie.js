const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the combined schema for Movies and Reviews
const movieSchema = new Schema(
  {
    title: { type: String, required: true },
    plot: { type: String, required: true },
    cast: { type: [String], default: [] }, // Array of cast members
    tmdbId: { type: Number, required: true },

    // Aggregate rating for the movie, default 0
    aggregateRating: { type: Number, default: 0 },

    // Reviews will be part of the same document under the 'movies' attribute
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String, required: true },
        content: { type: String, required: true },
        rating: { type: Number, min: 1, max: 10, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Model for the combined movie and reviews schema
const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
