const sequelize = require('../util/database');
const {
    QueryTypes
} = require('sequelize')

const User = require('../models/user');
const Chirp = require('../models/chirp')
const HttpError = require('../models/http-error');

exports.allChirps = async (req, res, next) => {
    try {
        const chirps = await Chirp.findAll({
            include: [{
                model: User
            }],
            order: [
                ['dateCreated', 'DESC']
            ]
        });

        if (!chirps) {
            throw new HttpError('No chirps in database!', 401);
        }

        res.status(200).json({
            chirps: chirps
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.allChirpsByFollowedUsers = async (req, res, next) => {
    const userId = req.userId

    try {
        const query = `SELECT c.*, u2.name AS username FROM users AS u
                INNER JOIN followers AS f ON f.followerId = u.id
                INNER JOIN users AS u2 ON u2.id = f.followedId
                INNER JOIN chirps AS c ON c.userId = u2.id
                WHERE u.id = $id
                ORDER BY c.dateCreated DESC`;

        const chirps = await sequelize.query(query, {
            nest: true,
            bind: {
                id: userId
            },
            type: QueryTypes.SELECT
        });

        res.status(200).json({
            chirps: chirps
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.allChirpsByAuthorID = async (req, res, next) => {
    const authorId = req.params.authorId;

    try {
        const user = await User.findByPk(authorId);

        if (!user) {
            throw new HttpError(`A user with id ${authorId} could not be found!`, 404);
        }

        const chirps = await Chirp.findAll({
            where: {
                userId: user.id
            },
            include: [{
                model: User
            }],
            order: [
                ['dateCreated', 'DESC']
            ]
        });

        if (!chirps || chirps.length === 0) {
            throw new HttpError(`User ${user.name} does not have any chirps!`, 401);
        }

        res.status(200).json({
            chirps: chirps
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.chirpById = async (req, res, next) => {
    const chirpId = req.params.id;

    try {
        const chirp = await Chirp.findByPk(chirpId, {
            include: [{
                model: User
            }]
        });

        if (!chirp) {
            throw new HttpError(`Could not find chirp with id ${chirpId}`, 404);
        }

        res.status(200).json({
            chirp: chirp
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.createChirp = async (req, res, next) => {
    const content = req.body.content;
    const image = req.body.image
    const userId = req.userId

    try {
        const chirp = await Chirp.create({
            userId: userId,
            content: content,
            image: image || null,
            dateCreated: Date.now()
        });

        res.status(201).json({
            message: 'Chirp created successfully!',
            author: chirp.userId,
            chirpId: chirp.id
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.editChirp = async (req, res, next) => {
    const chirpId = req.params.id;
    const content = req.body.content;
    const image = req.body.image;

    try {
        const chirp = await Chirp.findByPk(chirpId);

        if (!chirp) {
            throw new HttpError(`Could not find chirp with id ${chirpId}`, 404);
        }

        //TODO investigate the order of checks
        if (chirp.userId !== req.userId) {
            throw new HttpError('Not authorized!', 403);
        }

        await chirp.update({
            content: content,
            dateCreated: Date.now(),
            image: image || null
        });

        res.status(200).json({
            message: 'Chirp updated!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.deleteChirp = async (req, res, next) => {
    const chirpId = req.params.id;

    try {
        const chirp = await Chirp.findByPk(chirpId);

        if (!chirp) {
            throw new HttpError(`Could not find chirp with id ${chirpId}`, 404);
        }

        //TODO investigate the order of checks
        if (chirp.userId !== req.userId) {
            throw new HttpError('Not authorized!', 403);
        }

        await chirp.destroy();

        res.status(200).json({
            message: 'Deleted chirp!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};