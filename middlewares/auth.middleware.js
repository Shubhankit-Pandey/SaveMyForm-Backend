import jwt from "jsonwebtoken";

import { response_401, response_400 } from "../utils/responseCodes.js";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        
        if (!authHeader || !/(Bearer )\w+/.test(authHeader)) {
            // authorization header is not present or is not of the required format
            return response_401(res, "Request is unauthorized");
        }
        
        // extracting the token and verifying it
        const authToken = authHeader.replace("Bearer ", "");
        const {payload} = jwt.verify(authToken, process.env.SECRET); // will throw err is token is invalid or expired
        
        req.isAuthenticated = true;
        
        const userMongoId = payload.id;
        
        // extracting user info from DB
        const user = await User.findById(userMongoId);
        
        if (!user) {
            // user is not present in DB
            return response_400(res, "Request is invalid")
        }
        
        req.user = user;
    }
    catch (err) {
        req.isAuthenticated = false;
    }

    next()
}

export default authMiddleware;