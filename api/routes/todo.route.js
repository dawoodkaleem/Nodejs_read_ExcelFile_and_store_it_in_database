import express from "express";
import multer from "multer";
const router = express.Router();
import { getTodos, createTodos } from "../controller/todos.controller.js";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("todos"), createTodos);
router.get("/", getTodos);

export default router;
