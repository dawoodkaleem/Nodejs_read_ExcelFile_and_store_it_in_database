import express from "express";
import {
  pipedriveLogin,
  pipedriveCallback,
  getAllContacts,
  getAllProducts,
  createPerson,
  getOrganizations,
  createProducts,
  searchProduct
} from "../controller/pipedrive.controller.js";

const router = express.Router();

router.get("/login", pipedriveLogin);
router.get("/callback", pipedriveCallback);
router.get("/getallcontact", getAllContacts);
router.get("/getallproducts", getAllProducts);
router.get('/getorginization', getOrganizations)
router.post("/createPerson", createPerson);
router.post("/createproducts", createProducts)
router.get("/searchproducts", searchProduct)
export default router;
