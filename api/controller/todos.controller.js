import {
  importTodosFromBuffer,
  updateTodoById,
  getTodosById,
  deleteTodo,
  getTodosService,
} from "../services/todos.services.js";

export const getTodos = async (req, res, next) => {
  try {
    const response = await getTodosService();
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const createTodos = async (req, res) => {
  try {
    const result = await importTodosFromBuffer(req.file.buffer);
    res.status(200).json(result);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateTodos = async (req, res) => {
  const id = req.params.todosId;
  const { name } = req.body;
  try {
    const updatedTodos = await updateTodoById(id, { name });
    return res.status(200).json({ updatedTodos });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

export const getTodos_by_id = async (req, res, next) => {
  const id = req.params.todosId;
  try {
    const docs = await getTodosById(id);
    res.status(200).json(docs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteTodos = async (req, res) => {
  const id = req.params.todosId;
  try {
    const response = await deleteTodo(id);

    res.status(200).json({
      message: `Todos deleted successfully: ${id}`,
      response,
    });
  } catch (error) {
    console.error("Delete Todos Error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete Todos", details: error.message });
  }
};
