const ErrorRespose = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');



// @desc    GET all courses
// @routes  GET api/v1/courses
// @routes  GET api/v1/bootcamp/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler( async (req,res,next) => {
    
    if(req.params.bootcampId) {
        const courses = await Course.find({ bootcamp : req.params.bootcampId});

        res.status(200),json({
            success : true,
            count : courses.length,
            data: courses
        })
    }else{
        res.status(200).json(res.advancedResults);
    }
})




// @desc    GET course
// @routes  GET api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler( async (req,res,next) => {

    const course = await Course.findById(req.params.id).populate({
        path : 'bootcamp',  
        select : 'name description'
    });

    if(!course){
        return next(new ErrorRespose(`No course with the id of ${req.params.id}`),
        404
        );
    }   

    res.status(200).json({
        success : true,
        data : course
    })
})




// @desc    Add course
// @routes  POST api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler( async (req,res,next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;    

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(new ErrorRespose(`No Bootcamp with the id of ${req.params.bootcampId}`),
        404
        );
    }  
    
    //Make sure user is bootcamp owner
    if(bootcamp.user.id.toString()!= req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorRespose(`User ${req.user.id} is not authorize to add course to bootcamp ${req.params.bootcampId}`, 401
            ));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success : true,
        data : course
    })
})




// @desc    Update course
// @routes  PUT api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler( async (req,res,next) => {

    let course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorRespose(`No Course with the id of ${req.params.id}`),
        404
        );
    }  
    
    //Make sure user is course owner
    if(course.user.id.toString()!= req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorRespose(`User ${req.user.id} is not authorize to update this course`, 401
            ));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true
    });

    res.status(200).json({
        success : true,
        data : course
    })
})



// @desc    Delete course
// @routes  Delete api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler( async (req,res,next) => {

    const course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorRespose(`No Bootcamp with the id of ${req.params.id}`),
        404
        );
    }
    
    //Make sure user is course owner
    if(course.user.id.toString()!= req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorRespose(`User ${req.user.id} is not authorize to delete this course`, 401
            ));
    }

    await course.remove();

    res.status(200).json({
        success : true,
        data : {}
    })
})