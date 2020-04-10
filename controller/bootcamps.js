const ErrorRespose = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');


// @desc    GET all bootcamps
// @routes  GET api/v1/bootcamps
// @access  public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    //Copy req,query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields=['select','sort','page','limit'];

    //Loop over Removefields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    //Replacing {gt,gte,lt,lte,in} with {$gt,$gte,$lt,$lte, $in}
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //Converting queryString into Json
    queryStr = JSON.parse(queryStr);

    //Finding resouses
    query = Bootcamp.find(queryStr);

    //Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split('.').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    //Pagination
    const page= parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Executing query
    const bootcamp = await query; 

    // Pagination result
    const pagination = {};

    if(endIndex > total){
        pagination.next= {
            page : page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.pre = {
            page : page - 1,
            limit 
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamp.length,
        pagination,
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
        location : {
            $geoWithin : { $centerSphere: [ [lng, lat] , radius ]  }
        }
    })


    res.status(200).json({
        success : true,
        count : bootcamps.length,
        data: bootcamps
    })
})