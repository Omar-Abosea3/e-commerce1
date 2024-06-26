import slugify from "slugify";
import brandModel from "../../../DB/models/brandModel.js";
import categoryModel from "../../../DB/models/categoryModel.js";
import subCategoryModel from "../../../DB/models/subCategoryModel.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { nanoid } from "nanoid";
import productModel from "../../../DB/models/productModel.js";
import paginationFunction from "../../utils/pagination.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import couponModel from "../../../DB/models/couponModel.js";
import systemRoles from "../../utils/systemRoles.js";
import cartModel from "../../../DB/models/cartModel.js";
import wishlistModel from "../../../DB/models/wishlistModel.js";
import reviewModel from "../../../DB/models/reviewModel.js";
import Tesseract from "tesseract.js";
import fs from 'fs';
import axios from "axios";
import sharp from 'sharp';
export const addProduct = asyncHandeller(async (req, res, next) => {
    const { title , arTitle , desc , arDesc , appliedDiscount, price, colors, sizes, stok } =
      req.body;
    const { categoryId, subCategoryId, brandId } = req.query;
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(new Error("not founded category", { cause: 404 }));
    }
    const subCategory = await subCategoryModel.findById(subCategoryId);
    if (!subCategory) {
      return next(new Error("not founded subcategory", { cause: 404 }));
    }
    if(brandId){
      const brand = await brandModel.findById(brandId);
      if (!brand) {
        return next(new Error("not founded brand", { cause: 404 }));
      }
    }

    if (subCategory.categoryId != categoryId) {
      return next(
        new Error("not founded relation between this categories", {
          cause: 400,
        })
      );
    }

    const slug = slugify(title);
    const arSlug = slugify(arTitle);

    const priceAfterDiscount = Math.round(price - ((appliedDiscount || 0) / 100) * price);

    if (!req.files?.length) {
      return next(new Error("please upload pictures", { cause: 400 }));
    }
    const customId = nanoid();
    const images = [];
    const publicIds = [];
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}/Subcategory/${subCategory.customId}/Products/${customId}`,
        }
      );
      images.push({ secure_url, public_id });
      publicIds.push(public_id);
    }
    req.imagePath = `${process.env.PROJECT_FOLDER}/Categories/${category.customId}/Subcategory/${subCategory.customId}/Products/${customId}`;

    const productObject = {
      title,
      desc,
      arDesc,
      arTitle,
      price,
      appliedDiscount,
      priceAfterDiscount,
      colors,
      sizes,
      slug,
      arSlug,
      stok,
      categoryId,
      subCategoryId,
      images,
      customId,
      createdBy:req.user._id
    };

    if(brandId){
      productObject.brandId = brandId;
    }

    const product = await productModel.create(productObject);
    if (!product) {
      await cloudinary.api.delete_resources(publicIds);
      return next(
        new Error("product not added , try again later", { cause: 400 })
      );
    }
    return res
      .status(201)
      .json({ message: "product added successfully", product });
});

export const updateProduct = asyncHandeller(async (req, res, next) => {
    const { title, arTitle , desc , arDesc , appliedDiscount, price, colors, sizes, stok } =
      req.body;
    const { categoryId, subCategoryId, brandId, productId } = req.query;

    const product = await productModel.findById(productId);
    if (!product) {
      return next(new Error("not founded product", { cause: 404 }));
    }
    if (product.createdBy != req.user._id && req.user.role != systemRoles.SUPER_ADMIN) {
      return next(
        new Error("you dont have permission to edit this product", {
          cause: 403,
        })
      );
    }
    const category = await categoryModel.findById(
      categoryId || product.categoryId
    );
    if (categoryId) {
      if (!category) {
        return next(new Error("not founded category", { cause: 404 }));
      }
      product.categoryId = categoryId;
    }
    const subCategory = await subCategoryModel.findById(
      subCategoryId || product.subCategoryId
    );
    if (subCategoryId) {
      if (!subCategory) {
        return next(new Error("not founded subcategory", { cause: 404 }));
      }
      product.subCategoryId = subCategoryId;
    }
    const brand = await brandModel.findById(brandId || product.brandId);
    if (brandId) {
      if (!brand) {
        return next(new Error("not founded brand", { cause: 404 }));
      }
      product.brandId = brandId;
    }

    if (title) {
      product.title = title;
      const slug = slugify(title);
      product.slug = slug;
    }
    if (arTitle) {
      product.arTitle = arTitle;
      const arSlug = slugify(arTitle);
      product.arSlug = arSlug;
    }
    if (desc) product.desc = desc;
    if (arDesc) product.arDesc = arDesc;
    if (colors) product.colors = colors;
    if (sizes) product.sizes = sizes;
    if (stok) product.stok = stok;

    if (appliedDiscount && price) {
      const priceAfterDiscount = Math.round(price - ((appliedDiscount || 0) / 100) * price);
      product.priceAfterDiscount = priceAfterDiscount;
      product.price = price;
      product.appliedDiscount = appliedDiscount;
    } else if (price) {
      const priceAfterDiscount =
        Math.round(price - ((product.appliedDiscount || 0) / 100) * price);
      product.priceAfterDiscount = priceAfterDiscount;
      product.price = price;
    } else if (appliedDiscount) {
      const priceAfterDiscount =
        Math.round(product.price - ((appliedDiscount || 0) / 100) * product.price);
      product.priceAfterDiscount = priceAfterDiscount;
      product.appliedDiscount = appliedDiscount;
    }
    if (req.files?.length) {
      const images = [];
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}/Subcategory/${subCategory.customId}/Products/${product.customId}`,
          }
        );
        images.push({ secure_url, public_id });
      }
      const publicIds = [];
      for (const image of product.images) {
        publicIds.push(image.public_id);
      }
      await cloudinary.api.delete_resources(publicIds);
      product.images = images;
    }
    product.updatedBy = req.user._id;
    await product.save();
    return res.status(200).json({ message: "updated success", product });
});

