const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./backend/util/database')
const bcrypt = require('bcryptjs');
const cors = require("cors");

const User = require('./backend/models/user')
const Chirp = require('./backend/models/chirp')

const port = 3000;

const userRoutes = require('./backend/routes/user');
const chirpRoutes = require('./backend/routes/chirp');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use("/images", express.static(path.join("backend/images")));

app.use("/api/user", userRoutes);
app.use("/api/chirp", chirpRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
});

User.belongsToMany(Chirp, {
    through: 'likes',
    timestamps: false
})

Chirp.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
})
User.hasMany(Chirp)

User.belongsToMany(User, {
    foreignKey: 'followerId',
    as: 'followed',
    through: 'followers',
    timestamps: false
})


//only for debug
// const model = User
// for (let assoc of Object.keys(model.associations)) {
//     for (let accessor of Object.keys(model.associations[assoc].accessors)) {
//         console.log(model.name + '.' + model.associations[assoc].accessors[accessor] + '()');
//     }
// }

sequelize
    .sync()
    .then(result => {
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            const defaultName = 'Simo'
            const defaultPassword = 'topsecret'
            bcrypt.hash(defaultPassword, 12)
                .then(hashedPassword => {
                    return User.create({
                        name: defaultName,
                        password: hashedPassword
                    });
                })
            return user;
        }
    })
    .then(result => {
        app.listen(process.env.PORT || port, () => console.log(`Server is running at ${port} port`))
    })
    .catch(err => {
        console.log(err);
    });

module.exports = app;