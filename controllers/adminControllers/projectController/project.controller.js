import projectModel from "../../../models/adminModels/project.model.js";
import { responseData } from "../../../utils/respounse.js";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import registerModel from "../../../models/usersModels/register.model.js";
import {
  onlyAlphabetsValidation,
  onlyEmailValidation,
  onlyPhoneNumberValidation,
} from "../../../utils/validation.js";
import validator from "validator";
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}

const uploadFile = async (file, fileName, project_ID) => {
  return s3
    .upload({
      Bucket: `interior-design1/${project_ID}`,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
      // ACL: 'public-read'
    })
    .promise();
};

export const createProject = async (req, res) => {
  const id = req.body.id;
  const project_name = req.body.project_name;
  const project_type = req.body.project_type;
  const client_name = req.body.client_name;
  const description = req.body.description;
  const leadmanager = req.body.leadmanager;
  const junior_designer = req.body.junior_designer;
  const senior_designer = req.body.senior_designer;
  const superviser = req.body.supervisor;
  const visualizer = req.body.visualizer;
  const project_status = req.body.project_status;
  const project_start_date = req.body.project_start_date;
  const timeline_date = req.body.timeline_date;
  const project_budget = req.body.project_budget;
  const project_location = req.body.project_location;
  const client_contact = req.body.client_contact;
  const client_email = req.body.client_email;
  const project_ID = generateSixDigitNumber();

  // here we validate all fields
  if (!onlyAlphabetsValidation(project_name) && project_name.length > 2) {
    responseData(res, "", 400, false, "project name required");
  } else if (!onlyAlphabetsValidation(project_type) && project_type > 2) {
    responseData(res, "", 400, false, "project type required");
  } else if (!onlyAlphabetsValidation(client_name) && client_name.length >= 3) {
    responseData(res, "", 400, false, "client name required");
  } else if (!onlyAlphabetsValidation(leadmanager) && leadmanager.length >= 3) {
    responseData(res, "", 400, false, "lead manager required");
  } else if (
    !onlyAlphabetsValidation(junior_designer) &&
    junior_designer.length >= 3
  ) {
    responseData(res, "", 400, false, "junior designer name required");
  } else if (
    !onlyAlphabetsValidation(senior_designer) &&
    senior_designer.length >= 3
  ) {
    responseData(res, "", 400, false, "senior designer name  required");
  } else if (!onlyAlphabetsValidation(superviser) && superviser.length >= 3) {
    responseData(res, "", 400, false, "superviser name  required");
  } else if (!onlyAlphabetsValidation(visualizer) && visualizer.length >= 3) {
    responseData(res, "", 400, false, "visualizer name  required");
  } else if (
    !project_budget &&
    !project_start_date &&
    !timeline_date &&
    !project_status
  ) {
    responseData(res, "", 400, false, "Please fill  required field ");
  } else if (!onlyPhoneNumberValidation(client_contact)) {
    responseData(
      res,
      "",
      400,
      false,
      "Please enter valid client contact number"
    );
  } else if (!onlyEmailValidation(client_email)) {
    responseData(res, "", 400, false, "Please enter valid client email");
  }

  /// ***** add validation here ****///
  else {
    try {
      const check_role = await registerModel.find({ _id: id });
      if (check_role.length > 0) {
        if (check_role[0].role == "ADMIN") {
          const files = req.files?.files;
          const fileUploadPromises = [];
          // Limit the number of files to upload to at most 5
          const filesToUpload = Array.isArray(files) ? files.slice(0, 5) : [];
          for (const file of filesToUpload) {
            const fileName = Date.now() + file.name;
            fileUploadPromises.push(uploadFile(file, fileName, project_ID));
          }
          const responses = await Promise.all(fileUploadPromises);
          const fileUploadResults = responses.map((response) => ({
            status: response.Location ? true : false,
            data: response ? response : response.err,
          }));

          const successfullyUploadedFiles = fileUploadResults.filter(
            async (result) => result.data
          );
          let file = [];
          if (successfullyUploadedFiles.length > 0) {
            const newfileuploads = successfullyUploadedFiles.map(
              (result, index) => file.push(result.data.Location)
            );
            await Promise.all(newfileuploads);

            const project_data = await projectModel.create({
            
              project_name: project_name,
              client_name: client_name,
              project_id: `COL\P-${project_ID}`,
              project_type: project_type,
              description: description,
              leadmanager: leadmanager,
              designers: [
                {
                  junior_designer: [
                    {
                      name: junior_designer,
                      status: "working",
                      id: generateSixDigitNumber(),
                    },
                  ],
                  senior_designer: [
                    {
                      name: senior_designer,
                      status: "working",
                      id: generateSixDigitNumber(),
                    },
                  ],
                },
              ],
              superviser: superviser,
              visualizer: visualizer,
              project_status: project_status,
              project_start_date: project_start_date,
              timeline_date: timeline_date,
              project_end_date: timeline_date,
              project_budget: `${project_budget} ₹`,
              project_location: project_location,
              files: file,
              client: {
                client_name: client_name,
                client_contact: client_contact,
                client_email: client_email,
              },
            });
            responseData(
              res,
              "Project Create Successfully!",
              200,
              true,
              "",
              project_data
            );
          } else {
            const project_data = await projectModel.create({
            
              project_name: project_name,
              client_name: client_name,
              project_id: `COL\P-${project_ID}`,
              project_type: project_type,
              description: description,
              leadmanager: leadmanager,
              designers: [
                {
                  junior_designer: [
                    {
                      name: junior_designer,
                      status: "working",
                      id: generateSixDigitNumber(),
                    },
                  ],
                  senior_designer: [
                    {
                      name: senior_designer,
                      status: "working",
                      id: generateSixDigitNumber(),
                    },
                  ],
                },
              ],
              superviser: superviser,
              visualizer: visualizer,
              project_status: project_status,
              project_start_date: project_start_date,
              timeline_date: timeline_date,
              project_end_date: timeline_date,
              project_budget: `${project_budget} ₹`,
              project_location: project_location,
              files: file,
              client: {
                client_name: client_name,
                client_contact: client_contact,
                client_email: client_email,
              },
            });
            responseData(
              res,
              "Project Create Successfully!",
              200,
              true,
              "",
              project_data
            );
          }
        } else {
          responseData(res, "", 404, false, " You are not admin!", []);
        }

        if (check_role.length < 1) {
          responseData(res, "", 404, false, " User not found.", []);
        }
      }
    } catch (err) {
      res.send(err);
      console.log(err);
    }
  }
};

