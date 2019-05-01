var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const {body,validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function(req, res,next) {
    Genre.find()
    .sort([['name','ascending']])
    .exec((err,list_genre)=>{
       if(err){return next(err);}
       res.render('genre_list',{title : 'Genre List',genre_list : list_genre});
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res,next) {
    //res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
    async.parallel({
        genre:function(callback){
         Genre.findById(req.params.id)
         .exec(callback);
        },
        book_list:function(callback){
            Book.find({'genre':req.params.id})
            .exec(callback);
        }
    },function(err,results){
        if(err){return next(err);}
        if(results.genre == null){
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_details',{title:'Genre Details',genre:results.genre , book_list : results.book_list});

    })
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('create_genre',{title : 'Create Genre'});
};
/**
 * The first method in the array defines a validator (body) to check that the name field is not empty 
 * (calling trim() to remove any trailing/leading whitespace before performing the validation).
 *  The  second method in the array (sanitizeBody()) creates a sanitizer to trim() 
 * the name field and escape() any dangerous  HTML characters.
 */
// Handle Genre create on POST.
exports.genre_create_post = [
    //check required name field
    body('name','Genre Name required').isLength({min:2,max:10}).trim(),
    sanitizeBody('name').trim().escape(),
    (req,res,next)=>{
        const errors = validationResult(req);
        var genre = new Genre({
            name: req.body.name
        });
        if(!errors.isEmpty()){
            res.render('create_genre',{title:'Create Genre ',genre : genre,errors : errors.array()});
            return ;
        }
        else{
            Genre.findOne({'name': req.body.name})
            .exec((err,result)=>{
                if(err){return next(err);}
                if(result){
                   res.redirect(result.url);
                }
                else{
                    genre.save(function(err){
                        if(err){return next(err);}
                        res.redirect(genre.url)
                    });
                }
            })
        }

    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res,next) {
   async.parallel({
       genre : function(callback){
           Genre.findById(req.params.id)
           .exec(callback)
       },
       genre_books : function(callback){
           Book.find({'genre':req.params.id})
           .exec(callback)
       }
   },function(err,result){
       if(err){return next(err);}
       if(result.genre == null){
           res.redirect('/catalog/genrs');
       }else{
           res.render('delete_genre',{title: 'Delete Genre',genre:result.genre , genre_books : result.genre_books});
       }

   })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res,next) {
    async.parallel({
        genre : function(callback){
            Genre.findById(req.params.id)
            .exec(callback)
        },
        genre_books : function(callback){
            Book.find({'genre' : req.params.id})
            .exec(callback)
        }
    },function(err,result){
         if(err){return next(err);}
         if(result.genre_books.length > 0){
             res.render('delete_genre',{title : 'Delete Genre',genre : result.genre , genre_books : result.genre_books});
             return;
         }
         else{
             Genre.findByIdAndRemove(req.body.genreid,function deletegenre(err){
                 if(err){return next(err)}
                 res.redirect('/catalog/genres')
             })
         }
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res,next) {
    Genre.findById(req.params.id,function(err,genre){
    if(err){return next(err);}
    if(genre == null){
        const err =new  Error('Genre Not Found');
        err.status = 404;
        return next(err);
    }
    res.render('create_genre',{title : 'Update Genre',genre : genre});
    });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name').isLength({min : 1 , max:10}).trim().withMessage('Genre Name Must be specified').isAlphanumeric().withMessage('Name can not be numirec'),
    sanitizeBody('name').escape(),
    (req,res,next)=>{
        const errors = validationResult(req);
        var genre = new Genre({
            name : req.body.name,
            _id : req.params.id
        });
        if(!errors.isEmpty()){
            res.render('create_genre',{title : 'Update Genre',genre : genre , errors: errors.array()});
            return;
        }else{
            Genre.findByIdAndUpdate(req.params.id , genre  , {},function(err , genre){
                if(err){return next(err);}
                res.redirect(genre.url);
            });
        }
        
    }
];