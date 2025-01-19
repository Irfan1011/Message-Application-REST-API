const User = require('../models/user');
const errors = require('../util/errors');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const { email, password, name } = req.body;

    bcrypt.hash(password, 12)
    .then(hashPassword => {
        const user = new User({
            email: email,
            password: hashPassword,
            name: name
        })
        return user.save()
    })
    .then(result => {
        res.status(201).json({
            message: 'User created',
            userId: result._id
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    let tempUser;

    User.findOne({email: email})
    .then(user => {
        if(!user) {
            errors.notFoundError();
        }
        
        tempUser = user;

        return bcrypt.compare(password, user.password);
    })
    .then(matchPw => {
        if(!matchPw) {
            const error = new Error('Password incorrect');
            error.statusCode = 401;
            throw error;
        }

        return jwt.sign({
            email: tempUser.email,
            userId: tempUser._id.toString()
        },'supersecretsecret', {expiresIn: '1h'});
    })
    .then(token => {
        res.status(200).json({
            token: token,
            userId: tempUser._id.toString()
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
    .then(user => {
        if(!user) {
            errors.notFoundError()
        }

        res.status(200).json({
            message: 'Status retrived',
            status: user.status
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.patchStatus = (req, res, next) => {
    const status = req.body.status;

    User.findById(req.userId)
    .then(user => {
        if(!user) {
            errors.notFoundError();
        }

        user.status = status;
        return user.save();
    })
    .then(result => {
        res.status(200).json({
            message: 'Status Updated',
            status: result.status
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

//Async Await for asyncronous code
//Async always place in front of function and await placed on the function
//Await is placed before the code that returns a promise, making it wait until the promise resolves.

//Asyncronous code could execute code at same time. Usually for mechanism like setTimeOut, Promise, and async/await
//Syncronous code executing code line by line

// exports.signup = async (req, res, next) => {
//     try{
//         const { email, password, name } = req.body;
//         const hashPassword = await bcrypt.hash(password, 12);

//         const user = new User({
//             email: email,
//             password: hashPassword,
//             name: name
//         })

//         await user.save();

//         res.status(201).json({
//             message: 'User created',
//             userId: user._id
//         })
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500
//         }
//         next(err);
//     }
// }

// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({email: email});

//         if(!user) {
//             errors.notFoundError();
//         }

//         const comparedPw = await bcrypt.compare(password, user.password);
        
//         if(!comparedPw) {
//             const error = new Error('Password incorrect');
//             error.statusCode = 401;
//             throw error;
//         }

//         const token = await jwt.sign({
//             email: user.email,
//             userId: user._id.toString()
//         },'supersecretsecret', {expiresIn: '1h'});

//         res.status(200).json({
//             token: token,
//             userId: user._id.toString()
//         })
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500
//         }
//         next(err);
//     }
// }

// exports.getStatus = async (req, res, next) => {
//     try {
//         const user = await User.findById(req.userId);

//         if(!user) {
//             errors.notFoundError()
//         }

//         res.status(200).json({
//             message: 'Status retrived',
//             status: user.status
//         })
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err);
//     }
// }

// exports.patchStatus = async (req, res, next) => {
//     try {
//         const status = req.body.status;
//         const user = await User.findById(req.userId);

//         if(!user) {
//             errors.notFoundError();
//         }

//         user.status = status;
//         await user.save();

//         res.status(200).json({
//             message: 'Status Updated',
//             status: user.status
//         })
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err);
//     }
// }