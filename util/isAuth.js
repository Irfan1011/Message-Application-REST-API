const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if(!authHeader) {
        notAuthenticated();
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, 'supersecretsecret');
    } catch(err) {
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken) {
        notAuthenticated();
    }

    req.userId = decodedToken.userId;
    next()
}

const notAuthenticated = () => {
    const  err = new Error('Not Authenticated');
    err.statusCode = 401;
    throw err
}