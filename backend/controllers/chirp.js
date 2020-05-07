const sequelize = require('../util/database');
const {
    QueryTypes
} = require('sequelize')

const User = require('../models/user');
const Chirp = require('../models/chirp')
const HttpError = require('../models/http-error');

exports.allChirps = (req, res, next) => {
    Chirp.findAll({
            include: [{
                model: User
            }],
            order: [
                ['dateCreated', 'DESC']
            ]
        })
        .then(chirps => {
            if (!chirps) {
                throw new HttpError('No chirps in database!', 401);
            }

            res.status(200).json({
                chirps: chirps
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}

exports.allChirpsByFollowedUsers = (req, res, next) => {
    const userId = req.userId

    const query = `SELECT c.*, u2.name AS username FROM users AS u
                INNER JOIN followers AS f ON f.followerId = u.id
                INNER JOIN users AS u2 ON u2.id = f.followedId
                INNER JOIN chirps AS c ON c.userId = u2.id
                WHERE u.id = $id
                ORDER BY c.dateCreated DESC`;

    sequelize.query(query, {
            nest: true,
            bind: {
                id: userId
            },
            type: QueryTypes.SELECT
        })
        .then((chirps) => {
            res.status(200).json({
                chirps: chirps
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}

exports.allChirpsByAuthorID = (req, res, next) => {
    const authorId = +req.params.authorId;

    User.findByPk(authorId)
        .then((user) => {
            if (!user) {
                throw new HttpError(`Does not exist user with id ${authorId}`, 401);
            }

            Chirp.findAll({
                    where: {
                        userId: user.id
                    },
                    include: [{
                        model: User
                    }],
                    order: [
                        ['dateCreated', 'DESC']
                    ]
                })
                .then(chirps => {
                    if (!chirps || chirps.length === 0) {
                        throw new HttpError(`User ${user.name} does not have any chirps!`, 401);
                    }

                    res.status(200).json({
                        chirps: chirps
                    })
                })
                .catch(err => {
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }

                    next(err);
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
}

exports.chirpById = (req, res, next) => {
    const chirpId = +req.params.id;

    Chirp.findByPk(chirpId, {
            include: [{
                model: User
            }]
        })
        .then(chirp => {
            if (!chirp) {
                throw new HttpError('Could not find chirp.', 404);
            }

            res.status(200).json({
                chirp: chirp
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.chirpByAuthorName = (req, res, next) => {
    const authorName = req.params.authorName;

    Chirp.findOne({
            include: [{
                model: User,
                where: {
                    name: authorName
                }
            }]
        })
        .then(chirp => {
            if (!chirp) {
                throw new HttpError('Could not find chirp.', 404);
            }

            res.status(200).json({
                chirp: chirp
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.createChirp = (req, res, next) => {
    const content = req.body.content;
    const userId = req.userId

    Chirp.create({
            userId: userId,
            content: content,
            dateCreated: Date.now()
        })
        .then(result => {
            res.status(201).json({
                message: 'Chirp created successfully!',
                author: result.userId,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.editChirp = (req, res, next) => {
    const chirpId = +req.params.id;
    const content = req.body.content;

    Chirp.findByPk(chirpId)
        .then(chirp => {
            if (!chirp) {
                throw new HttpError('Could not find chirp.', 404);
            }

            //TODO investigate the order of checks
            if (chirp.userId !== req.userId) {
                throw new HttpError('Not authorized!', 403);
            }

            return chirp.update({
                content: content,
                dateCreated: Date.now()
            })
        })
        .then(updatedChirp => {
            res.status(200).json({
                message: 'Chirp updated!'
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.deleteChirp = (req, res, next) => {
    const chirpId = +req.params.id;

    Chirp.findByPk(chirpId)
        .then(chirp => {
            if (!chirp) {
                throw new HttpError('Could not find chirp.', 404);
            }

            //TODO investigate the order of checks
            if (chirp.userId !== req.userId) {
                throw new HttpError('Not authorized!', 403);
            }

            return chirp.destroy()
        })
        .then(result => {
            res.status(200).json({
                message: 'Chirp deleted!'
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}