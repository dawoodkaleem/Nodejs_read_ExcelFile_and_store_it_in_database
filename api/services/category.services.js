import xlsx from "xlsx";
import CategoryModel from "../models/category.model.js";
import SubcategoryModel from "../models/subcatogory.model.js";

export const readFileAndStoreInDatabaseService = async (fileBuffer) => {
  const categoryWorkbook = xlsx.read(fileBuffer, { type: "buffer" });
  const categorySheet = categoryWorkbook.Sheets[categoryWorkbook.SheetNames[0]];
  const categoryData = xlsx.utils.sheet_to_json(categorySheet);

  const categoryCache = new Map();
  const subcategoryCache = new Map();

  for (const row of categoryData) {
    const categoryName = row.Category?.trim();
    const subcategoryName = row.Subcategory?.trim();

    if (!categoryName || !subcategoryName) continue;

    let category = categoryCache.get(categoryName);

    if (!category) {
      category = await CategoryModel.findOne({ name: categoryName });
      if (!category) {
        category = new CategoryModel({ name: categoryName });
        await category.save();
      }
      categoryCache.set(categoryName, category);
    }

    let subcategory = await SubcategoryModel.findOne({
      name: subcategoryName,
      categoryId: category._id,
    });

    if (!subcategory) {
      subcategory = new SubcategoryModel({
        name: subcategoryName,
        categoryId: category._id,
      });
      await subcategory.save();
    }

    subcategoryCache.set(subcategory._id.toString(), subcategory);
  }

  return { message: "Data imported successfully" };
};
export const getCategoryById = async (id) => {

  const response = await CategoryModel.findById(id)
  if (!response) {
    throw error
  }
  return response
}

export const getAllCategory = async () => {
  try {
    const docs = await CategoryModel.find().exec();

    return {
      count: docs.length,
      product: docs.map((doc) => ({
        name: doc.name,
        _id: doc._id,
      })),
    };
  } catch (error) {
    throw error;
  }
}

export const updateCategoryService = async (id, name) => {
  const updatedCategory = await CategoryModel.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );

  if (!updatedCategory) {
    throw new Error("Category not found");
  }

  return updatedCategory;
};
export const deleteCategoryService = async (id) => {
  const result = await CategoryModel.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw new Error("Category not found or already deleted");
  }

  return { message: `Category deleted successfully: ${id}` };
};