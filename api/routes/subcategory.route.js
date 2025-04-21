import express from "express";
const router = express.Router();
import { userAuth as CheckAuth } from "../middleware/user.auth.js";
import {
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  getSubcategory_by_id,
  deleteSubcategory,
} from "../controller/subcategory.controller.js";
router.get("/", getSubcategory);
router.post("/", CheckAuth, CheckAuth, createSubcategory);
router.put("/:subcategoryId", CheckAuth, updateSubcategory);
router.delete("/:subcategoryId", CheckAuth, deleteSubcategory);
router.get("/:subcategoryId", CheckAuth, getSubcategory_by_id);

export default router;
