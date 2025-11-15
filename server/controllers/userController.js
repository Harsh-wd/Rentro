import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";

//Generate JWT Token
const generateToken = (userId)=>{
    const payload = { id: userId }; // Use an object for the payload for better practice
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); // Add an expiration
}

export const registerUser = async(req , res)=>{
    try{
        const{name,email,password}=req.body

        // --- ENHANCED VALIDATION BLOCK ---

        // 1. Check if all fields are provided
        if(!name || !email || !password){
            return res.status(400).json({success: false, message:'Please fill all the fields'});
        }

        // 2. Password Strength Validation
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasSufficientLength = password.length >= 8;
        
        if (!hasSufficientLength || !hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
            // Sending a generic but clear message.
            // You could also send specific messages for each failed check.
            return res.status(400).json({
                success: false,
                message: 'Password does not meet the requirements. It must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
            });
        }
        // --- END OF VALIDATION BLOCK ---


        const userExists = await User.findOne({email})
        if(userExists){
            return res.status(409).json({success: false, message:'User with this email already exists'});
        }

        const hashedPassword = await bcrypt.hash(password,10)
        const user = await User.create({name,email,password:hashedPassword})
        
        // Don't send back the full user object, just what's needed.
        const token = generateToken(user._id);

        res.status(201).json({success:true, token, user: { name: user.name, email: user.email }});


    } catch (error){
        console.log(error.message);
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

//Login user
export const loginUser = async(req,res)=>{
    try{
        const {email , password}=req.body;

        if(!email || !password){
            return res.status(400).json({success: false, message:'Please provide email and password'});
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({success:false,message:"User not found"})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({success:false,message:"Invalid credentials"})
        }

        const token=generateToken(user._id)
        res.json({success:true,token, user: { name: user.name, email: user.email }})
    } catch (error){
        console.log(error.message);
        res.status(500).json({success:false,message:"Internal Server Error"})
        
    }
}

//Get user data using Token (JWT)
export const getUserData = async(req,res)=>{
    try{
        // Assuming you have middleware that decodes the token and attaches user to req
        const userId = req.user.id; 
        const user = await User.findById(userId).select("-password"); // Exclude password from result
        if (!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }
        res.json({success:true, user});
    }catch (error){
        console.log(error.message);
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

//Get all cars for the frontend
export const getCars = async(req,res)=>{
    try{
        const cars = await Car.find({isAvailable:true})
        res.json({success:true,cars})
    }catch (error){
        console.log(error.message);
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
