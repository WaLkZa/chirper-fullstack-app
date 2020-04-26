const User = require('../models/user');
const Chirp = require('../models/chirp')

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
                const error = new Error("No chirps in database!")
                error.statusCode = 401;
                throw error;
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

exports.allChirpsByAuthorID = (req, res, next) => {
    const authorId = +req.params.authorId;

    User.findByPk(authorId)
        .then((user) => {
            if (!user) {
                const error = new Error(`Does not exist user with id ${authorId}`)
                error.statusCode = 401;
                throw error;
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
                        const error = new Error(`User ${user.name} does not have any chirps!`)
                        error.statusCode = 401;
                        throw error;
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
                const error = new Error('Could not find chirp.');
                error.statusCode = 404;
                throw error;
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
                const error = new Error('Could not find chirp.');
                error.statusCode = 404;
                throw error;
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
                const error = new Error('Could not find chirp.');
                error.statusCode = 404;
                throw error;
            }

            if (chirp.userId !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
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
                const error = new Error('Could not find chirp.');
                error.statusCode = 404;
                throw error;
            }

            if (chirp.userId !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
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