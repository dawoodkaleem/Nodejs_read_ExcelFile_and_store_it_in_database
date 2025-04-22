import express from "express";
import multer from "multer";
const router = express.Router();
import {
  getTodos,
  createTodos,
  updateTodos,
  getTodos_by_id,
  deleteTodos,
} from "../controller/todos.controller.js";
import { userAuth as CheckAuth } from "../middleware/user.auth.js";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", CheckAuth, upload.single("todos"), createTodos);
router.get("/", CheckAuth, getTodos);
router.put("/:todosId", CheckAuth, updateTodos);
router.delete("/:todosId", CheckAuth, deleteTodos);
router.get("/:todosId", CheckAuth, getTodos_by_id);
export default router;
