import slugify from "slugify";
import categoryModel from "../../../DB/models/categoryModel.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import brandModel from "../../../DB/models/brandModel.js";
import systemRoles from "../../utils/systemRoles.js";
import productModel from "../../../DB/models/productModel.js";


export const createSubCategory = asyncHandeller(async (req, res, next) => {
    const { name } = req.body;
    const { categoryId } = req.query;
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(new Error("invalid categoryId", { cause: 400 }));
    }
    if (await subCategoryModel.findOne({ name })) {
      return next(
        new Error("this name is already exist , enter another name ", {
          cause: 409,
        })
      );
    }
    const slug = slugify(name);
    if (!req.file) {
      return next(new Error("please upload a category image", { cause: 400 }));
    }
    const customId = nanoid();
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}/Subcategory/${customId}`,
      }
    );
    req.imagePath = `${process.env.PROJECT_FOLDER}/Categories/${category.customId}/Subcategory/${customId}`;
    const subCategoryObject = {
      name,
      slug,
      customId,
      categoryId,
      image: {
        secure_url,
        public_id,
      },
      createdBy: req.user._id,
    };

    const subCategory = await subCategoryModel.create(subCategoryObject);
    if (!subCategory) {
      await cloudinary.uploader.destroy(public_id);
      return next(new Error("try again later", { cause: 400 }));
    }

    return res.status(201).json({ message: "addad done", subCategory });
});

export const updateSubCategory = asyncHandeller(async (req, res, next) => {
    const { categoryId, subCategoryId } = req.query;
    const { name } = req.body;
    const subCategory = await subCategoryModel.findById(subCategoryId);
    if (!subCategory) {
      return next(new Error("this subCategory is not found", { cause: 404 }));
    }
    if (
      subCategory.createdBy != req.user._id &&
      req.user.role != systemRoles.SUPER_ADMIN
    ) {
      return next(
        new Error("you dont have permission to edit this subCategory", {
          cause: 403,
        })
      );
    }
    const category = await categoryModel.findById(
      categoryId || subCategory.categoryId
    );
    if (categoryId) {
      if (!category) {
        return next(new Error("this category is not found", { cause: 404 }));
      }
      subCategory.categoryId = categoryId;
    }
    if (name) {
      if (subCategory.name == name) {
        return next(
          new Error("new name is must different to the previuos name", {
            cause: 400,
          })
        );
      }
      const slug = slugify(name);
      subCategory.name = name;
      subCategory.slug = slug;
    }
    if (req.file) {
      await cloudinary.uploader.destroy(subCategory.image.public_id);
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}/Subcategory/${subCategory.customId}`,
        }
      );
      subCategory.image = { secure_url, public_id };
    }
    subCategory.updatedBy = req.user._id;
    await subCategory.save();
    return res.status(200).json({ message: "upbated done", subCategory });
});

export const deleteSubCategory = asyncHandeller(async (req, res, next) => {
    const { subCategoryId } = req.params;
    const subCategory = await subCategoryModel
      .findByIdAndDelete(subCategoryId)
      .populate([
        {
          path: "categoryId",
          select: "customId",
        },
        {
          path: "Brands",
        },
        {
          path: "Products",
          populate: [
            {
              path: "categoryId",
              select: "slug image",
            },
            {
              path: "subCategoryId",
              select: "slug image",
            },
            {
              path: "brandId",
              select: "slug logo",
            },
          ],
        },
      ]);
    if (!subCategory) {
      return next(new Error("this subcategory Not found", { cause: 404 }));
    }
    if (
      subCategory.createdBy != req.user._id &&
      req.user.role != systemRoles.SUPER_ADMIN
    ) {
      return next(
        new Error("you dont have permission to delete this subCategory", {
          cause: 403,
        })
      );
    }
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.PROJECT_FOLDER}/Categories/${subCategory.categoryId.customId}/Subcategory/${subCategory.customId}`
    );
    await productModel.deleteMany({subCategoryId});
    return res
      .status(200)
      .json({ message: "deleted successfully", subCategory });
});

export const getSubCategories = asyncHandeller(async (req, res, next) => {
  const subCategories = await subCategoryModel.find().populate([
    {
      path: "categoryId",
      select: "slug image",
    },
  ]);
  if (subCategories.length == 0) {
    return next(new Error("not founded subCategories", { cause: 404 }));
  }
  return res.status(200).json({ message: "success", subCategories });
});

export const getOneSubCategory = asyncHandeller(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await subCategoryModel.findById(id).populate([
    {
      path: "categoryId",
      select: "slug image",
    },
    {
      path: "Products",
      populate: [
        {
          path: "brandId",
          select: "name logo",
        },
      ],
      select:'title desc colors sizes price priceAfterDiscount brandId rate images categoryId subCategoryId'
    },
  ]);
  if (!subCategory) {
    return next(new Error("not founded subCategory", { cause: 404 }));
  }
  return res.status(200).json({ message: "succeess", subCategory });
});

export const searchSubCategory = asyncHandeller(async (req, res, next) => {
  const { searchKey } = req.query;
  const SubCategories = await subCategoryModel.find({
    name: { $regex: searchKey, $options: "i" },
  });
  if (SubCategories.length == 0) {
    return next(new Error("SubCategories not founded", { cause: 404 }));
  }
  return res.status(200).json({ message: "success", SubCategories });
});