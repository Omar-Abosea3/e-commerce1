import connectDB from "../DB/connection.js";
import categoryRouter from './modules/categories/category.router.js';
import subCategoryRouter from './modules/subCategories/subCategory,router.js';
import brandRouter from './modules/Brands/brand.router.js';
import productRouter from './modules/Products/product.router.js';
import couponRouter from './modules/coupon/coupon.router.js';
import { glopalErrorHandelling } from "./utils/errorHandlig.js";
import authRouter from "./modules/auth/auth.router.js";
import userRouter from "./modules/user/user.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import reviewRouter from './modules/reviews/review.router.js';
import cors from 'cors';
import wishlistRouter from "./modules/wishlist/wishlist.router.js";

const bootstrap = (app , express) => {
    app.use(express.json());
    app.use(cors());
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/products' , productRouter)
    app.use('/categories' , categoryRouter);
    app.use('/subcategories', subCategoryRouter);
    app.use('/brands' , brandRouter);
    app.use('/cart' , cartRouter);
    app.use('/wishlist' , wishlistRouter)
    app.use('/order' , orderRouter);
    app.use('/coupon' , couponRouter);
    app.use('/review' , reviewRouter); 
    app.use('*' , (req , res , next) => {
        return res.json({message:'in-valid routing'})
    });
    app.use(glopalErrorHandelling);
    connectDB();
}

export default bootstrap ;