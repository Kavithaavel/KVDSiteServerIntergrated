const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hotelsites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotelsite",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Favorite", favoriteSchema);
