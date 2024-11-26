const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION!.💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
