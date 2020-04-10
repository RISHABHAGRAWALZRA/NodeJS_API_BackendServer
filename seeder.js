const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({path: './config/config.env'});

// Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

//connect to DB
mongoose.connect(process.env.MONGO_URI, {  
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

//Read JSON files
const bootcamps =JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8'));
const couses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8'));


//Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(couses);

        console.log('Data Imported...'.rainbow.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}


//Delete Data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();

        console.log('Data Destroyed...'.rainbow.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}


if(process.argv[2]=='-i'){
    importData();
}else if(process.argv[2]=='-d'){
    deleteData();
}