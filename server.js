const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
