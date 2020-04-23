const Chirp = require('../models/chirp')

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
    const chirpId = req.params.id;
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
    const chirpId = req.params.id;

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