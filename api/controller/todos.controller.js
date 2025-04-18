import TodosModel from "../models/todos.model.js";
import xlsx from "xlsx";
import SubcategoryModel from "../models/subcatogory.model.js";
export const getTodos = (req, res, next) => {
  TodosModel.find()
    .exec()
    .then((docs) => {
      console.log(docs);
      const response = {
        count: docs.length,
        product: docs.map((doc) => {
          return {
            name: doc.name,
            _id: doc._id,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

export const createTodos = async (req, res, next) => {
  try {
    // Todos + Subcategory ID file Reading and performing tasks
    const todosWorkbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const todosSheet = todosWorkbook.Sheets[todosWorkbook.SheetNames[0]];
    const todosData = xlsx.utils.sheet_to_json(todosSheet);
    // console.log(todosData, "DAE");
    // const subcategoryCache = new Map();
    for (const row of todosData) {
      const todoName = row.Todo?.trim();
      const subcategoryId = row.SubcategoryId?.trim();

      if (!todoName || !subcategoryId) continue;

      const subcategoryExists = await SubcategoryModel.findById(subcategoryId);
      if (!subcategoryExists) continue;

      const todo = new TodosModel({
        name: todoName,
        type: subcategoryId,
      });

      await todo.save();
    }

    res.status(200).json({ message: "Data imported successfully" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to process uploaded files" });
  }
};
