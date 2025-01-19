const fs = require('fs');
const path = require('path');

//this code using file system to help delete uneeded files
exports.deleteFile = (filePath) => {
    const resolvedPath = filePath.replace(/^[/\\]+/, '') //because in database path is '/images\image.jpg' therefore adding replace() to remove any extra slash into correct path 'images\image.jpg
    fs.unlink(resolvedPath, (err) => {
        if(err) {
            return new Error(err);
        }
    })
}