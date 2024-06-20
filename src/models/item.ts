import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document {
  name: string;
  description: string;
  quantity: number;
  codeBar: string;
}

const itemSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, default: 0 },
  codeBar: { type: String, required: true },
});

export default mongoose.model<IItem>("Item", itemSchema);
