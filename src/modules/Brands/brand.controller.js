import slugify from "slugify";
import categoryModel from "../../../DB/models/categoryModel.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { nanoid } from "nanoid";
import brandModel from "../../../DB/models/brandModel.js";
import productModel from "../../../DB/models/productModel.js";
import systemRoles from "../../utils/systemRoles.js";

export const addBrand = asyncHandeller(async (req, res, next) => {
    const { name } = req.body;
    const slug = slugify(name);

    if (!req.file) {
      return next(
        new Error("please upload the logo of the brand", { cause: 400 })
      );
    }
    const customId = nanoid();
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Brands/${customId}`,
      }
    );
    req.imagePath = `${process.env.PROJECT_FOLDER}/Brands/${customId}`;

    const brandObject = {
      name,
      slug,
      logo: {
        secure_url,
        public_id,
      },
      customId,
      createdBy:req.user._id
    };

    const brand = await brandModel.create(brandObject);
    if (!brand) {
      await cloudinary.uploader.destroy(public_id);
      return next(
        new Error("brand not added , try again later", { cause: 400 })
      );
    }
    return res.status(201).json({ message: "added done", brand });
});

export const updateBrand = asyncHandeller(async (req, res, next) => {
    const { brandId } = req.query;
    const { name } = req.body;
    const brand = await brandModel.findById(brandId);
    if (!brand) {
      return next(new Error("not founded brand", { cause: 404 }));
    }
    if (brand.createdBy != req.user._id && req.user.role != systemRoles.SUPER_ADMIN) {
      return next(
        new Error("you dont have permission to edit this brand", { cause: 403 })
      );
    }
    if (name == brand.name || (await brandModel.findOne({ name }))) {
      return next(
        new Error("this brand is already founded , please enter new name", {
          cause: 409,
        })
      );
    }
    const slug = slugify(name);
    brand.name = name;
    brand.slug = slug;
    if (req.file) {
      await cloudinary.uploader.destroy(brand.logo.public_id);
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Brands/${brand.customId}`,
        }
      );
      brand.logo = { secure_url, public_id };
    }
    brand.updatedBy = req.user._id;
    await brand.save();
    return res.status(200).json({ message: "updated done", brand });
});

export const deleteBrand = asyncHandeller(async (req, res, next) => {
    const { brandId } = req.params;
    const brand = await brandModel.findOne(brandId);
    if (!brand) {
      return next(new Error("not founded brand", { cause: 404 }));
    }
    if (brand.createdBy != req.user._id && req.user.role != systemRoles.SUPER_ADMIN) {
      return next(
        new Error("you dont have permission to delete this brand", {
          cause: 403,
        })
      );
    }
    await brandModel.deleteOne({_id:brandId});

    const products = await productModel.deleteMany({ brandId });
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.PROJECT_FOLDER}/Brands/${brand.customId}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.PROJECT_FOLDER}/Brands/${brand.customId}`
    );

    return res.status(200).json({ message: "deleted done", brand });
});

export const getAllBrands = asyncHandeller(async (req, res, next) => {
  const brands = await brandModel.find().select('name slug logo subCategoryId categoryId');
  if (brands.length == 0) {
    return next(new Error("not founded brands", { cause: 404 }));
  }

  return res.status(200).json({ message: "success", brands });
});

export const getOneBrand = asyncHandeller(async (req, res, next) => {
  const { id } = req.params;
  const brand = await brandModel.findById(id).populate([
    {
      path: "Products",
      select:'title desc colors sizes price priceAfterDiscount brandId rate images categoryId subCategoryId'
    },
  ]).select('name slug logo subCategoryId categoryId');
  if (!brand) {
    return next(new Error("not founded brand", { cause: 404 }));
  }
  return res.status(200).json({ message: "success", brand });
});

export const searchBrand = asyncHandeller(async (req, res, next) => {
  const { searchKey } = req.query;
  const brands = await brandModel.find({
    name: { $regex: searchKey, $options: "i" },
  }).select('name slug logo subCategoryId categoryId');
  if (brands.length == 0) {
    return next(new Error("brands not founded", { cause: 404 }));
  }
  return res.status(200).json({ message: "success", brands });
});


