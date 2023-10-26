import brandModel from "../../../DB/models/brandModel.js";
import productModel from "../../../DB/models/productModel.js";
import wishlistModel from "../../../DB/models/wishlistModel.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";

export const addtoWishlist = asyncHandeller(async (req , res , next) => {
    const userId= req.user._id;
    const {productId , brandId} = req.query;
    let product; 
    let productsArray = [];
    let brand; 
    let brandsArray = [];
    const wishlistObject = {};
    const userWishlist = await wishlistModel.findOne({userId});
    if(!userWishlist){
        if(productId){
            product = await productModel.findById(productId);
            if(!product){
                return next(new Error('this product has been deleted' , {cause : 404}));
            }
            productsArray.push(product);
        }
        if(brandId){
            brand = await brandModel.findById(brandId);
            if(!brand){
                return next(new Error('this brand has been deleted' , {cause : 404}));
            }
            brandsArray.push(brand);
        }
        wishlistObject.userId = userId;
        wishlistObject.products = productsArray;
        wishlistObject.brands = brandsArray;
        const wishlist = await wishlistModel.create(wishlistObject);
        if(!wishlist){
            return next(new Error('wishlist not created' , {cause : 400}));
        }
        return res.status(201).json({message:'wishlist created successfully' , wishlist});
    }
    if(productId){
        product = await productModel.findById(productId);
        if(!product){
            return next(new Error('this product has been deleted' , {cause : 404}));
        }
        for (const newProduct of userWishlist.products) {
            if(newProduct.toString() == product._id.toString()){
                return next(new Error('this Product already added to wishlist one time' , {cause:409}));
            }
        }
        userWishlist.products.push(product);
    }
    if(brandId){
        brand = await brandModel.findById(brandId);
        if(!brand){
            return next(new Error('this brand has been deleted' , {cause : 404}));
        }
        for (const newBrand of userWishlist.brands) {
            if(newBrand.toString() == brand._id.toString()){
                return next(new Error('this brand already added to wishlist one time' , {cause:409}));
            }
        }
        userWishlist.brands.push(brand);
    }

    await userWishlist.save();
    return res.status(200).json({message:'added success' , userWishlist});
});

export const removeProductFromWishlist = asyncHandeller(async (req , res , next) => {
    const userId = req.user._id;
    const {productId} = req.params;
    const userWishlist = await wishlistModel.findOne({userId});
    if(!userWishlist){
        return next(new Error('you do not have a wishlist' , {cause : 404}));
    }
    if(!productId){
        return next(new Error('select product to remove it'))
    }
    if(!userWishlist.products.length){
        return next(new Error('not founded product to remove it',{cause: 404}));
    }
    const productsLength = userWishlist.products.length;
    for (const product  of userWishlist.products) {
        if(product.toString() == productId){
            userWishlist.products.splice(userWishlist.products.indexOf(product), 1);
        }
    }
    if(userWishlist.products.length == productsLength){
        return next(new Error('invalid product id' , {cause : 400}));
    }
    await userWishlist.save();
    return res.status(200).json({message:'product removed successfully' , userWishlist});
});

export const removeBrandFromWishlist = asyncHandeller(async (req , res , next) => {
    const userId = req.user._id;
    const {brandId} = req.params;
    const userWishlist = await wishlistModel.findOne({userId});
    if(!userWishlist){
        return next(new Error('you do not have a wishlist' , {cause : 404}));
    }
    if(!brandId){
        return next(new Error('select brand to remove it'))
    }

    if(!userWishlist.brands.length){
        return next(new Error('not founded brands to remove it',{cause: 404}));
    }
    const brandsLength = userWishlist.brands.length;
    for (const brand  of userWishlist.brands) {
        if(brand.toString() == brandId){
            userWishlist.brands.splice(userWishlist.brands.indexOf(brand), 1);
        }
    }
    if(userWishlist.brands.length == brandsLength){
        return next(new Error('invalid brand id' , {cause : 400}));
    }
    
    await userWishlist.save();
    return res.status(200).json({message:'brand removed successfully' , userWishlist});
});

export const removeAllWishlistProducts = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const wishlist = await wishlistModel.findOne({userId});
    if(!wishlist){
        return next(new Error('you do not have a wishlist to remove from it' , {cause:404}));
    }
    if(!wishlist.products.length){
        return next(new Error('no products to remove it' , {cause : 400}));
    }
    wishlist.products = [];
    await wishlist.save();
    return res.status(200).json({message:'products removed successfully'})
});

export const removeAllWishlistBrands = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const wishlist = await wishlistModel.findOne({userId});
    if(!wishlist){
        return next(new Error('you do not have a wishlist to remove from it' , {cause:404}));
    }
    if(!wishlist.brands.length){
        return next(new Error('no brands to remove it' , {cause : 400}));
    }
    wishlist.brands = [];
    await wishlist.save();
    return res.status(200).json({message:'brands removed successfully'})
});

export const getAllWishlistProducts = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const wishlist = await wishlistModel.findOne({userId});
    if (!wishlist || !wishlist.products.length){
        return next(new Error('you may not have a wishlist or not have products in it' , {cause : 404}));
    }

    for (const product of wishlist.products) {
        if(! await productModel.findById(product)){
            wishlist.products.splice(wishlist.products.indexOf(product) , 1);
        }
    }
    await wishlist.save();
    
    const products = await productModel.find({_id:{$in:wishlist.products}}).select('title colors sizes price priceAfterDiscount brandId images categoryId subCategoryId').populate([
    {
        path:'brandId',
        select:'name logo'
    },
    {
        path:'categoryId',
        select:'name image'
    },
    {
        path:'subCategoryId',
        select:'name image'
    }
]);
    if(!products.length){
        return next(new Error('products may be deleted' , {cause : 400}));
    }
    return res.status(200).json({message:'success' , wishlistProducts:products});
});

export const getAllWishlistBrands = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const wishlist = await wishlistModel.findOne({userId});
    if (!wishlist || !wishlist.brands.length){
        return next(new Error('you may not have a wishlist or not have brands in it' , {cause : 404}));
    }
    for (const brand of wishlist.brands) {
        if(! await brandModel.findById(brand)){
            wishlist.brands.splice(wishlist.brands.indexOf(brand) , 1);
        }
    }
    await wishlist.save();
    const brands = await brandModel.find({_id:{$in:wishlist.brands}}).select('name logo');
    if(!brands.length){
        return next(new Error('brands may be deleted' , {cause : 400}));
    }
    return res.status(200).json({message:'success' , wishlistBrands:brands});
});