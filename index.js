import dotenv from 'dotenv';
import express from 'express';
import bootstrap from './src/index.router.js';
import path from 'path';
import { changeCouponStatus, removeNonConfirmedAccount } from './src/utils/cron.js';
dotenv.config({path:path.resolve('./configs/.env')});
const app = express();
const port = 5000;
changeCouponStatus();
removeNonConfirmedAccount();
bootstrap(app , express);
console.log('omar_ashraf'.slice(4,5));
app.listen(parseInt(process.env.PORT) || port , _=>{console.log(`running on .... ${parseInt(process.env.PORT)}`)});
 