const User = require('../models/user');

const { check, validationResult } = require('express-validator')

exports.checkPosts = [
    check('title').not().isEmpty().withMessage('Title cant be empty').isLength({min: 5}).withMessage('Title has minimum 5 length character').trim(),
    check('content').not().isEmpty().withMessage('Content cant be empty').isLength({min:5}).withMessage('Content has minimum 5 length character').trim()
]

exports.checkSignup = [
    check('email').isEmail().withMessage('Please enter a valid email').custom((value, {req}) => {
        return User.findOne({email: value})
        .then(user => {
            if(user) {
                return Promise.reject('Email already exist')
            }
        })
    }).normalizeEmail(),
    check('password').isLength({min: 5}).withMessage('Password should at least 5 length').not().isEmpty().trim(),
    check('name').isLength({min: 5}).withMessage('Password should at least 5 length').not().isEmpty().trim()
]

exports.validationHandler = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    } else {
        next();
    }
}