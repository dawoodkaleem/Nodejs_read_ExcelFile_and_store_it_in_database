import express from "express";
import multer from "multer";
const router = express.Router();
import { getTodos, createTodos } from "../controller/todos.controller.js";
import { userAuth as CheckAuth } from "../middleware/user.auth.js";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", CheckAuth, upload.single("todos"), createTodos);
router.get("/", CheckAuth, getTodos);

export default router;
