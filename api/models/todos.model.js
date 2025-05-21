import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);
export default Todo
