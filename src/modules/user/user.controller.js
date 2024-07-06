import { nanoid } from "nanoid";
import userModel from "../../../DB/models/userModel.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";

export const addProfilePicture = asyncHandeller(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  if (!req.file) {
    return next(new Error("you must upload a photo", { cause: 400 }));
  }
  if (!user.customId) {
    const customId = nanoid();
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Users/${customId}`,
      }
    );
    req.imagePath = `${process.env.PROJECT_FOLDER}/Users/${customId}`;
    user.profile_pic = { secure_url, public_id };
    user.customId = customId;
    await user.save();
  }
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/Users/${user.customId}`
  );
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Users/${user.customId}`,
    }
  );
  req.imagePath = `${process.env.PROJECT_FOLDER}/Users/${user.customId}`;
  user.profile_pic = { secure_url, public_id };
  await user.save();
  return res.status(200).json({ message: "done", user });
});

export const getAllUsers = asyncHandeller(async (req, res, next) => {
  if (req.user.role != "SuperAdmin") {
    return next(new Error("you not have permission to do this" , { cause: 403 }));
  }
  const users = await userModel.find();
  if (users.length == 0) {
    return next(new Error("no users found" , { cause: 403 }));
  }
  return res.status(200).json({ message: "success", users });
});

export const deleteUser = asyncHandeller(async (req, res, next) => {
  const { id } = req.query;
  let deletedUser;
  if (id) {
    if (req.user.role != "SuperAdmin") {
      return next(new Error("you not have permission to do this", { cause: 403 }));
    }
    if(await userModel.findById(id).role == "SuperAdmin"){
      return next(new Error("you not have permission to do this", { cause: 403 }));
    }
    deletedUser = await userModel.findByIdAndDelete(id);
    if (deletedUser) {
      return next(new Error("this user not founded", { cause: 404 }));
    }
    await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`);
    await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`);
    req.imagePath = `${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`;
  }
  deletedUser = await userModel.findByIdAndDelete(req.user._id);
  await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`);
  await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`);
  req.imagePath = `${process.env.PROJECT_FOLDER}/Users/${deletedUser.customId}`;
  return res.status(200).json({ message: "deleted success", deletedUser });
});

export const updateProfile = asyncHandeller(async (req, res, next) => {
  const { age, phone, firstName, lastName } = req.body;
  const user = await userModel.findById(req.user._id);
  if (age) {
    if (age < 14) {
      return next(new Error("this age not permited in our site", { cause: 400 }));
    };
    if (user.age == age) {
      return next(new Error("your age is same with your old one", { cause: 400 }));
    }
    user.age = age;
  }
  if (phone) {
    if (user.phone == phone) {
      return next(
        new Error("this number is already used by you", { cause: 400 })
      );
    }
    if (await userModel.findOne({ phone })) {
      return next(
        new Error("this number is already used by another account", {
          cause: 400,
        })
      );
    }
    user.phone = phone;
  }
  if (firstName) {
    if (user.firstName == firstName) {
      return next(
        new Error("your first name is same with your old one", { cause: 400 })
      );
    }
    user.firstName = firstName;
  }
  if (lastName) {
    if (user.lastName == lastName) {
      return next(
        new Error("your last name is same with your old one", { cause: 400 })
      );
    }
    user.lastName = lastName;
  }
  await user.save();
  return res.status(200).json({ message: "updated done", user });
});

export const getProfileInfo = asyncHandeller(async (req, res, next) => {
  const profileData = await userModel.findById(req.user._id, "-password -token -OTP -isConfirmEmail -tokens");
  return res.status(200).json({ message: "success", profileData });
});

export const searchForUsers = asyncHandeller(async (req, res, next) => {
  const { searchKey } = req.query;
  const {role} = req.user;

  if(role == 'SuperAdmin'){
  const users = await userModel.find({
    $or: [
      { email: { $regex: searchKey, $options: "i" } },
      { firstName: { $regex: searchKey, $options: "i" } },
      { lastName: { $regex: searchKey, $options: "i" } },
      { gender: { $regex: searchKey, $options: "i" } },
    ],
  });
  console.log(users);
  if (users.length == 0) {
    return next(new Error("no users found" , {cause:404}));
  }
  return res.status(200).json({ message: "success", users });
  }
  return next(new Error("you not have permission to do this" , { cause: 403 }));
});

export const logOutUser = asyncHandeller(async (req , res , next) => {
  const user = await userModel.findOne({_id:req.user._id});
  user.status = 'offline';
  user.isLoggedIn = false;
  const token = req.headers.bearertoken.slice('ecommerce__'.length);
  user.tokens.splice(user.tokens.indexOf(token) , 1);
  await user.save();
  return res.status(200).json({message:'success logging out'});
})