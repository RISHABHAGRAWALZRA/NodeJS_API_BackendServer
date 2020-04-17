const express = require('express');

const {getBootcamps, 
    getBootcamp, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
} 
= require('../controller/bootcamps');

//Adding middleware
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

//Adding protect middleware
const { protect,authorize } = require('../middleware/auth');


const router = express.Router();

//Include other resource routers
const courseRouter = require('./courses');
const reviewsRouter = require('./reviews');
//Re-route into other resource routes
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewsRouter);



// Second method
//const {getCourses}=require('../controller/courses');
//router.route('/:bootcampId/courses').get(getCourses);


router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);


router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect,authorize('publisher','admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect,authorize('publisher','admin'), updateBootcamp)
    .delete(protect,authorize('publisher','admin'), deleteBootcamp); 

 router.route('/:id/photo').put(protect,authorize('publisher','admin'), bootcampPhotoUpload);



module.exports = router;


/*router.get('/',(req, res)=>{
    res
    .status(200)
    .json({success:true, msg:"Show all Bootcamp"})
});

router.get('/:id',(req, res)=>{
    res
    .status(200)
    .json({success:true, msg:`Show Bootcamp ${req.params.id}`})
});

router.post('/',(req, res)=>{
    res
    .status(200)
    .json({success:true, msg:"Create new bootcamp"})
});

router.put('/:id',(req, res)=>{
    res
    .status(200)
    .json({success:true, msg:`Update bootcamp ${req.params.id}`})
});

router.delete('/:id',(req, res)=>{
    res
    .status(200)
    .json({success:true, msg:`Delete bootcamp ${req.params.id}`})
});
*/
