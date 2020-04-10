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


// Routes files
const bootcamps = require('./Routes/bootcamps');
const courses = require('./Routes/courses');


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