export const deleteProduct = asyncHandeller(async (req, res, next) => {
    const { id } = req.params;
    const product = await productModel.findByIdAndDelete(id).populate([
      {
        path: "categoryId",
        select: "customId",
      },
      {
        path: "subCategoryId",
        select: "customId",
      }
    ]);
    if (!product) {
      return next(new Error("this product is not founded", { cause: 404 }));
    }
    if (product.createdBy != req.user._id && req.user.role != systemRoles.SUPER_ADMIN) {
      return next(
        new Error("you dont have permission to delete this product", {
          cause: 403,
        })
      );
    }
    const publicIds = [];
    for (const image of product.images) {
      publicIds.push(image.public_id);
    }
    await cloudinary.api.delete_resources(publicIds);
    await cloudinary.api.delete_folder(
      `${process.env.PROJECT_FOLDER}/Categories/${product.categoryId.customId}/Subcategory/${product.subCategoryId.customId}/Products/${product.customId}`
    );
    await reviewModel.deleteMany({productId:id});
    return res.status(200).json({ message: "deleted done", product });
});

export const getAllProducts = asyncHandeller(async (req, res, next) => {
  const { page, size } = req.query;
  const { limit, skip } = paginationFunction({ page, size });
  let products;
  if(page || size){
    products = await productModel
    .find()
    .populate([
      {
        path: "categoryId",
        select: 'name image'
      },
      {
        path: "subCategoryId",
        select: 'name image'
      },
      {
        path: "brandId",
        select: 'name logo'
      },
    ])
    .limit(limit)
    .skip(skip).select('title arTitle desc arDesc slug arSlug colors sizes price priceAfterDiscount appliedDiscount brandId rate images categoryId subCategoryId');
  }else{
    products = await productModel
    .find()
    .populate([
      {
        path: "categoryId",
        select: 'name image'
      },
      {
        path: "subCategoryId",
        select: 'name image'
      },
      {
        path: "brandId",
        select: 'name logo'
      },
    ])
    .select('title arTitle desc arDesc slug arSlug colors sizes price priceAfterDiscount brandId rate images categoryId subCategoryId');
  }
  if (products.length == 0) {
    return next(new Error("no products founded", { cause: 404 }));
  }
  return res.status(200).json({ message: "success", products });
});