// Function to check if the project is older than 6 months
function isProjectOlderThan6Months(createdDate) {
  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in months
  const diffMonths =
    (currentDate.getFullYear() - createdDate.getFullYear()) * 12 +
    (currentDate.getMonth() - createdDate.getMonth());

  // Check if the difference is greater than or equal to 6 months
  return diffMonths >= 6;
}

// Example usage

export const getAllProject = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      responseData(res, "", 400, false, "user id is required");
    } else {
      const check_role = await registerModel.find({ _id: id });
      if (check_role.length > 0) {
        if (check_role[0].role == "ADMIN") {
          let execution = [];
          let design = [];
          let completed = [];
          let archive = [];
          const projects = await projectModel.find({});
          for (let i = 0; i < projects.length; i++) {
            if (projects[i].project_status == "execution") {
              execution.push(projects[i]);
            }
            if (projects[i].project_status == "design") {
              design.push(projects[i]);
            }
            if (projects[i].project_status == "completed") {
              completed.push(projects[i]);
              const createdDate = projects[i].project_end_date;
              const isOlderThan6Months = isProjectOlderThan6Months(createdDate);
              if (isOlderThan6Months) {
                archive.push(isOlderThan6Months);
              }
            }
          }

          const response = {
            total_Project: projects.length,
            Execution_Phase: execution.length,
            Design_Phase: design.length,
            completed: completed.length,
            archive: archive.length,
            projects,
          };
          responseData(
            res,
            "projects fetched successfully",
            200,
            true,
            "",
            response
          );
        } else {
          responseData(res, "", 404, false, " You are not admin!", []);
        }
      }
      if (check_role.length < 1) {
        responseData(res, "", 404, false, " User not found.", []);
      }
    }
  } catch (error) {
    responseData(res, "", 500, false, "error in fetching projects");
  }
};

export const getSingleProject = async (req, res) => {
  const project_ID = req.query.project_id;
  const id = req.query.id;

  if (!project_ID) {
    responseData(res, "", 404, false, " Project ID is required.", []);
  } else if (!id) {
    responseData(res, "", 404, false, " User ID is required.", []);
  } else {
    try {
      const check_role = await registerModel.find({ _id: id });
      if (check_role.length < 1) {
        responseData(res, "", 404, false, " User not found.", []);
      }
      if (check_role.length > 0) {
        if (check_role[0].role == "ADMIN") {
          const find_project = await projectModel.find({
            project_id: project_ID,
          });
          if (find_project.length > 0) {
            responseData(res, "project found", 200, true, "", find_project);
          }
          if (find_project < 1) {
            responseData(res, "", 404, false, "project not found", []);
          }
        } else {
          responseData(res, "", 404, false, " You are not admin!", []);
        }
      }
    } catch (err) {
      responseData(res, "", 500, false, "error in fetching projects", err);
      console.log(err);
    }
  }
};

export const updateProjectDetails = async (req, res) => {
  const project_ID = req.body.project_id;
  const leadmanager = req.body.leadmanager;
  const timeline_date = req.body.timeline_date;
  const project_budget = req.body.project_budget;

  if (!project_ID) {
    responseData(res, "", 400, false, " Project ID is required.", []);
  } else if (!timeline_date) {
    responseData(res, "", 400, false, " timeline_date is required.", []);
  } else if (!project_budget) {
    responseData(res, "", 400, false, " project_budget is required.", []);
  } else if (!onlyAlphabetsValidation(leadmanager) && leadmanager.length > 2) {
    responseData(res, "", 400, false, "Invalid leadmanager name", []);
  }

  //  *********** add other validation **********//
  else {
    try {
      const project_find = await projectModel.find({ project_id: project_ID });
      if (project_find.length > 0) {
        const project_update = await projectModel.findOneAndUpdate(
          { project_id: project_ID },
          {
            $set: {
              project_budget: `${project_budget} ₹`,
              leadmanager: leadmanager,
              timeline_date: timeline_date,
            },
          },
          { new: true, useFindAndModify: false }
        );

        responseData(
          res,
          "Project Data Updated",
          200,
          true,
          "",
          project_update
        );
      }
      if (project_find.length < 1) {
        responseData(res, "", 404, false, "Project Data Not Found", []);
      }
    } catch (err) {
      res.send(err);
      console.log(err);
    }
  }
};
