import {
  getAllSubcategoriesService,
  createSubcategoryService,
  updateSubcategoryService,
  getSubcategoryByIdService,
  deleteSubcategoryService,
} from "../services/subcategory.services.js";

export const getSubcategory = async (req, res) => {
  try {
    const result = await getAllSubcategoriesService();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const createSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const saved = await createSubcategoryService(name, categoryId);
    res.status(201).json({ message: "Subcategory created", saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create subcategory" });
  }
};

export const updateSubcategory = async (req, res) => {
  const { subcategoryId } = req.params;
  const { name } = req.body;

  try {
    const updated = await updateSubcategoryService(subcategoryId, name);
    res.status(200).json({ updated });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

export const getSubcategory_by_id = async (req, res) => {
  const { subcategoryId } = req.params;

  try {
    const subcategory = await getSubcategoryByIdService(subcategoryId);
    res.status(200).json(subcategory);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  const { subcategoryId } = req.params;

  try {
    const result = await deleteSubcategoryService(subcategoryId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to delete subcategory",
      details: error.message,
    });
  }
};
