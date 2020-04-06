

// @desc    GET all bootcamps
// @routes  GET api/v1/bootcamps
// @access  public
exports.getBootcamps = (req ,res ,next) => {
    res
    .status(200)
    .json({success:true, msg:"Show all bootcamp"});
}


// @desc    GET single bootcamps
// @routes  GET api/v1/bootcamps/:id
// @access  public
exports.getBootcamp = (req ,res ,next) => {
    res
    .status(200)
    .json({success:true, msg:`Show bootcamp ${req.params.id}`})
}


// @desc    Create new bootcamp
// @routes  POST api/v1/bootcamps
// @access  private
exports.createBootcamp = (req ,res ,next) => {
    res
    .status(200)
    .json({success:true, msg:"Create new bootcamp"})
}


// @desc    Update  bootcamp
// @routes  PUT api/v1/bootcamps/:id
// @access  private
exports.updateBootcamp = (req ,res ,next) => {
    res
    .status(200)
    .json({success:true, msg:`Update bootcamp ${req.params.id}`})
}

// @desc    Delete bootcamp
// @routes  Delete api/v1/bootcamps/:id
// @access  private
exports.deleteBootcamp = (req ,res ,next) => {
    res
    .status(200)
    .json({success:true, msg:`Delete bootcamp ${req.params.id}`})
}