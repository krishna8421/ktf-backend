import mongoose from "mongoose";

const MerchSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  merchID: Number,
  imageUrl: String,
  availableSize: [],
});

export const Merch = mongoose.model("merchs", MerchSchema);
