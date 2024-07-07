import cartModel from "../../../DB/models/cartModel.js";
import couponModel from "../../../DB/models/couponModel.js";
import orderModel from "../../../DB/models/orderModel.js";
import productModel from "../../../DB/models/productModel.js";
import createInvoice from "../../utils/pdfKit.js";
import isCouponValid from "../../utils/couponValidation.js";
import sendEmail from "../../utils/email.js";
import { asyncHandeller } from "../../utils/errorHandlig.js";
import { nanoid } from 'nanoid';
import { qrCodeFunction } from "../../utils/qrCode.js";
import { paymentCoreFunctions } from "../../utils/payment.js";
import jwt  from "jsonwebtoken";
import Stripe from "stripe";
import cloudinary from "../../utils/cloudinaryConfigration.js";

export const createOrder = asyncHandeller(async(req , res , next) => {
    const userId = req.user._id;
    const {productId} = req.params;
    const {
      quantity,
      address,
      phoneNumbers,
      paymentMethod,
      couponCode,
      city,
      state
    } = req.body;

    // ===================== coupon check =================
    if (couponCode) {
      const coupon = await couponModel
        .findOne({ couponCode })
        .select(
          "isPercentage isFixedAmount couponAmount couponAssignedtoUsers"
        );
      const isCouponValidResult = await isCouponValid({ couponCode, userId });
      console.log(isCouponValidResult);
      if (isCouponValidResult !== true) {
        return next(new Error(isCouponValidResult.msg, { cause: 400 }));
      }
      req.coupon = coupon;
    }

    // ==================== product check ================
    const products = [];
    const isProductValid = await productModel.findOne({
      _id: productId,
      stok: { $gte: quantity },
    });
    if (!isProductValid) {
      return next(
        new Error("invalid product please check your quantity", { cause: 404 })
      );
    }
    const productObject = {
      productId,
      quantity,
      title: isProductValid.title,
      price: isProductValid.priceAfterDiscount,
      finalPrice: isProductValid.priceAfterDiscount * quantity,
      images : isProductValid.images
    };
    products.push(productObject);

    const supTotal = productObject.finalPrice;
    // ============= paidAmount ==============
    let paidAmount = 0;
    if (req.coupon?.isPercentage) {
      if((req.coupon.couponAmount/100) * isProductValid.priceAfterDiscount > isProductValid.priceAfterDiscount){
        return next(new Error('please select another product' , { cause:400 }));
      }
      paidAmount = supTotal - (supTotal * (req.coupon.couponAmount || 0)) / 100;
    } else if (req.coupon?.isFixedAmount) {
      if(req.coupon.couponAmount > isProductValid.priceAfterDiscount){
        return next(new Error('please select another product' , { cause:400 }));
      }
      paidAmount = supTotal - req.coupon.couponAmount;
    } else {
      paidAmount = supTotal;
    }

    // ============== order status ============
    let orderStatus;
    paymentMethod == "cash"
      ? (orderStatus = "placed")
      : (orderStatus = "pending");

    const orderObject = {
      userId,
      productId,
      address,
      phoneNumbers,
      orderStatus,
      paymentMethod,
      supTotal,
      products,
      paidAmount,
      couponId: req.coupon?._id,
    };

    const order = await orderModel.create(orderObject);
    if (!order) {
      return next(new Error("order not created", { cause: 400 }));
    }
    // ====================== payment ========================
    let orderSession;
    if(order.paymentMethod == 'card'){
        if(req.coupon){
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            let coupon;
            // percentage 
            if(req.coupon.isPercentage){
                coupon = await stripe.coupons.create({
                    percent_off:req.coupon.couponAmount,
                })
            }
            // fixed amount
            if(req.coupon.isFixedAmount){
                coupon = await stripe.coupons.create({
                    amount_off:req.coupon.couponAmount * 100,
                    currency:'EGP'
                })
            }
            req.couponId = coupon.id
        }
        const token = jwt.sign({orderId:order._id} , process.env.ORDER_TOKEN , )
        orderSession = await paymentCoreFunctions({
            payment_method_types:[order.paymentMethod],
            mode:'payment',
            customer_email:req.user.email,
            metadata:{orderId:order._id.toString()},
            success_url:`https://tradly-front.vercel.app/#/payment-success/${token}`,
            cancel_url:`https://tradly-front.vercel.app/#/payment-cancel/${token}`,
            line_items:order.products.map(product => {
                return{
        
                    price_data:{
                        currency:'EGP',
                        product_data:{
                            name:product.title,
                        },
                        unit_amount:product.price * 100, // to convert from usd
                    },
                    quantity:product.quantity, // quantity of product
                }
            }),
            discounts:req.couponId?[{coupon:req.couponId}]:[],
        })
    };
    // increase usageCountForCoupon
    if (req.coupon) {
      req.coupon.couponAssignedtoUsers.map((user) => {
        if (user.userId.toString() == userId.toString()) {
          user.usageCount += 1;
        }
      });
      await req.coupon.save();
    }
    // decrease product stock
    const productExist = await productModel.findById(productId);
    productExist.stok -= quantity;
    productExist.save();
    // remove Product From Cart.
    const userCart = await cartModel.findOne({ userId });
    if (userCart) {
      userCart.products.find(async (userCartProduct) => {
        if (userCartProduct.productId == productId) {
            userCart.products.splice(
            userCart.products.indexOf(userCartProduct),
            1
          );
          userCart.supTotal -=
            userCartProduct.quantity * isProductValid.priceAfterDiscount;
        }
      });
      await userCart.save();
    }

    const orderCode = `${req.user.userName}_${nanoid(3)}`;
    const orderInvoice = {
      items: order.products,
      supTotal: order.supTotal,
      paidAmount: order.paidAmount,
      orderCode,
      date: order.createdAt,
      shipping: {
        name: req.user.userName,
        address: order.address,
        city,
        state,
        country: "Egypt",
      },
    };
    const orderQr = await qrCodeFunction({
      data: { orderId: order._id, products: order.products },
    });
    // await createInvoice(orderInvoice, `${orderCode}.pdf`);
    await sendEmail({
      to: req.user.email,
      subject: "Order Confirmation",
      html: "<h1>please find your invoice below</h1>",
      // attachments: [
      //   {
      //     path: `./Files/${orderCode}.pdf`,
      //   },
      // ],
    });
    console.log(orderSession);
    if(orderSession){
      return res.status(201).json({ message: "done", order , checkOutLink:orderSession.url});
    }
    return res.status(201).json({ message: "done", order });
});

