import mongoose from "mongoose";
import mongoosePagination from "mongoose-paginate";

export interface CommentDocument extends mongoose.Document {
  userId: string;
  userName: string;
  userPicture: string;
  listing: string;
  market: string;
  price: number;
  deposits: number;
  holders: number;
  supply: number;
  value: string;
  sentiment: string;
  feelings: [string];
  isDeleted: boolean;
  isModerated: boolean;
  moderatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

let CommentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, maxlength: 50, index: true },
    userName: { type: String, maxlength: 50 },
    userPicture: { type: String },
    listing: { type: String, required: true, maxlength: 250, index: true },
    market: { type: String, required: true, maxlength: 250, index: true },
    price: { type: Number, default: 0, required: false },
    deposits: { type: Number, default: 0, required: false },
    holders: { type: Number, default: 0, required: false },
    supply: { type: Number, default: 0, required: false },
    value: { type: String, required: true },
    sentiment: { type: String },
    feelings: { type: [String] },
    isDeleted: { type: Boolean, default: false, required: false },
    isModerated: { type: Boolean, default: false, required: false },
    moderatedAt: { type: Date, default: null, required: false },
  },
  {
    timestamps: true,
  }
);

CommentSchema.plugin(mongoosePagination);

const model = mongoose.model<CommentDocument>("Comment", CommentSchema);

export default model;
