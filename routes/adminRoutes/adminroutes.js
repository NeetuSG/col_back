import { Router } from "express";
const router = Router();

import fileupload from "../../controllers/adminControllers/fileUploadController/fileuploadController.js";


import getFileData from "../../controllers/adminControllers/fileUploadController/getFileController.js";
import getSingleFileData from "../../controllers/adminControllers/fileUploadController/getSingleFileController.js";

import {
  createmom,
  generatePdf,
  getAllMom,
  getAllProjectMom,
  getSingleMom,
} from "../../controllers/adminControllers/momControllers/mom.controller.js";
import {
  createLead,
  getAllLead,
  getSingleLead,
  leadToProject,
  updateLead,
} from "../../controllers/adminControllers/leadController/lead.controller.js";
import {
  createProject,
  getAllProject,
  getSingleProject,
  updateProjectDetails,
} from "../../controllers/adminControllers/projectController/project.controller.js";
import getQuotation, {getSingleTypeQuotation} from "../../controllers/adminControllers/quotationController/getQuotation.controller.js";
import { createQuotation } from "../../controllers/adminControllers/quotationController/quotation.controller.js";
import { updateQuotation } from "../../controllers/adminControllers/quotationController/update.quotation.controller.js";

router.route("/fileupload").post(fileupload);
router.route("/getfile").get(getFileData);
router.route("/get/onefile").get(getSingleFileData);



router.route("/create/project").post(createProject);
router.route("/getall/project").get( getAllProject);
router.route("/getsingle/project").get(getSingleProject);
router.route("/update/project").put(updateProjectDetails);

router.route("/create/lead").post(createLead);
router.route("/getall/lead").get(getAllLead);
router.route("/getsingle/lead").get(getSingleLead);
router.route("/update/lead").put(updateLead);
router.route("/create/lead/project").post(leadToProject);

router.route("/create/mom").post(createmom);
router.route("/getall/mom").get(getAllMom);
router.route("/getsingle/mom").get(getSingleMom);
router.route("/generate/pdf").get(generatePdf)
router.route("/getall/project/mom").get(getAllProjectMom)

router.route("/create/quotation").post(createQuotation);
router.route("/get/quotation").get(getQuotation);
router.route("/getsingle/quotation").get(getSingleTypeQuotation);
router.route("/update/quotation").put(updateQuotation);



export default router;
