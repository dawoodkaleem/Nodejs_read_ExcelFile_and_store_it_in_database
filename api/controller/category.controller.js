import { getCategoryById, getAllCategory, readFileAndStoreInDatabaseService, deleteCategoryService } from '../services/category.services.js'
export const getCategory = async (req, res) => {
  try {
    const response = await getAllCategory();
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

// export const readFileStoreInDatabase = async (req, res) => {
//   try {
//     // Parse Categories + Subcategories file reading and storing in database
//     const categoryWorkbook = xlsx.read(req.file.buffer, {
//       type: "buffer",
//     });
//     // console.log("We are in try", categoryWorkbook);
//     const categorySheet =
//       categoryWorkbook.Sheets[categoryWorkbook.SheetNames[0]];
//     // console.log("We are in try 2", categorySheet);
//     const categoryData = xlsx.utils.sheet_to_json(categorySheet);

//     console.log("We are in try 2", categorySheet);
//     // console.log(categoryData, "post Category reading");
//     const categoryCache = new Map();
//     const subcategoryCache = new Map();

//     for (const row of categoryData) {
//       const categoryName = row.Category?.trim();
//       const subcategoryName = row.Subcategory?.trim();

//       if (!categoryName || !subcategoryName) continue;

//       let category = categoryCache.get(categoryName);

//       if (!category) {
//         category = await CategoryModel.findOne({ name: categoryName });
//         if (!category) {
//           category = new CategoryModel({ name: categoryName });
//           await category.save();
//         }
//         categoryCache.set(categoryName, category);
//       }

//       let subcategory = await SubcategoryModel.findOne({
//         name: subcategoryName,
//         categoryId: category._id,
//       });
//       // console.log(subcategory, "After save or created subcategory");
//       if (!subcategory) {
//         subcategory = new SubcategoryModel({
//           name: subcategoryName,
//           categoryId: category._id,
//         });
//         await subcategory.save();
//       }

//       subcategoryCache.set(subcategory._id.toString(), subcategory);
//     }
//     res.status(200).json({ message: "Data imported successfully" });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ error: "Failed to process uploaded files" });
//   }
// };

export const readFileStoreInDatabase = async (req, res) => {
  try {
    const result = await readFileAndStoreInDatabaseService(req.file.buffer);
    res.status(200).json(result);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to process uploaded files" });
  }
};

export const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await updateCategoryService(id, name);
    res.status(200).json({ updatedCategory });
  } catch (err) {
    res.status(404).json({ error: err.message || "Category not found" });
  }
};
export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const result = await deleteCategoryService(categoryId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      error: "Failed to delete Category",
      details: error.message,
    });
  }
};

export const getCategory_by_id = async (req, res, next) => {
  const id = req.params.categoryId;
  try {
    const response = await getCategoryById(id)
    res.status(200).json({ response })
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  };
};
