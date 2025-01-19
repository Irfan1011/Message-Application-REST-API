exports.notFoundError = () => {
    const err = new Error('Post Not Found');
    err.statusCode = 404;
    throw err;
}

exports.notAuthorizedError = () => {
    const err = new Error('Not Authorized');
    err.statusCode = 403;
    throw err;
}