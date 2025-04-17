import express from "express";

const router = express.Router();
import { getTodos } from "../controller/todos.controller.js";
router.get("/", getTodos);

export default router;
