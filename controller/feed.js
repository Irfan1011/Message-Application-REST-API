const Post = require('../models/post');
const User = require('../models/user');
const fileHelper = require('../util/file');
const errors = require('../util/errors');

exports.getPosts = (req, res, next) => {
    const currentPage = +req.query.page || 1;
    const ITEM_PER_PAGES = 2;
    let totalItems;

    Post.find()
    .countDocuments()
    .then(postsCount => {
        totalItems = postsCount;
        return Post.find()
        .populate('creator')
        .skip((currentPage - 1) * ITEM_PER_PAGES)
        .limit(ITEM_PER_PAGES)
    })
    .then(posts => {
        res.status(200).json({
            message: 'Posts Fetched',
            posts: posts,
            totalItems: totalItems
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
    .populate('creator')
    .then(post => {
        if(!post) {
            errors.notFoundError();
        }
        res.status(200).json({
            message: 'Post Fetched',
            post: post
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.createPost = (req, res, next) => {
    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error
    }

    const imageUrl = req.file.path
    const title = req.body.title;
    const content = req.body.content;
    let creator;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    });
    
    post.save()
    .then(post => {
        return User.findById(req.userId);
    })
    .then(user => {
        creator = user;
        user.posts.push(post);
        return user.save();
    })
    .then(result => {
        res.status(201).json({
            message: 'Post Created!',
            post: post,
            creator: {
                _id: creator._id,
                name: creator.name
            }
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.patchPost = (req, res, next) => {
    const postId = req.params.postId;
    const { title, content } = req.body;
    const imageUrl = req.file;

    Post.findById(postId)
    .then(post => {
        if(!post) {
            errors.notFoundError();
        }

        if(post.creator.toString() !== req.userId) {
            errors.notAuthorizedError();
        }
        
        post.title = title,
        post.content = content

        if(imageUrl) {
            fileHelper.deleteFile(post.imageUrl); //delete old image
            post.imageUrl = imageUrl.path; //adding new image
        }

        return post.save()
    })
    .then(result => {
        res.status(200).json({
            message: 'Post Updated',
            post: result
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
    .then(post => {
        if(!post) {
            errors.notFoundError();
        }

        if(post.creator.toString() !== req.userId) {
            errors.notAuthorizedError();
        }

        fileHelper.deleteFile(post.imageUrl);

        return Post.findByIdAndDelete(postId);
    })
    .then(result => {
        return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        res.status(200).json({
            message: 'Post Deleted'
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

//Async Await for asyncronous code
//Async always place in front of function and await placed on the function
//Await is placed before the code that returns a promise, making it wait until the promise resolves.

//Asyncronous code could execute code at same time. Usually for mechanism like setTimeOut, Promise, and async/await
//Syncronous code executing code line by line

// exports.getPosts = async (req, res, next) => {
//     const currentPage = +req.query.page || 1;
//     const ITEM_PER_PAGES = 2;

//     try {
//         // These asynchronous operations are awaited one by one:
//         // 1. First, get the total number of posts (this returns a promise from Post.find().countDocuments()).
//         const totalItems = await Post.find().countDocuments();
//         // 2. Then, get the posts for the current page (this also returns a promise from Post.find().populate('creator').skip((currentPage - 1) * ITEM_PER_PAGES).limit(ITEM_PER_PAGES)).
//         const posts = await Post.find().populate('creator').skip((currentPage - 1) * ITEM_PER_PAGES).limit(ITEM_PER_PAGES);

//         // Once both asynchronous operations are complete, return the results
//         res.status(200).json({
//             message: 'Posts Fetched',
//             posts: posts,
//             totalItems: totalItems
//         })

//         // Both Post.find().countDocuments() and Post.find().skip(...).limit(...) are asynchronous operations that return promises. We use await to pause the execution of the code until these promises are resolved.
//         // The code waits for totalItems to be resolved first, and only then proceeds to fetch posts. After both are fetched, the response is sent to the client.
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500
//         }
//         next(err)
//     }
// }

// exports.getPost = async (req, res, next) => {
//     const postId = req.params.postId;

//     try {
//         const post = await Post.findById(postId).populate('creator');

//         if(!post) {
//             errors.notFoundError();
//         }

//         res.status(200).json({
//             message: 'Post Fetched',
//             post: post
//         })

//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500
//         }
//         next(err)
//     }
// }

// exports.createPost = async (req, res, next) => {
//     try {
//         if(!req.file) {
//             const error = new Error('No image provided');
//             error.statusCode = 422;
//             throw error
//         }

//         const imageUrl = req.file.path
//         const title = req.body.title;
//         const content = req.body.content;

//         const post = new Post({
//             title: title,
//             content: content,
//             imageUrl: imageUrl,
//             creator: req.userId,
//         });

//         await post.save();
//         const user = await User.findById(req.userId);

//         user.posts.push(post);
//         await user.save();

//         res.status(201).json({
//             message: 'Post Created!',
//             post: post,
//             creator: {
//                 _id: user._id,
//                 name: user.name
//             }
//         })
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500
//         }
//         next(err)
//     }
// }

// exports.patchPost = async (req, res, next) => {
//     try {
//         const postId = req.params.postId;
//         const { title, content } = req.body;
//         const imageUrl = req.file;
        
//         const post = await Post.findById(postId);

//         if(!post) {
//             errors.notFoundError();
//         }

//         if(post.creator.toString() !== req.userId) {
//             errors.notAuthorizedError();
//         }
        
//         post.title = title,
//         post.content = content
        
//         if(imageUrl) {
//             fileHelper.deleteFile(post.imageUrl); //delete old image
//             post.imageUrl = imageUrl.path; //adding new image
//         }

//         await post.save();

//         res.status(200).json({
//             message: 'Post Updated',
//             post: result
//         })
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500
//         }
//         next(err)
//     }
// }

// exports.deletePost = async (req, res, next) => {
//     try {
//         const postId = req.params.postId;
//         const post = await Post.findById(postId);
//         const user = await User.findById(req.userId);

//         if(!post) {
//             errors.notFoundError();
//         }

//         if(post.creator.toString() !== req.userId) {
//             errors.notAuthorizedError();
//         }

//         fileHelper.deleteFile(post.imageUrl);

//         await Post.findByIdAndDelete(postId);

//         user.posts.pull(postId);
//         await user.save();

//         res.status(200).json({
//             message: 'Post Deleted'
//         })
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500
//         }
//         next(err)
//     }
// }