import {User} from "../models/user.model.js"
import { StatusCodes } from "http-status-codes";
import bcrypt from 'bcrypt';
import { Meeting } from "../models/meeting.model.js";
import crypto from 'crypto';

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
        // Generate a token for the user
        const token = crypto.randomBytes(16).toString('hex');
        validUsername.token = token;
        await validUsername.save();
        return res.status(StatusCodes.OK).json({
                token: token,
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

export async function getUserHistory(req,res){
    const {token} = req.query;
    const user = await User.findOne({token: token});
    if(!user){
        return res.status(StatusCodes.NOT_FOUND).json({
            message: "User not found",
            success: false
        });
    }
    const meetings = await Meeting.find({user_id: user.username});
    if(!meetings){
        return res.status(StatusCodes.NOT_FOUND).json({
            message: "No meetings found for this user",
            success: false
        });
    }
    return res.status(StatusCodes.OK).json({
        message: "User meeting history retrieved successfully",
        data: meetings,
        success: true
    });
}

export async function addToHistory(req,res){
    console.log("Backend: Adding to history");
    const {token,meetingCode}=req.body;
    console.log("Adding to history", token, meetingCode);
    const user = await User.findOne({token: token});
    console.log("User found:", user.username);
    if(!user){
        return res.status(StatusCodes.NOT_FOUND).json({
            message: "User not found",
            success: false
        });
    }
    const newMeeting = new Meeting({
        user_id: user.username,
        meetingCode: meetingCode
    });
    await newMeeting.save(); 
    return res.status(StatusCodes.CREATED).json({
        message: "Meeting added to history",
        data: newMeeting,
        success: true
    });
}
