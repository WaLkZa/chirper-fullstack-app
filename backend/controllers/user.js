const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user')
const Chirp = require('../models/chirp')
const HttpError = require('../models/http-error');

exports.allUsers = (req, res, next) => {
    User.findAll()
        .then(users => {
            if (!users) {
                throw new HttpError('No users in database!', 401);
            }

            res.status(200).json({
                users: users
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}

exports.userById = (req, res, next) => {
    const userId = +req.params.id;

    User.findByPk(userId, {
            include: [{
                model: Chirp
            }]
        })
        .then(user => {
            if (!user) {
                throw new HttpError(`A user with id ${userId} could not be found!`, 404);
            }

            res.status(200).json({
                user: user
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.registerUser = (req, res, next) => {
    const name = req.body.username;
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
            const jsonWebToken = createJsonWebToken(result.id, result.name);

            res.status(201).json({
                message: 'User created!',
                token: jsonWebToken,
                userId: result.id,
                username: result.name
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
    const name = req.body.username;
    const password = req.body.password;
    let loadedUser;

    User.findOne({
            where: {
                name: name
            }
        })
        .then(user => {
            if (!user) {
                throw new HttpError('A user with this name could not be found!', 401);
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                throw new HttpError('Wrong password!', 401);
            }

            const jsonWebToken = createJsonWebToken(loadedUser.id, loadedUser.name)

            res.status(200).json({
                token: jsonWebToken,
                userId: loadedUser.id,
                username: loadedUser.name
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}

exports.followUser = (req, res, next) => {
    const currentUserID = req.userId;
    const toFollowUserID = req.params.id;

    User.findByPk(currentUserID)
        .then(currentUser => {
            User.findByPk(toFollowUserID)
                .then(toFollowUser => {
                    if (!toFollowUser) {
                        throw new HttpError('Can not follow or unfollow non-existent user!', 401);
                    }

                    currentUser.hasFollowed(toFollowUser)
                        .then(hasFollowedResult => {
                            if (hasFollowedResult) {
                                currentUser.removeFollowed(toFollowUser)
                                    .then(result => {
                                        res.status(200).json({
                                            message: `You are unfollow ${toFollowUser.name}`
                                        });
                                    })

                            } else {
                                currentUser.addFollowed(toFollowUser)
                                    .then(result => {
                                        res.status(200).json({
                                            message: `You are following ${toFollowUser.name}`
                                        });
                                    })

                            }
                        })
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}

function createJsonWebToken(id, username) {
    return jwt.sign({
            userId: id,
            name: username
        },
        'somesupersecretsecret', {
            expiresIn: '1h'
        }
    );
}