export const fromCartToOrder = asyncHandeller(async (req, res, next) => {
  const userId = req.user._id;
  const { cartId } = req.params;
  const { address, phoneNumbers, paymentMethod, couponCode , city , state } = req.body;
  const cart = await cartModel.findById(cartId);
  if (!cart || !cart.products.length) {
    return next(new Error("please fill your cart first", { cause: 400 }));
  }
  if (couponCode) {
    const coupon = await couponModel
      .findOne({ couponCode })
      .select(
        "isPercentage isFixedAmount couponAmount couponAssignedtoUsers"
      );
    const isCouponValidResult = await isCouponValid({ couponCode, userId });
    console.log(isCouponValidResult);
    if (isCouponValidResult !== true) {
      return next(new Error(isCouponValidResult.msg, { cause: 400 }));
    }
    req.coupon = coupon;
  }
  let supTotal = cart.supTotal;

  let paidAmount = 0;
  if (req.coupon?.isPercentage) {
    if((req.coupon.couponAmount/100) * cart.supTotal > cart.supTotal){
      return next(new Error('please select another cart or add additional products' , { cause:400 }));
    }
    paidAmount = supTotal - (supTotal * (req.coupon.couponAmount || 0)) / 100;
  } else if (req.coupon?.isFixedAmount) {
    if(req.coupon.couponAmount > cart.supTotal){
      return next(new Error('please select another cart or add additional products' , { cause:400 }));
    }
    paidAmount = supTotal - req.coupon.couponAmount;
  } else {
    paidAmount = supTotal;
  }

  let orderStatus;
  paymentMethod == "cash"
    ? (orderStatus = "placed")
    : (orderStatus = "pending");
  const orderProducts = [];
  for (const product of cart.products) {
    const productExist = await productModel.findById(product.productId);
    if(!productExist){
      return next(new Error('your cart may include deleted products' , { cause: 404}));
    }
    orderProducts.push({
      productId: product.productId,
      quantity: product.quantity,
      title: productExist.title,
      price: productExist.priceAfterDiscount,
      finalPrice: productExist.priceAfterDiscount * product.quantity,
      images:productExist.images
    });
  }
  const orderObject = {
    userId,
    address,
    phoneNumbers,
    orderStatus,
    paymentMethod,
    supTotal,
    products: orderProducts,
    paidAmount,
    couponId: req.coupon?._id,
  };
  const order = await orderModel.create(orderObject);
  if (!order) {
    return next(new Error("order not created", { cause: 400 }));
  }
  let orderSession;
  if(order.paymentMethod == 'card'){
      if(req.coupon){
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          let coupon;
          // percentage 
          if(req.coupon.isPercentage){
              coupon = await stripe.coupons.create({
                  percent_off:req.coupon.couponAmount,
              })
          }
          // fixed amount
          if(req.coupon.isFixedAmount){
              coupon = await stripe.coupons.create({
                  amount_off:req.coupon.couponAmount * 100,
                  currency:'EGP'
              })
          }
          req.couponId = coupon.id
      }
      const token = jwt.sign({orderId:order._id} , process.env.ORDER_TOKEN , )
      orderSession = await paymentCoreFunctions({
          payment_method_types:[order.paymentMethod],
          mode:'payment',
          customer_email:req.user.email,
          metadata:{orderId:order._id.toString()},
          success_url:`https://tradly-front.vercel.app/#/payment-success/${token}`,
          cancel_url:`https://tradly-front.vercel.app/#/payment-cancel/${token}`,
          line_items:order.products.map(product => {
              return{

                  price_data:{
                      currency:'EGP',
                      product_data:{
                          name:product.title,
                      },
                      unit_amount:product.price * 100, // to convert from usd
                  },
                  quantity:product.quantity, // quantity of product
              }
          }),
          discounts:req.couponId?[{coupon:req.couponId}]:[],
      })
  };
  if (req.coupon) {
    for (const user of req.coupon.couponAssignedtoUsers) {
      if (user.userId.toString() == userId.toString()) {
        user.usageCount += 1;
      }
    }
    await req.coupon.save();
  }
  for (const product of cart.products) {
    const isProductExist = await productModel.findById(product.productId);
    isProductExist.stok -= product.quantity;
    await isProductExist.save();
  }
  cart.products = [];
  cart.supTotal = 0;
  await cart.save();
  const orderCode = `${req.user.userName}_${nanoid(3)}`;
  const orderInvoice = {
    items: order.products,
    supTotal: order.supTotal,
    paidAmount: order.paidAmount,
    orderCode,
    date: order.createdAt,
    shipping: {
      name: req.user.userName,
      address: order.address,
      city,
      state,
      country: "Egypt",
    },
  };
  const orderQr = await qrCodeFunction({
    data: { orderId: order._id, products: order.products },
  });
  // await createInvoice(orderInvoice, `${orderCode}.pdf`);
  await sendEmail({
    to: req.user.email,
    subject: "Order Confirmation",
    html: "<h1>please find your invoice below</h1>",
    // attachments: [
    //   {
    //     path: `./Files/${orderCode}.pdf`,
    //   },
    // ],
  });
  if(orderSession){
    return res.status(201).json({ message: "done", order , checkOutLink:orderSession.url});
  }
  return res.status(201).json({ message: "done", order });
});

