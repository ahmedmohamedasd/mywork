var express = require('express');
var router = express.Router();

//require controller modules
var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var book_instance_controller = require('../controllers/bookinstanceController');

//get catalog homepage

router.get('/',book_controller.index);
// Book roooot
//************************************************** */
//create book
router.get('/book/create',book_controller.book_create_get);
router.post('/book/create',book_controller.book_create_post);
//delete book
router.get('/book/:id/delete',book_controller.book_delete_get);
router.post('/book/:id/delete',book_controller.book_delete_post);
//update book
router.get('/book/:id/update',book_controller.book_update_get);
router.post('/book/:id/update',book_controller.book_update_post);
//get specific bbok
router.get('/book/:id',book_controller.book_detail);
//get list of book
router.get('/books',book_controller.book_list);
/*************************************************************** */
/**************Auther Router*********************************** */
//create author
router.get('/author/create',author_controller.author_create_get);
router.post('/author/create',author_controller.author_create_post);
//update author
router.get('/author/:id/update',author_controller.author_update_get);
router.post('/author/:id/update',author_controller.author_update_post);
//delete author
router.get('/author/:id/delete',author_controller.author_delete_get);
router.post('/author/:id/delete',author_controller.author_delete_post);
//get specific author
router.get('/author/:id',author_controller.author_detail);
//get all author
router.get('/authors',author_controller.author_list);
/******************************************************************** */
/***********************Genre*************************************** */
router.get('/genre/create', genre_controller.genre_create_get);
router.post('/genre/create', genre_controller.genre_create_post);
// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);
router.post('/genre/:id/delete', genre_controller.genre_delete_post);
// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);
router.post('/genre/:id/update', genre_controller.genre_update_post);
// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);
// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);
/*************************************************************** */
/*******************Book Instance *******************************/
// Create Bookinstance
router.get('/bookinstance/create', book_instance_controller.bookinstance_create_get); 
router.post('/bookinstance/create', book_instance_controller.bookinstance_create_post);
// GET request to delete BookInstance.
router.get('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_get);
router.post('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_post);
// GET request to update BookInstance.
router.get('/bookinstance/:id/update', book_instance_controller.bookinstance_update_get);
router.post('/bookinstance/:id/update', book_instance_controller.bookinstance_update_post);
// GET request for one BookInstance.
router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);
// GET request for list of all BookInstance.
router.get('/bookinstances', book_instance_controller.bookinstance_list);
/********************************************************************** */
//module exports
module.exports = router;

