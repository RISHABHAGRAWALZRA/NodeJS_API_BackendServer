const ErrorRespose = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');


// @desc    GET all bootcamps
// @routes  GET api/v1/bootcamps
// @access  public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.find();
    res.status(200).json({
        success: true,
        count: bootcamp.length,
        data: bootcamp
    });
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

    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

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

// @desc    Delete bootcamp
// @routes  Delete api/v1/bootcamps/:id
// @access  private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

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