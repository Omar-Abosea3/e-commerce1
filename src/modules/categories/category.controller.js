import { nanoid } from "nanoid";
import categoryModel from "../../../DB/models/categoryModel.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import slugify from "slugify";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import brandModel from "../../../DB/models/brandModel.js";
import productModel from "../../../DB/models/productModel.js";
import systemRoles from "../../utils/systemRoles.js";

export const createCategory = asyncHandeller(async (req, res, next) => {
    const { name , arName} = req.body;
    const slug = slugify(name);
    const arSlug = slugify(arName);

    if (await categoryModel.findOne({ $or: [{ name }, { arName }] })) {
      return next(
        new Error("this name is already exist please enter differnt name", {
          cause: 400,
        })
      );
    }

    if (!req.file) {
      return next(
        new Error("please upload the category image", { cause: 400 })
      );
    }
    const customId = nanoid();
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${customId}`,
      }
    );
    req.imagePath = `${process.env.PROJECT_FOLDER}/Categories/${customId}`;

    const categoryObject = {
      name,
      arName,
      slug,
      arSlug,
      image: {
        secure_url,
        public_id,
      },
      customId,
    };

    const category = await categoryModel.create(categoryObject);
    if (!category) {
      await cloudinary.uploader.destroy(public_id);
      return next(
        new Error("try again later , fail to add your category", { cause: 400 })
      );
    }
    return res.status(201).json({ message: "added done", category });
});

export const updateCategory = asyncHandeller(async (req, res, next) => {
    const { categoryId } = req.params;
    const { name , arName} = req.body;
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(
        new Error("invalid category id or this category not found", {
          cause: 404,
        })
      );
    }
    if (category.createdBy != req.user._id && req.user.role != systemRoles.SUPER_ADMIN) {
      return next(
        new Error("you dont have permission to edit this category", {
          cause: 403,
        })
      );
    }
    if (name) {
      if (category.name == name) {
        return next(
          new Error("please enter different name for this category", {
            cause: 400,
          })
        );
      }
      if (await categoryModel.findOne({ name })) {
        return next(
          new Error(
            "please enter a different category name , it is dublicated name",
            { cause: 409 }
          )
        );
      }
      category.name = name;
      category.slug = slugify(name);
    }
    if (arName) {
      if (category.arName == arName) {
        return next(
          new Error("please enter different name for this category", {
            cause: 400,
          })
        );
      }
      if (await categoryModel.findOne({ arName })) {
        return next(
          new Error(
            "please enter a different category name , it is dublicated name",
            { cause: 409 }
          )
        );
      }
      category.arName = arName;
      category.arSlug = slugify(arName);
    }

    if (req.file) {
      await cloudinary.uploader.destroy(category.image.public_id);
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}`,
        }
      );
      category.image = { secure_url, public_id };
    }
    category.updatedBy = req.user._id;
    await category.save();
    return res.status(200).json({ message: "updated done", category });
});

export const deleteCategory = asyncHandeller(async (req, res, next) => {
    const { categoryId } = req.params;
    const category = await categoryModel
      .findByIdAndDelete(categoryId)
      .populate([
        {
          path: "subCategories",
        }
      ]);

    if (!category) {
      return next(new Error("this Category Not Found", { cause: 404 }));
    }
    if (category.createdBy != req.user._id && req.user.role != systemRoles.SUPER_ADMIN) {
      return next(
        new Error("you dont have permission to delete this category", {
          cause: 403,
        })
      );
    }

    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.PROJECT_FOLDER}/Categories/${category.customId}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.PROJECT_FOLDER}/Categories/${category.customId}`
    );

    await subCategoryModel.deleteMany({ categoryId });

    await productModel.deleteMany({ categoryId });

    return res.status(200).json({ message: "deleted success", category });
});

export const getAllCategories = asyncHandeller(async (req, res, next) => {
  const categories = await categoryModel.find();

  if (categories.length == 0) {
    return next(new Error("not founded categories", { cause: 404 }));
  }

  return res.status(200).json({ message: "success", categories });
});

export const getOneCategory = asyncHandeller(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findById(id).populate([
    {
      path: "subCategories",
    },
    {
      path: "Products",
      populate: [
        {
          path: "subCategoryId",
          select: "slug image",
        },
        {
          path: "brandId",
          select: "slug logo",
        },
      ],
      select:'title arTitle appliedDiscount desc arDesc slug arSlug colors sizes price priceAfterDiscount brandId rate images categoryId subCategoryId'
    },
  ]);

  if (!category) {
    return next(new Error("not founded category", { cause: 404 }));
  }

  return res.status(200).json({ message: "success", category });
});

export const searchCategory = asyncHandeller(async (req, res, next) => {
  const { searchKey } = req.query;
  const categories = await categoryModel.find({
    $or: [
      { name: { $regex: searchKey, $options: "i" }}, 
      { arName: { $regex: searchKey, $options: "i" }}
    ],
  });
  if (categories.length == 0) {
    return next(new Error("categories not founded", { cause: 404 }));
  }
  return res.status(200).json({ message: "success", categories });
});