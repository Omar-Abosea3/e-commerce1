import cartModel from "../../../DB/models/cartModel.js";
import productModel from "../../../DB/models/productModel.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";


export const addToCart = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const { productId , quantity} = req.body;
    const myProduct = await productModel.findOne({ _id: productId ,stok:{$gte : quantity}});
    if(!myProduct){
        return next(new Error('invalid product or not suitable product quantity' , {cause : 400}));
    }
    // lean() => with find only and convert PSON to Object 
    const userCart = await cartModel.findOne({userId}).lean();
    if(userCart){
        // update quantity .
        let isProductExist = false;
        userCart.products.find((product) => {
            if(product.productId.toString() == productId){
                isProductExist = true;
                if(product.quantity + quantity > myProduct.stok){
                    return next ( new Error(`this quantity not available now the available quantity is ${myProduct.stok}` , {cause:400}))  
                }
                product.quantity += quantity ; 
                product.totalProductPrice += quantity * myProduct.priceAfterDiscount
            }
        }); 
        if(!isProductExist){
            userCart.products.push({productId , quantity:quantity , totalProductPrice:quantity * myProduct.priceAfterDiscount}); 
        }
        let supTotal = 0
        for (const product of userCart.products) {
          const productExists = await productModel.findById(product.productId);
          supTotal += (productExists.priceAfterDiscount * product.quantity )|| 0;
        }
        const newCart = await cartModel.findOneAndUpdate({userId} , {products:userCart.products , supTotal}, {new:true});
        return res.status(200).json({message:"done" , newCart})
    }
    const totalProductPrice = myProduct.priceAfterDiscount * quantity;
    const cartObject = {
        userId,
        products:[{productId , quantity , totalProductPrice}],
        supTotal:myProduct.priceAfterDiscount * quantity 
    };
    const cart = await cartModel.create(cartObject);
    myProduct.stok -= quantity;
    await myProduct.save()
    return res.status(200).json({message:'done' , cart});
});

export const removeFromCart = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const { productId } = req.body;
    const findProduct = await productModel.findById(productId);
    if(!findProduct){
        return next(new Error('this product has been removed from data' , {cause:404}));
    }
    const userCart = await cartModel.findOne({userId});
    if(!userCart){
        return next(new Error('this user cart is empty' , {cause:404}));
    }
    let supTotal = userCart.supTotal;
    if(!userCart.products.length){
        return next(new Error('not founded product for remove it'));
    }
    userCart.products.forEach(async (product) => {
        if(product.productId == productId){
            userCart.products.splice(userCart.products.indexOf(product), 1);
            supTotal -= findProduct.priceAfterDiscount * product.quantity;
        }
    });
    await userCart.save();
    const newCart = await cartModel.findOneAndUpdate({userId} , {products:userCart.products , supTotal}, {new:true});
    return res.status(200).json({message:'removed' , newCart});
});

export const increamentCounter = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const defaultQuantity = 1;
    const { productId , quantity } = req.body;
    const myProduct = await productModel.findOne({ _id: productId ,stok:{$gte : quantity || defaultQuantity}});
    if(!myProduct){
        return next(new Error('invalid product or not suitable product quantity' , {cause : 400}));
    }
    const userCart = await cartModel.findOne({userId}).lean();
    if(!userCart){
       return next(new Error('not founded cart for this user'));
    }
    let supTotal = userCart.supTotal;
    userCart.products.find(async (product) => {
        if(productId == product.productId){
            console.log(product.quantity + quantity || defaultQuantity);
            if(product.quantity + quantity > myProduct.stok || product.quantity +  defaultQuantity > myProduct.stok){
                return next ( new Error(`this quantity not available now the available quantity is ${myProduct.stok}` , {cause:400}))  
            }
            if(!quantity){
                product.quantity += defaultQuantity ;
                supTotal += myProduct.priceAfterDiscount *  defaultQuantity;
                product.totalProductPrice += myProduct.priceAfterDiscount *  defaultQuantity
            }else{
                product.quantity += quantity  ;
                supTotal += myProduct.priceAfterDiscount * (quantity);
                product.totalProductPrice += myProduct.priceAfterDiscount * (quantity);
            }
        }
    });
    const newCart = await cartModel.findOneAndUpdate({userId} , {products:userCart.products , supTotal}, {new:true});
    return res.status(200).json({message:"done" , newCart})
});

export const dicreamentCounter = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const defaultQuantity = 1;
    const { productId , quantity } = req.body;
    const userCart = await cartModel.findOne({userId}).lean();
    if(!userCart){
       return next(new Error('not founded cart for this user'));
    }
    const myProduct = await productModel.findOne({ _id: productId , stok:{$gte : quantity || defaultQuantity }});
    if(!myProduct){
        return next(new Error('invalid product or not suitable product quantity' , {cause : 400}));
    }
    
    let supTotal = userCart.supTotal;
    userCart.products.find(async (product) => {
        if(productId == product.productId){
            if(product.quantity - (quantity || defaultQuantity) < 0){
                return next(new Error('invalid quantity'))
            }
            if(product.quantity - (quantity || defaultQuantity) == 0){
                userCart.products.splice(userCart.products.indexOf(product), 1);
                return next ( new Error(`you removed your product from cart` , {cause:400}))  
            }
            console.log((quantity || defaultQuantity));
            product.quantity -= (quantity || defaultQuantity) ;
            supTotal -= myProduct.priceAfterDiscount * (quantity || defaultQuantity);
            product.totalProductPrice -= myProduct.priceAfterDiscount * (quantity || defaultQuantity)
        }
    });
    const newCart = await cartModel.findOneAndUpdate({userId} , {products:userCart.products , supTotal}, {new:true});
    return res.status(200).json({message:"done" , newCart})
});

export const deleteCart = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const userCart = await cartModel.findOneAndDelete({userId});
    if (!userCart ){
        return next(new Error("cart is empty" , {cause : 404}));
    }
    userCart.products.map(async(product) => {
        const findProduct = await productModel.findById(product.productId);
        if(!findProduct){
            return next(new Error('this product has been removed from data' , {cause : 404}));
        }
        findProduct.stok += product.quantity;
        await findProduct.save();
    });
    return res.status(200).json({message :"cart deleted success"});
});

export const getUserCart = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const userCart = await cartModel.findOne({userId});
    if(!userCart){
        return next(new Error ('your cart is empty',{ cause :  400 }));
    };
    if(userCart.products.length){
        for (const product of userCart.products) {
            if(! await productModel.findById(product.productId)){
                userCart.products.splice(userCart.products.indexOf(product) , 1);
                userCart.supTotal -= product.totalProductPrice;
            }
        }
        await userCart.save();
    }
    if(!userCart.products.length){
        return res.status(200).json({message:'your cart is empty'});
    };
    const ids = [];
    for (const id of userCart.products) {
        ids.push(id.productId);
    }

    const products = await productModel.find({_id:{$in:ids}}).populate({
        path :'brandId',
        select : 'name logo'
    }).select('title colors sizes price priceAfterDiscount brandId images categoryId subCategoryId');
    const cartProducts = [];
    for (const product of products) {
        for (const cartProduct of userCart.products) {
            if(product._id.toString() == cartProduct.productId.toString()){
                cartProducts.push({product , quantity:cartProduct.quantity , totalProductPrice:cartProduct.totalProductPrice});
            }
        }
    }
    
    return res.status(200).json({message:'success' , cartProducts , supTotal:userCart.supTotal , _id:userCart._id});
});