const express = require('express');

const { check } = require('express-validator');

const router = express.Router();

const feedController = require('../controller/feed');
const validationCheck = require('../controller/validationCheck');
const isAuth = require('../util/isAuth');

//GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);
router.post('/post', isAuth, validationCheck.checkPosts, validationCheck.validationHandler, feedController.createPost);
router.get('/post/:postId', isAuth, feedController.getPost);
router.patch('/post/:postId', isAuth, validationCheck.checkPosts, feedController.patchPost);
router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;