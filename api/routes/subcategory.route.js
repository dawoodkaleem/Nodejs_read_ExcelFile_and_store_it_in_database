import express from "express";
const router = express.Router();
import {
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  getSubcategory_by_id,
  deleteSubcategory,
} from "../controller/subcategory.controller.js";
router.get("/", getSubcategory);
router.post("/", createSubcategory);
router.put("/:subcategoryId", updateSubcategory);
router.delete("/:subcategoryId", deleteSubcategory);
router.get("/:subcategoryId", getSubcategory_by_id);

export default router;
