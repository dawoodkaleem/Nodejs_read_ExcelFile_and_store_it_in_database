import SubcategoryModel from "../models/subcatogory.model.js";

export const getAllSubcategoriesService = async () => {
  const docs = await SubcategoryModel.find().exec();
  return {
    count: docs.length,
    product: docs.map((doc) => ({
      name: doc.name,
      _id: doc._id,
    })),
  };
};

export const createSubcategoryService = async (name, categoryId) => {
  const subCategory = new SubcategoryModel({
    name,
    categoryId: categoryId || "Dummy Mongoose",
  });
  const saved = await subCategory.save();
  return saved;
};

export const updateSubcategoryService = async (id, name) => {
  const updated = await SubcategoryModel.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );
  if (!updated) throw new Error("Subcategory not found");
  return updated;
};

export const getSubcategoryByIdService = async (id) => {
  const subcategory = await SubcategoryModel.findById(id).exec();
  if (!subcategory) throw new Error("Subcategory not found");
  return subcategory;
};

export const deleteSubcategoryService = async (id) => {
  const result = await SubcategoryModel.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new Error("Subcategory not found or already deleted");
  }
  return { message: `Subcategory deleted successfully: ${id}` };
};
