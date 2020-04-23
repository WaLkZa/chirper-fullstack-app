const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user')

exports.registerUser = (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password;

    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = User.create({
                name: name,
                password: hashedPassword
            })

            return user;
        })
        .then(result => {
            res.status(201).json({
                message: 'User created!',
                userId: result.id
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            
            next(err);
        });
}

exports.loginUser = (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password;
    let loadedUser;

    User.findOne({
            where: {
                name: name
            }
        })
        .then(user => {
            if (!user) {
                const error = new Error("A user with this name could not be found!")
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }

            const jsonWebToken = jwt.sign({
                    name: loadedUser.name,
                    userId: loadedUser.id
                },
                'somesupersecretsecret', {
                    expiresIn: '1h'
                }
            )

            res.status(200).json({
                token: jsonWebToken,
                userId: loadedUser.id
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}