export const successPayment = asyncHandeller(async (req , res , next) => {
    const { token } = req.query;
    const decodedData = jwt.verify(token , process.env.ORDER_TOKEN);
    const order = await orderModel.findOne({_id:decodedData.orderId , orderStatus:'pending'});
    if(!order){
        return next(new Error('invalid orderId' , {cause : 400}));
    }
    const productIds = [];
    for (const product of order.products) {
      productIds.push(product.productId);
    }
    const deletedProducts = await productModel.find({$and:[{_id:{$in:productIds}} , {stok:0}]}).populate([
      {
        path:'brandId',
        select:'customId'
      },
      {
        path:'categoryId',
        select:'customId'
      },
      {
        path:'subCategoryId',
        select:'customId'
      }
    ]);

    if(deletedProducts.length){
      await productModel.deleteMany({$and:[{_id:{$in:productIds}} , {stok:0}]});
      for (const deletedProduct of deletedProducts) {
        await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Categories/${deletedProduct.categoryId.customId}/Subcategory/${deletedProduct.subCategoryId.customId}/Brand/${deletedProduct.brandId.customId}/Products/${deletedProduct.customId}`);
        await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Categories/${deletedProduct.categoryId.customId}/Subcategory/${deletedProduct.subCategoryId.customId}/Brand/${deletedProduct.brandId.customId}/Products/${deletedProduct.customId}`);
      }
    }
    order.orderStatus = 'confirmed';
    await order.save();
    return res.status(200).json({message:'confirmed' , order});
});

