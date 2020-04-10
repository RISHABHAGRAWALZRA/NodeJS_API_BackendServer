const express = require('express');

const {getBootcamps, 
    getBootcamp, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp,
    getBootcampInRadius
} 
= require('../controller/bootcamps');


const router = express.Router();

//Include other resource routers
const courseRouter = require('./courses');
//Re-route into other resource routes
router.use('/:bootcampId/courses', courseRouter);


// Second method
//const {getCourses}=require('../controller/courses');
//router.route('/:bootcampId/courses').get(getCourses);


router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);


router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp); 


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
