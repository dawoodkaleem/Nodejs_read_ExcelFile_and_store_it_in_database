import TodosModel from "../models/todos.model.js";

export const getTodos = (req, res, next) => {
  TodosModel.find()
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
