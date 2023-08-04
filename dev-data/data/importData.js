const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Pet = require('../../models/petModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

//CONNECTING MONGOOSE
//REPLACING PASSWORD IN CONNECTION STRING
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

//CONNECTING DATABASE
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful'));

//READ JSON FILE
const pets = JSON.parse(
  fs.readFileSync(`${__dirname}/pet-api-data.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//IMPORT DATA INTO THE DATABASE
const importData = async () => {
  try {
    // await Pet.create(pets);
    // await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
  try {
    // await Pet.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();

    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
