const ErrorRespose = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');



// @desc    GET all reviews
// @routes  GET api/v1/reviews
// @routes  GET api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler( async (req,res,next) => {
    
    if(req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp : req.params.bootcampId});

        res.status(200).json({
            success : true,
            count : reviews.length,
            data: reviews
        })
    }else{
        res.status(200).json(res.advancedResults);
    }
})


// @desc    GET single reviews
// @routes  GET api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler( async (req,res,next) => {
    
    const review = await Review.findById(req.params.id).populate({
        path : 'bootcamp',
        select : 'name description'
    })

    if(!review){
        next(new ErrorRespose(`No review found with the id of ${req.params.id}`,404));
    }

    res.status(200).json({
        success : true,
        data: review
    })
})



// @desc    Add review
// @routes  POST api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler( async (req,res,next) => {
    
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(new ErrorRespose(`No bootcamp with the id of ${req.params.bootcampId}`,404));
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    })
})



// @desc    Update review
// @routes  PUT api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler( async (req,res,next) => {
    
    let review = await Review.findById(req.params.id);

    if(!review){
        return next(new ErrorRespose(`No review found with the id of ${req.params.id}`,404));
    }


    //Make sure review belongs to user or user is admin
    if(review.user.toString() != req.user.id && req.user.role != 'admin'){
        return next(new ErrorRespose(`You are not authorize to update this review`,401));
    }

    review = await Review.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    })
})



// @desc    Delete review
// @routes  Delete api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler( async (req,res,next) => {
    
    const review = await Review.findById(req.params.id);

    if(!review){
        return next(new ErrorRespose(`No review found with the id of ${req.params.id}`,404));
    }


    //Make sure review belongs to user or user is admin
    if(review.user.toString( ) != req.user.id && req.user.role != 'admin'){
        return next(new ErrorRespose(`You are not authorize to update this review`,401));
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: {}
    })
})