export const getOneProduct = asyncHandeller(async (req, res, next) => {
  const { id } = req.params;
  console.log(process.env.SIGNETURE);
  const product = await productModel.findById(id).populate([
    {
      path:'Reviews'
    },
    {
      path:'brandId',
      select: 'name logo'
    },
    {
      path:"categoryId",
      select: 'name image'
    },
    {
      path:"subCategoryId",
      select: 'name image'
    }
  ]).select('title arTitle desc arDesc slug arSlug colors sizes price appliedDiscount stok priceAfterDiscount brandId rate images categoryId subCategoryId Reviews');
  if (!product) {
    return next(new Error("this product is not found", { cause: 404 }));
  }
  let coupons;
  if(req.user){
    coupons = await couponModel.find({"couponAssignedtoUsers.userId":req.user._id});
  }

  return res.status(209).json({ message: "success", product , coupons });
});

export const searchProduct = asyncHandeller(async (req, res, next) => {
  const { searchKey } = req.query;
  const products = await productModel.find({
    $or: [
      { title: { $regex: searchKey, $options: "i" } },
      { desc: { $regex: searchKey, $options: "i" } },
    ],
  }).populate([
    {
      path : 'brandId',
      select: 'name logo'
    },
    {
      path : 'categoryId',
      select:'name image'
    },
    {
      path : 'subCategoryId',
      select:'name image'
    }
]).select('title arTitle desc arDesc slug arSlug colors sizes price appliedDiscount priceAfterDiscount brandId rate images categoryId subCategoryId');
  if (products.length == 0) {
    return next(new Error("products not founded", { cause: 404 }));
  }
  return res.status(200).json({ message: "success", products });
});

export const filterProducts = asyncHandeller(async (req, res, next) => {
  let products;
  let productsLength;
  const hasKeys = !!Object.keys(req.query).length;
  console.log(hasKeys);
  // const numOfProducts = await productModel.find();
 
  if(hasKeys){
    const ApiFeaturesInstance = new ApiFeatures(productModel.find({}).populate([
      {
        path : 'brandId',
        select: 'name logo'
      },
      {
        path : 'categoryId',
        select:'name image'
      },
      {
        path : 'subCategoryId',
        select:'name image'
      }
  ]).select('title arTitle desc arDesc slug arSlug colors sizes price priceAfterDiscount brandId rate images categoryId subCategoryId'), req.query)
      .sort()
      .filters()
      .search()
      .pagination();
    products = await ApiFeaturesInstance.mongooseQuery;

    // getProductsLength
    const ApiFeaturesInstanceLength = new ApiFeatures(productModel.find({}).populate([
      {
        path : 'brandId',
        select: 'name logo'
      },
      {
        path : 'categoryId',
        select:'name image'
      },
      {
        path : 'subCategoryId',
        select:'name image'
      }
  ]).select('title arTitle desc arDesc slug arSlug colors sizes price priceAfterDiscount brandId rate images categoryId subCategoryId'), req.query)
      .sort()
      .filters()
      .search();
    productsLength = await ApiFeaturesInstanceLength.mongooseQuery;
  }else{
    products = await productModel.find({}).populate([
      {
        path : 'brandId',
        select: 'name logo'
      },
      {
        path : 'categoryId',
        select:'name image'
      },
      {
        path : 'subCategoryId',
        select:'name image'
      }
  ]).select('title arTitle desc arDesc slug arSlug colors sizes price appliedDiscount priceAfterDiscount brandId rate images categoryId subCategoryId');
  }

  if (products.length == 0) {
    return next(new Error("no products founded", { cause: 400 }));
  }
  console.log(productsLength.length , req.query.size);
  return res.status(200).json({ message: "success", products , numOfPages:Math.ceil(productsLength.length/parseInt(req.query.size)) });
});