export const cancelPayment = asyncHandeller(async (req , res , next) => {
    const { token } = req.query;
    const decodedData = jwt.verify(token , process.env.ORDER_TOKEN);
    const order = await orderModel.findOne({_id:decodedData.orderId});
    if(!order){
        return next(new Error('invalid orderId' , {cause : 400}));
    }

    // ============ approch one  status = canceled ========
    order.orderStatus = 'canceled';
    await order.save();
    // ========== undo products stock + coupon =======

    for (const product of order.products) {
        const findProduct = await productModel.findById(product.productId);
        findProduct.stok += product.quantity;
        await findProduct.save()
    }

    if(order.couponId){
        const coupon = await couponModel.findById(order.couponId);
        if (!coupon){
            return next(new Error('this coupon is not founded' , {cause : 404}))
        }
        coupon.couponAssignedtoUsers.map((ele) => {
            if(ele.userId.toString() == order.userId.toString()){
                ele.usageCount -= 1;
            }
        });

        await coupon.save();
    }
    // =========== approch tow : delete order ========
    await orderModel.deleteOne({_id:decodedData.orderId});
    return res.status(200).json({message:'canceled' , order});
});

export const deliverOrder = asyncHandeller(async (req , res , next) => {
  const { orderId } = req.query;
  const order = await orderModel.findOneAndUpdate({
    _id:orderId,
    orderStatus:{$nin:['deliverd' , 'canceled', 'pending' , 'rejected']}
  },{
    orderStatus:'deliverd'
  },
  {
    new:true
  });
  if(!order){
    return next(new Error('invalid order' , { cause : 404 }));
  }
  const productIds = [];
  for (const product of order.products) {
    productIds.push(product.productId);
  }
  const deletedProducts = await productModel.find({$and:[{_id:{$in:productIds}} , {stok:0}]}).populate([
    {
      path:'brandId',
      select:'customId'
    },
    {
      path:'categoryId',
      select:'customId'
    },
    {
      path:'subCategoryId',
      select:'customId'
    }
  ]);

  if(deletedProducts.length){
    await productModel.deleteMany({$and:[{_id:{$in:productIds}} , {stok:0}]});
    for (const deletedProduct of deletedProducts) {
      await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Categories/${deletedProduct.categoryId.customId}/Subcategory/${deletedProduct.subCategoryId.customId}/Brand/${deletedProduct.brandId.customId}/Products/${deletedProduct.customId}`);
      await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Categories/${deletedProduct.categoryId.customId}/Subcategory/${deletedProduct.subCategoryId.customId}/Brand/${deletedProduct.brandId.customId}/Products/${deletedProduct.customId}`);
    }
  }
  return res.status(200).json({message:'order deliverd successfully' , order});
});

export const getAllUserProducts = asyncHandeller(async (req , res , next) => {
  const userId = req.user._id;
  const orders = await orderModel.find({userId , orderStatus:{$ne:'canceled'}});
  if(!orders.length){
    return next(new Error('you don’t have orders history' , {cause : 404}));
  }
  return res.status(200).json({ message:"success" , orders}) ;
});