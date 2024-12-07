# Node.js, Express, MongoDB & More: The Complete Bootcamp

To start the project, you need to install the dependencies. To do this, run the following command in the terminal:

```bash
  npm install
```

While dependencies are being installed, you can create a `.env` file in the root directory of the project. This file will contain the environment variables that the project needs. The following is an example of the content of the `.env` file:

```env
NODE_ENV=development
PORT=3000
DATABASE_LOCAL= create your own database in MongoDB

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# mailtrap.io details for testing email sending
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525

```


After installing the dependencies, you can start the project by running the following command in the terminal:

```bash
  npm start
```

