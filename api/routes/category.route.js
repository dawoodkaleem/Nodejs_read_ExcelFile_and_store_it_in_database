import express from "express";
// import mongoose from "mongoose";
import multer from "multer";
// import xlsx from "xlsx";

// import CategoryModel from "../models/category.model.js";
// import SubcategoryModel from "../models/subcatogory.model.js";
// import TodosModel from "../models/todos.model.js";
const router = express.Router();
import {
  getCategory,
  readFileStoreInDatabase,
  updateCategory,
} from "../controller/category.controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// router.post(
//   "/",
//   upload.fields([{ name: "categories" }, { name: "todos" }]),
//   async (req, res) => {
//     try {
//       const categoryFile = req.files["categories"]?.[0];
//       const todosFile = req.files["todos"]?.[0];

//       if (!categoryFile || !todosFile) {
//         return res.status(400).json({
//           error: "Both files (categories and todos) must be uploaded.",
//         });
//       }

//       // Parse Categories + Subcategories file
//       const categoryWorkbook = xlsx.read(categoryFile.buffer, {
//         type: "buffer",
//       });
//       const categorySheet =
//         categoryWorkbook.Sheets[categoryWorkbook.SheetNames[0]];
//       const categoryData = xlsx.utils.sheet_to_json(categorySheet);
//       console.log(categoryData, "post Category reading");
//       const categoryCache = new Map();
//       const subcategoryCache = new Map();

//       for (const row of categoryData) {
//         const categoryName = row.Category?.trim();
//         const subcategoryName = row.Subcategory?.trim();

//         if (!categoryName || !subcategoryName) continue;

//         let category = categoryCache.get(categoryName);

//         if (!category) {
//           category = await CategoryModel.findOne({ name: categoryName });
//           if (!category) {
//             category = new CategoryModel({ name: categoryName });
//             await category.save();
//           }
//           categoryCache.set(categoryName, category);
//         }

//         let subcategory = await SubcategoryModel.findOne({
//           name: subcategoryName,
//           categoryId: category._id,
//         });
//         console.log(subcategory, "After save or created subcategory");
//         if (!subcategory) {
//           subcategory = new SubcategoryModel({
//             name: subcategoryName,
//             categoryId: category._id,
//           });
//           await subcategory.save();
//         }

//         subcategoryCache.set(subcategory._id.toString(), subcategory);
//       }

//       // Parse Todos + Subcategory ID file Reading and performing tasks
//       const todosWorkbook = xlsx.read(todosFile.buffer, { type: "buffer" });
//       const todosSheet = todosWorkbook.Sheets[todosWorkbook.SheetNames[0]];
//       const todosData = xlsx.utils.sheet_to_json(todosSheet);
//       console.log(todosData, "DAE");

//       for (const row of todosData) {
//         const todoName = row.Todo?.trim();
//         const subcategoryId = row.SubcategoryId?.trim();

//         if (!todoName || !subcategoryId) continue;

//         const subcategoryExists =
//           subcategoryCache.get(subcategoryId) ||
//           (await SubcategoryModel.findById(subcategoryId));
//         if (!subcategoryExists) continue;

//         const todo = new TodosModel({
//           name: todoName,
//           type: subcategoryId,
//         });

//         await todo.save();
//       }

//       res.status(200).json({ message: "Data imported successfully" });
//     } catch (error) {
//       console.error("Upload error:", error);
//       res.status(500).json({ error: "Failed to process uploaded files" });
//     }
//   }
// );

// router.post(
//   "/",
//   upload.single([{ name: "categories" }, { name: "todos" }]),
//   readFileStoreInDatabase
// );

router.post("/", upload.single("categories"), readFileStoreInDatabase);
router.get("/", getCategory);
router.put("/:id", updateCategory);

export default router;
