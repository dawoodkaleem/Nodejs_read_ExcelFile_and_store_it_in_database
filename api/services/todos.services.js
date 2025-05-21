import xlsx from 'xlsx';
import SubcategoryModel from '../models/subcatogory.model.js';
import TodosModel from '../models/todos.model.js';
import { response } from 'express';

export const importTodosFromBuffer = async (fileBuffer) => {
  try {
    const todosWorkbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const todosSheet = todosWorkbook.Sheets[todosWorkbook.SheetNames[0]];
    const todosData = xlsx.utils.sheet_to_json(todosSheet);

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

    return { message: "Data imported successfully" };
  } catch (error) {
    throw new Error("Failed to process uploaded files");
  }
};

export const updateTodoById = async (id, updateData) => {
  const updatedTodo = await TodosModel.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedTodo) {
    throw new Error("Todo not found");
  }
  return updatedTodo;
};

export const getTodosById = async (id) => {
  const response = await TodosModel.findById(id)
  if (!response) {
    throw new Error("Todo not exists")
  }
  return response;
};

export const deleteTodo = async (id) => {


  const response = await TodosModel.deleteOne({ _id: id })
  if (!response) { throw error }
  return response;

}

export const getTodosService = async () => {
  try {
    const docs = await TodosModel.find().exec();

    return {
      count: docs.length,
      product: docs.map((doc) => ({
        name: doc.name,
        _id: doc._id,
      })),
    };
  } catch (error) {
    throw error;
  }
};
