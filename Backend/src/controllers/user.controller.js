import {User} from "../models/user.model.js"
import { StatusCodes } from "http-status-codes";
import bcrypt from 'bcrypt';


export async function login(req,res) {
    const {username,password}= req.body;
    
    if(!username || !password){
        return res.status(StatusCodes.NOT_FOUND).json({
            message: "Please provide details",
            success: false
        });
    }

    try{
        
        const validUsername = await User.findOne({username});

        if(!validUsername){
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "User does not exists. Please register...",
                success: false
            });
        }
        /**
         * Now if above all conditions are true,
         * Then means User provided correct username
         * Now we have to validate password and accordingly
         * give access to User.
         */
        
        const validPassword = await bcrypt.compare(password,validUsername.password);

        if(!validPassword){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Password is incorrect",
                success: false
            });
        }
        
        console.log("User logged in successfully....");
        return res.status(StatusCodes.OK).json({
                message: "User logged in successfully",
                success: true
        })
        
    }catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: `Something went wrong ${error}`,
            success: false
        });
    }
}


export async function register (req,res){
    const {name,username,password} = req.body;
    try{
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(302).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword  
        });

        await newUser.save();

        return res.status(StatusCodes.CREATED).json({
            message: "User Registered",
            data: newUser,
            success: true
        })
    }
    catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: `Something went wrong ${error}`,
            success: false
        });
    }
}

