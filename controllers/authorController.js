var Author = require('../models/author');
var Book = require('../models/book');
var async = require('async');
var {body,validationResult}=require('express-validator/check');
var {sanitizeBody} = require('express-validator/filter');

//Display List of all author

exports.author_list = function(req,res,next){
    Author.find()
    .sort([['family_name','ascending']])
    .exec((err,list_author)=>{
        if(err){return next(err);}
        res.render('author_list',{title:'Auther List',author_list : list_author});
    });
    
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res,next) {
   // res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
   async.parallel({
       author:function(callback){
            Author.findById(req.params.id)
            .exec(callback);
       },
       book:function(callback){
           Book.find({'author':req.params.id})
           .exec(callback);
       }
   },function(err,result){
       if(err){return next(err);}
       if(result.author ==null){
           var err = new Error("Author not found");
           err.status = 404;
           return next(err);
       }
       res.render('author_details',{title:'Author Detail',author:result.author , book:result.book});
   });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('create_author',{title:'Create Author'});
};

// Handle Author create on POST.
exports.author_create_post = [
    //validation fieald
   body('first_name').isLength({min:3,max:10}).trim().withMessage('First name must be Specified')
   .isAlphanumeric().withMessage('can not use alphabet charachter'),
   body('family_name').isLength({min:3,max:10}).trim().withMessage('Family Name must be required')
   .isAlphanumeric().withMessage('can not use alphabet charachter'),
   body('date_of_birth','Invalid Date of Birth').optional({checkFalsy:true}).isISO8601(),
   body('date_of_death','Invalid Date of Death').optional({checkFalsy:true}).isISO8601(),
   //sanitized field
   sanitizeBody('first_name').trim().escape(),
   sanitizeBody('family_name').trim().escape(),
   sanitizeBody('date_of_birth').toDate(),
   sanitizeBody('date_of_death'),
   (req,res,next)=>{
       const errors = validationResult(req);
       if(!errors.isEmpty()){
        res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
        return;
       }else {
        // Data from form is valid.

        // Create an Author object with escaped and trimmed data.
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
        author.save(function (err) {
            if (err) { return next(err); }
            // Successful - redirect to new author record.
            res.redirect(author.url);
        });
   }
 }
];
// Display Author delete form on GET.
exports.author_delete_get = function(req, res,next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            res.redirect('/catalog/authors');
        }
        // Successful, so render.
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res,next) {
    async.parallel({
        author: function(callback) {
          Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/authors')
            })
        }
    });
};

// Display Author update form on GET.
exports.author_update_get = function(req, res,next) {
    Author.findById(req.params.id,function(err,author){
        if(err){return next(err);}
        if(author ==null){
         var err = new Error('Author not found');
         err.status =404;
         return next(err);

        }
        res.render('create_author',{title : 'Update Author',author : author});
    });
};

// Handle Author update on POST.
exports.author_update_post = [
    body('first_name').isLength({min : 1}).trim().withMessage('First name must be specified').isAlphanumeric().withMessage('First name Has not alpha numirec'),
    body('family_name').isLength({min : 1}).trim().withMessage('First name must be specified').isAlphanumeric().withMessage('First name Has not alpha numirec'),
    body('date_of_birth','Invalid Date Of Birth').optional({checkFalsy : true}).isISO8601(),
    body('date_of_death','Invalid Date Of Death').optional({checkFalsy : true}).isISO8601(),
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_beath').toDate(),
    (req,res,next)=>{
       const errors = validationResult(req);
       var author = new Author({
           first_name : req.body.first_name,
           family_name : req.body.family_name,
           date_of_birth : req.body.date_of_birth,
           date_of_death : req.body.date_of_death,
           _id : req.params.id
       });
       
       if(!errors.isEmpty()){
           res.render('create_author',{title : 'Update Author',author: author , errors : errors.array()})
            return;
        }else{
            Author.findByIdAndUpdate(req.params.id , author , {}, function(err,author){
                if(err){return next(err);}
                res.redirect(author.url);
            });
        }

    }
];