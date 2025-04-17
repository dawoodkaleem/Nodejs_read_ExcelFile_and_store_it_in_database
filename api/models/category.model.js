import mongoose from "mongoose";

import { Schema as SchemaType } from "mongoose";

const categorySchema = new SchemaType(
  {
    name: { type: String, require: true },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
