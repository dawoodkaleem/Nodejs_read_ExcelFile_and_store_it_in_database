import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";

// import CategoryModel from "./api/models/category.model.js";
// import SubcategoryModel from "./api/models/subcatogory.model.js";
// import TodosModel from "./api/models/todos.model.js";
import categoryRoute from "./api/routes/category.route.js";
import subcategoryRoute from "./api/routes/subcategory.route.js";
import todosRoute from "./api/routes/todo.route.js";
import userRoute from "./api/routes/user.route.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// mongoose
//   .connect(
//     "mongodb+srv://dawood9743:damon123@readexcelfile.o5ax09z.mongodb.net/?retryWrites=true&w=majority&appName=ReadExcelFile"
//   )
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => console.error("❌MongoDB Connection Failed:", err));

mongoose
  .connect("mongodb://127.0.0.1:27017/task2")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌MongoDB Connection Failed:", err));
app.use("/category", categoryRoute);
app.use("/subcategory", subcategoryRoute);
app.use("/todos", todosRoute);
app.use("/user", userRoute);

// Route for uploading two files
// app.post(
//   "/upload",
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

//       // Parse Todos + Subcategory ID file
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

export default app;
