const express = require('express');
const dotenv = require('dotenv');

// To add colors in terminal text
const colors = require('colors');


const app = express();

//Load env var
dotenv.config({path:'./config/config.env'});

//Coonect to database 
const connectDB= require('./config/db');
connectDB();

// Routes files
const bootcamps = require('./Routes/bootcamps');


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
app.use('/api/v1/bootcamp',bootcamps);











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