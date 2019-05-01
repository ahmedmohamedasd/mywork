var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var {body,validationResult} = require('express-validator/check');
var{sanitizeBody} = require('express-validator/filter');

var async = require('async');
exports.index = function(req, res) {
    async.parallel({
        book_count:function(callback){
            Book.countDocuments({},callback);
        },
        book_instance_count:function(callback){
            BookInstance.countDocuments({},callback);
        },
        book_instance_available_count:function(callback){
            BookInstance.countDocuments({status : 'Available'},callback);
        },
        auther_count:function(callback){
            Author.countDocuments({},callback);
        },
        genre_count:function(callback){
            Genre.countDocuments({},callback);
        },
        specific_author:function(callback){
            Author.countDocuments({first_name :'Isaac'},callback);
        }
    },function(err,result){
        res.render('index',{title :'Book Library',error : err,data:result});
    });
};

// Display list of all books.
exports.book_list = function(req, res,next) {
    Book.find({},'title Author')
    .populate('author')
    .exec(function(err,list_books){
        if(err) {return next(err)}
        res.render('book_list',{title:'Book List',book_list:list_books});
    });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res,next) {
   // res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
   async.parallel({
       book:function(callback){
           Book.findById(req.params.id)
           .populate('author')
           .populate('genre')
           .exec(callback);
       },
       bookinstance:function(callback){
           BookInstance.find({'book':req.params.id})
           .exec(callback);
       }
   },function(err,result){
       if(err){return next(err);}
       if(result.book == null){
           var err = new Error('Book Not found');
           err.status = 404;
           return next(err);
       }
       res.render('book_details',{title:'Book Details',book:result.book, bookinstance : result.bookinstance});
   });
};

// Display book create form on GET.
exports.book_create_get = function(req, res,next) {
    async.parallel({
        genre:function(callback){
           Genre.find(callback);
        },
        author:function(callback){
            Author.find(callback);
        }
    },function(err,results){
       if(err){return next(err);}
       res.render('create_book',{title:'Add Book',genres : results.genre,authors:results.author});
    });
};

// Handle book create on POST.
exports.book_create_post = [
    //convert Genre to ann array
  (req,res,next)=>{
    if(!(req.body.genre instanceof Array)){
        if(typeof req.body.genre === 'undefined'){
            req.body.genre =[];
        }
        else{
            req.body.genre = new Array(req.body.genre);
        }
    }
    next();
  },
  //check validation field
  body('title','Title must not be empty').trim().escape(),
  body('summary','Summary must not be empty').trim().escape(),
  body('author','Author must not be empty').trim().escape(),
  body('isbn','ISBN must not be empty').trim().escape(),
   
  //sanitized 
  sanitizeBody('*').trim().escape(),
  (req,res,next)=>{
      //process requiest after validation and sanitization
      const errors = validationResult(req);
      var book = new Book({
          title:req.body.title,
          summary:req.body.summary,
          author:req.body.author,
          genre:req.body.genre,
          isbn:req.body.isbn
      });
     //check error list
     if(!errors.isEmpty()){
         async.parallel({
             author:function(callback){
                 Author.find(callback);
             },
             genre:function(callback){
                 Genre.find(callback);
             },function (err,result) {
                 if(err){return next(err);}
                 for(i=0 ;i<result.genre.length;i++){
                    if(book.genre.indexOf(result.genre[i]._id)> -1){
                        result.genre[i].checked = true;
                    }
                 }
                 res.render('create_book',{title:'Add Book',book:book , genres:result.genre , authors:result.author , errors:errors});

             }
         })
     }else{
         book.save((err)=>{
             if(err){return next(err);}
             res.redirect(book.url);
         });
     }


  }

];

// Display book delete form on GET.
exports.book_delete_get = function(req, res,next) {
    Book.findById(req.params.id).then((result)=>{
        
        if(result == null){
            res.redirect('/catalog/books');
        }
        res.render('book_delete',{title:'Delete Book',book : result})
    })
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res,next) {
    Book.findByIdAndRemove(req.body.bookid , function deletebook(err){
        if(err){return next(err);}
        res.redirect('/catalog/books')
    })
};

// Display book update form on GET.
exports.book_update_get = function(req, res,next) {
    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book==null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render('create_book', { title: 'Update Book', authors:results.authors, genres:results.genres, book: results.book });
        });
};

// Handle book update on POST.
exports.book_update_post =[

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('create_book', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];