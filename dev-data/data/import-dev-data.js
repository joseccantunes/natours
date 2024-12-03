const fs = require('fs');

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Tour = require('../../models/tourModel');

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('DB connection successful'));

//READ FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data succesfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data succesfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);

if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
}
