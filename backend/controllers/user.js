const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');
const {
    QueryTypes
} = require('sequelize')

const User = require('../models/user')
const Chirp = require('../models/chirp')
const HttpError = require('../models/http-error');

exports.allUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();

        if (!users) {
            throw new HttpError('No users in database!', 401);
        }

        res.status(200).json({
            users: users
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.userById = async (req, res, next) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId, {
            include: [{
                model: Chirp
            }]
        })

        if (!user) {
            throw new HttpError(`A user with id ${userId} could not be found!`, 404);
        }

        res.status(200).json({
            user: user
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.registerUser = async (req, res, next) => {
    const name = req.body.username;
    const password = req.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name,
            password: hashedPassword
        });

        const jsonWebToken = createJsonWebToken(user.id, user.name);

        res.status(201).json({
            message: 'User created!',
            token: jsonWebToken,
            userId: user.id,
            username: user.name
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.loginUser = async (req, res, next) => {
    const name = req.body.username;
    const password = req.body.password;

    try {
        const user = await User.findOne({
            where: {
                name: name
            }
        });

        if (!user) {
            throw new HttpError(`A user with name ${name} could not be found!`, 404);
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            throw new HttpError('Wrong password!', 401);
        }

        const jsonWebToken = createJsonWebToken(user.id, user.name);

        res.status(200).json({
            token: jsonWebToken,
            userId: user.id,
            username: user.name
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.followUser = async (req, res, next) => {
    const currentUserID = req.userId;
    const toFollowUserID = req.params.id;

    try {
        const currentUser = await User.findByPk(currentUserID);
        const toFollowUser = await User.findByPk(toFollowUserID);

        if (!toFollowUser) {
            throw new HttpError('Can not follow or unfollow non-existent user!', 404);
        }

        const hasFollowedResult = await currentUser.hasFollowed(toFollowUser);

        if (hasFollowedResult) {
            await currentUser.removeFollowed(toFollowUser);

            res.status(200).json({
                message: `You are unfollow ${toFollowUser.name}`
            });
        } else {
            await currentUser.addFollowed(toFollowUser);

            res.status(200).json({
                message: `You are following ${toFollowUser.name}`
            });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.isUserFollowed = async (req, res, next) => {
    const currentUserID = req.userId;
    const isFollowedUserID = req.params.id;

    try {
        const currentUser = await User.findByPk(currentUserID);
        const isFollowedUser = await User.findByPk(isFollowedUserID);

        if (!isFollowedUser) {
            throw new HttpError(`A user with id ${isFollowedUserID} could not be found!`, 404);
        }

        const isFollowedResult = await currentUser.hasFollowed(isFollowedUser);

        res.status(200).json({
            isFollowed: isFollowedResult
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

exports.userStats = async (req, res, next) => {
    const userId = req.params.id;

    try {
        const query = `SELECT
        (SELECT COUNT(*) FROM followers
            WHERE followerId = $userId) AS followingCount,
        (SELECT COUNT(*) FROM followers
            WHERE followedId = $userId) AS followersCount`

        const user = await User.findByPk(userId);

        if (!user) {
            throw new HttpError(`A user with id ${userId} could not be found!`, 404);
        }

        const stats = await sequelize.query(query, {
            nest: true,
            bind: {
                userId: userId
            },
            type: QueryTypes.SELECT
        });

        res.status(200).json({
            stats: stats
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
};

function createJsonWebToken(id, username) {
    return jwt.sign({
            userId: id,
            name: username
        },
        'somesupersecretsecret', {
            expiresIn: '1h'
        }
    );
};