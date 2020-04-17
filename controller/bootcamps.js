const ErrorRespose = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const path = require('path');

// @desc    GET all bootcamps
// @routes  GET api/v1/bootcamps
// @access  public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
})


// @desc    GET single bootcamps
// @routes  GET api/v1/bootcamps/:id
// @access  public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorRespose(`Bootcamp not found with id of ${req.params.id}`, 404
            ));
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    })

})


// @desc    Create new bootcamp
// @routes  POST api/v1/bootcamps
// @access  private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    //Add user id to req.body
    req.body.user = req.user.id;

    //Check for publish bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user : req.user.id});

    //If user is not admin, they can only add one bootcamp
    if(publishedBootcamp && req.user.role!== 'admin'){
        return next(new ErrorRespose(`The user with Id ${req.user.id} has already published a bootcamp`,400));
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    });

})


// @desc    Update  bootcamp
// @routes  PUT api/v1/bootcamps/:id
// @access  private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorRespose(`Bootcamp not found with id of ${req.params.id}`, 404
            ));
    }

    //Make sure user is bootcamp owner
    if(bootcamp.user.id.toString()!= req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorRespose(`User ${req.params.id} is not authorize to update this bootcamp`, 401
            ));
    }

    bootcamp = Bootcamp.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: bootcamp
    })

})

// @desc    Delete bootcamp
// @routes  Delete api/v1/bootcamps/:id
// @access  private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorRespose(`Bootcamp not found with id of ${req.params.id}`, 404
            ));
    }

    //Make sure user is bootcamp owner
    if(bootcamp.user.id.toString()!= req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorRespose(`User ${req.params.id} is not authorize to delete this bootcamp`, 401
            ));
    }

    bootcamp.remove();

    res.status(200).json({
        success: true,
        data: bootcamp
    })

})



// @desc    Get bootcamp within a radius
// @routes  Get api/v1/bootcamps/radius/:zipcode/:distance
// @access  private
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {

    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lng = loc[0].longitude;
    const lat = loc[0].latitude;

    //Calc radius using radians
    //Divide distance bu radius of earth
    //Earth radius = 3963mi / 6378 km

    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] }
        }
    })


    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})




// @desc    Upload photo for bootcamp
// @routes  PUT api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorRespose(`Bootcamp not found with id of ${req.params.id}`, 404
            ));
    }

    //Make sure user is bootcamp owner
    if(bootcamp.user.id.toString()!= req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorRespose(`User ${req.params.id} is not authorize to delete this bootcamp`, 401
            ));
    }

    if (!req.files) {
        return next(new ErrorRespose(`Please upload a file`, 400));
    }

    const file = req.files.file;

    //Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorRespose(`Please upload an image file`, 400));
    }

    //Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorRespose(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    //Crete custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.error(err);
            return next( new ErrorRespose(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: file.name
        });

        res.status(200).json({
            success : true,
            data: file.name
        })

    });
});