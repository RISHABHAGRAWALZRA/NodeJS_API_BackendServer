const express = require('express');
const dotenv = require('dotenv');

// To add colors in terminal text
const colors = require('colors');

//Load env var
dotenv.config({path:'./config/config.env'});

//Coonect to database 
const connectDB= require('./config/db');
connectDB();

const app = express();

// Body parser
app.use(express.json());

//Cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());


//File uploading
const fileupload = require('express-fileupload');
app.use(fileupload());

//Sanitize Data
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

//Set security header
const helmet = require('helmet');
app.use(helmet());

//Prevent XSS attack
const xss = require('xss-clean');
app.use(xss());

//Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs : 10 * 60 * 1000, // 10 min
    max : 100
})
app.use(limiter);


//hpp
const hpp = require('hpp');
app.use(hpp());

//Enable CORS
const cors = require('cors');
app.use(cors());

//Set static folder
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));




// Routes files
const bootcamps = require('./Routes/bootcamps');
const courses = require('./Routes/courses');
const auth = require('./Routes/auth');
const users = require('./Routes/users');
const reviews = require('./Routes/reviews');


// Custom Logger file
/*const logger = require('./middleware/logger');
app.use(logger);*/



// Morgan
const morgan= require('morgan');
//Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}


// Mount Routers
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);



//Middleware error   (To use middleware it has to be in right order)
const errorHandler = require('./middleware/error');
app.use(errorHandler);








const PORT = process.env.PORT || 5000;


const server = app.listen(PORT
    ,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
    );

// handle unhandled promise rejection
process.on('unhandledRejection',(err,Promise)=>{
    console.log(`Error: ${err.message}`);
    // close server & exit process 
    server.close(() =>  process.exit(1));
});    