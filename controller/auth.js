const ErrorRespose = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


// @desc    Register
// @routes  POST api/v1/auth/register
// @access  public
exports.register = asyncHandler(async (req, res, next) => {

    const { name, email, password, role } = req.body;

    //Create User
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
})



// @desc    Login user
// @routes  POST api/v1/auth/login
// @access  public
exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    //Validate email and password
    if (!email || !password) {
        return next(new ErrorRespose('Please provide an email and password', 400));
    }

    //Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorRespose('Invalid Credential', 401));
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorRespose('Invalid Credential', 401));
    }

    sendTokenResponse(user, 200, res);
})


// @desc    Log user out/ clear cookie
// @routes  GET api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {

    res.cookie('token','none',{
        expires : new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        data: {}        
    })
})


// @desc    Get current logged in user
// @routes  POST api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
})


// @desc    Forgot password 
// @routes  POST api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorRespose('There is no user with that email', 404));
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken();

    //console.log(resetToken);
    await user.save({ validateBeforeSave: false });

    //Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or somone else)
     has requested the reset of a password. Please make a PUT request to : \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({
            success: true,
            data: 'Email sent'
        })

    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorRespose('Email could not be sent ', 500));
    }
})


// @desc    Reset password
// @routes  PUT api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {

    //Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if(!user){
        next(new ErrorRespose('Invalid token',400));
    }

    //Set new Password
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
})




// @desc    Update user details
// @routes  PUT api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {

    const fieldToUpdate = {
        email : req.body.email,
        name: req.body.name
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
        new : true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
})



// @desc    Update password
// @routes  PUT api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');


    // Check current password
    if(!user.matchPassword(req.body.currentPassword)){
        return next(new ErrorRespose('Password is incorrect'),401);
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user,200,res);
})



//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {

    // Create Token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV == 'production') {
        options.secure = true;
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });

}