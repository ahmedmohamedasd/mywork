var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment  = require('moment');

var BookInstance = new Schema({
    book:{type:Schema.Types.ObjectId , ref: 'Book'},
    imprint : {type:String , required: true},
    status : {type:String , required : true , enum:['Available', 'Maintenance', 'Loaned', 'Reserved'], default:'Maintenance'},
    due_back : {type: Date , default:Date.now}
});

//create virtual 
BookInstance.virtual('url').get(function(){
    return '/catalog/bookinstance/' + this._id;
});
BookInstance.virtual('due_back_formatted').get(()=>{
    return moment(this.due_back).format('MMMM Do,YYYY');
});
module.exports = mongoose.model('BookInstance',BookInstance);