import { ParamsDictionary } from "express-serve-static-core";
import Applicant from "../../models/applicantModel";
import { validateMongoDBId } from "../../utils/validateMongoDBId";
import { generateRefreshToken } from "../../utils/generateRefreshToken";
import { generateToken } from "../../utils/jwtToken";

const createNewApplicant = async (body: any) => {
  const email = body.email;

  const findApplicant = await Applicant.findOne({ email: email });
  if (!findApplicant) {
    const newApplicant = await Applicant.create(body);
    return newApplicant;
  } else {
    throw new Error("Applicant already exist");
  }
};

const applicantLogin = async (data: { email: string; password: string }) => {
  const { email, password } = data;

  const findApplicant = await Applicant.findOne({ email });

  if (findApplicant && (await findApplicant.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findApplicant?._id);
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      findApplicant?._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );

    return {
      _id: findApplicant?._id,
      firstname: findApplicant?.firstname,
      lastname: findApplicant?.lastname,
      token: generateToken(findApplicant?._id),
      refreshToken,
    };
  } else {
    throw new Error("Invalid credentials!");
  }
};

const getAllApplicants = async () => {
  const applicant = await Applicant.find();
  return applicant;
};

const getOneApplicant = async (data: ParamsDictionary) => {
  const { id } = data;
  validateMongoDBId(id);

  const getApp = await Applicant.findById(id);
  return getApp;
};

const updateApplicant = async (body: any) => {
  const { _id, firstname, lastname, email } = body;
  validateMongoDBId(_id);
  const updateData = {
    firstname: firstname || undefined,
    lastname: lastname || undefined,
    email: email || undefined,
  };

  const updatedApplicant = await Applicant.findByIdAndUpdate(_id, updateData, {
    new: true,
  });
  return updatedApplicant;
};

const deleteApplicant = async (data: ParamsDictionary) => {
  const { id } = data;
  validateMongoDBId(id);
  const deleteApp = await Applicant.findByIdAndDelete(id);
  return deleteApp;
};

export {
  createNewApplicant,
  getAllApplicants,
  getOneApplicant,
  applicantLogin,
  deleteApplicant,
  updateApplicant,
};
