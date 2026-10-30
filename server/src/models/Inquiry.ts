import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    name: String,
    email: String,
    organization: String,
    subject: String,
    message: String,
  },
  { timestamps: true },
);
export const Inquiry = mongoose.model("Inquiry", schema);
