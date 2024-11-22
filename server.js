const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
