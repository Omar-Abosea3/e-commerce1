import  jwt  from "jsonwebtoken";
import userModel from "../../DB/models/userModel.js";

const authentication = (roles) => {
  return async (req, res, next) => {
    try {
      const { bearertoken } = req.headers;
      console.log(bearertoken);
      if (!bearertoken) {
        return next(new Error("not authenticated user", { cause: 400 }));
      }
      const bearerLength = process.env.BEARERKEY.length;
      console.log(bearerLength);
      const token = bearertoken.slice(bearerLength);
      console.log(token);
      try {
        console.log(jwt.verify(token, process.env.TOKEN_SECRET));
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(decoded.id);
        const user = await userModel.findById(decoded.id);
        console.log(user);
        if (!user) {
          return next(new Error("not founded user", { cause: 404 }));
        }
        if(!roles.includes(user.role)){
          return next(new Error('unAuthorized to access this api' , {cause:401}));
        }
        req.user = user;
        next();
      } catch (error) {
        console.log(error);
        console.log(process.env.TOKEN_SECRET);
        if (error == "TokenExpiredError: jwt expired") {
          // searching for user by expired token that have been stored in data base .
          const findUser = await userModel.findOne({ token: token });
          if (!findUser) {
            return next(new Error("wrong token", { cause: 404 }));
          }
          console.log(findUser);
          // generate new token .
          const refreshedToken = jwt.sign(
            { email: findUser.email, id: findUser._id, isLoggedIn: true },
            process.env.TOKEN_SECRET,
            { expiresIn: "23h" }
          );
          if (!refreshedToken) {
            return next(
              new Error("token generation fail, payload canot be empty", {
                cause: 400,
              })
            );
          }
          // store new token in data base .
          findUser.token = refreshedToken;
          await findUser.save();
          return res
            .status(200)
            .json({ message: "token refreshed", refreshedToken });
        }
        return next(new Error("invalid Token", { cause: 400 }));
      }
    } catch (error) {
      return next(new Error("error in auth", { cause: 500 }));
    }
  };
};

export default authentication;