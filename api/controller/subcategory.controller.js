import express from "express";
import SubcategoryModel from "../models/subcatogory.model.js";
// import subcatogoryModel from "../models/subcatogory.model.js";

export const getSubcategory = (req, res, next) => {
  SubcategoryModel.find()
    .exec()
    .then((docs) => {
      console.log(docs);
      const response = {
        count: docs.length,
        product: docs.map((doc) => {
          return {
            name: doc.name,
            _id: doc._id,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};
export const createSubcategory = async (req, res, next) => {
  try {
    const subCategory = new SubcategoryModel({
      name: req.body.name,
      categoryId: req.body.categoryId || "Dummy Monggose",
    });

    // console.log("subCategory", subCategory);

    const save = await SubcategoryModel.save();
    res
      .status(200)
      .json({ message: " created subcategory Inside the SubCategory", save });
  } catch (error) {
    res.status(500).json({ message: "Subcategory not found " });
    console.log(error);
  }
};

export const updateSubcategory = async (req, res, next) => {
  const id = req.params.subcategoryId;
  const name = req.body.name;
  try {
    console.log(" in try section");
    const updatedUser = await SubcategoryModel.findByIdAndUpdate(
      id,
      { name },
      {
        new: true,
      }
    );
    console.log("out  try section");
    return res.send({ updatedUser }) || "User not found.";
  } catch (err) {
    console.log("we are in catch in putCategory");
    return res.send("User not found");
  }
};

export const getSubcategory_by_id = (req, res, next) => {
  const id = req.params.subcategoryId;

  SubcategoryModel.findById(id)
    .exec()
    .then((docs) => {
      docs.name, id, res.status(200).json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

export const deleteSubcategory = (req, res, next) => {
  const id = req.params.subcategoryId;
  SubcategoryModel.deleteOne({ _id: id })
    .exec()
    .then(() => {
      res.status(200).json({
        message: `SubCategory Deleted sucessfully ${id}`,
      });
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json({ error: err });
    });
};
