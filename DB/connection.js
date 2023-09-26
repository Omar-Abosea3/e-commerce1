import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.CONNECTION_DBURL_CLOUD)
    .then(result=>{
        console.log('DB connected');
    })
    .catch(err => {
        console.log(`error in connect to DB .... ${err}`);
    })
}

export default connectDB ;