export const searchProductWithTextFromImage = asyncHandeller(async( req , res , next )=>{
  const preprocessImage = async (inputPath, outputPath) => {
    await sharp(inputPath)
    .resize({ width: 800 }) // Resize for consistency (adjust as necessary)
    .grayscale() // Convert to grayscale
    .sharpen() // Sharpen the image
    .threshold(150) // Apply adaptive thresholding (adjust value as necessary)
    .toFile(outputPath);
  };
  const { imageLang , size , page} = req.query;
  const {limit , skip} = paginationFunction({page , size})
  const inputPath = `./uploads/${req.file.originalname}`;
  const outputPath = `./uploads/preprocessed_${req.file.originalname}`;

    // Preprocess the image
    await preprocessImage(inputPath, outputPath);
  console.log(req.file);
    const image = fs.readFileSync(outputPath, 
    {
        encoding:null
    });

    const { data: { text } } = await Tesseract.recognize(image , imageLang , { logger: m => console.log(m) });
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    console.log(text);
    const products = await productModel.find({
      $or: [
        { title: { $regex: text, $options: "i" } },
        { desc: { $regex: text, $options: "i" } },
        { arTitle: { $regex: text, $options: "i" } },
        { arDesc: { $regex: text, $options: "i" } },
      ],
    }).populate([
      {
        path : 'brandId',
        select: 'name logo'
      },
      {
        path : 'categoryId',
        select:'name image'
      },
      {
        path : 'subCategoryId',
        select:'name image'
      }
    ]).select('title arTitle desc arDesc slug arSlug colors sizes price priceAfterDiscount brandId rate images categoryId subCategoryId')
    .limit(limit)
    .skip(skip);
    const relatedProducts = [];
 

    if(products.length == 0 && relatedProducts.length == 0){
      return next(new Error("no products founded", { cause: 404 }));
    } 

    return res.status(200).json({message : 'success' , products , text  , numOfPages:Math.ceil(products.length/parseInt(size))});
});

export const searchProductsWithImage = asyncHandeller(async(req , res , next) => {
  const image = fs.readFileSync(`./uploads/${req.file.originalname}`, { encoding: null });
  if (!image) {
    return next(new Error('Please upload a photo', { cause: 400 }));
  }
  const formData = new FormData();
  const blob = new Blob([image], { type: req.file.mimetype });
  formData.append('image', blob, req.file.originalname);

  const {data} = await axios.post('https://2461-62-139-118-166.ngrok-free.app/predictTourismAPI', formData , {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if(data.error){
    return next(new Error(data.error , {cause:400}));
  }
  console.log(data);
  fs.unlinkSync(`./uploads/${req.file.originalname}`);
  const subCategory = await subCategoryModel.findOne(
      { name: { $regex: data.name, $options: "i" } },
   ).populate([
    {
      path : 'Products',
      select: 'title arTitle desc arDesc slug arSlug colors sizes price priceAfterDiscount brandId rate images categoryId subCategoryId',
      populate:[
        {
          path : 'brandId',
          select: 'name logo'
        },
        {
          path : 'categoryId',
          select:'name image'
        },
        {
          path : 'subCategoryId',
          select:'name image'
        }
      ]
    }, 
  ]);
  if (subCategory.Products.length == 0) {
    return next(new Error("no products founded", { cause: 404 }));
  }

  return res.status(200).json({message:'success' , products:subCategory.Products , numOfPages:Math.ceil(subCategory.Products.length/parseInt(30))});
});
