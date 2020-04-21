const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const port = 3000;

const userRoutes = require('./backend/routes/user');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use("/images", express.static(path.join("backend/images")));

app.use("/api/user", userRoutes);

app.listen(process.env.PORT || port, () => console.log(`Server is running at ${port} port`))

module.exports = app;