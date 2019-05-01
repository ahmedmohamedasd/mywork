var mongoose = require('mongoose');
var schema = mongoose.Schema;
var moment = require('moment');

var AuthorSchema = new schema({
    first_name:{type:String,required:true,max:100},
    family_name:{type:String,required:true,max:100},
    date_of_birth:{type:Date},
    date_of_death:{type:Date}
});
//create virtual for auther name,lifespan,url
AuthorSchema.virtual('name').get(function(){
   return this.family_name + ' ' + this.first_name;
});

AuthorSchema.virtual('lifespan').get(function(){
    return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});
AuthorSchema.virtual('url').get(function(){
    return '/catalog/author/' + this._id;
});
AuthorSchema.virtual('date_of_birth_formatted').get(()=>{
    return this.date_of_birth? moment(this.date_of_birth).format('MMMM Do,YYYY'): '';
});
AuthorSchema.virtual('date_of_death_formatted').get(()=>{
    return moment(this.date_of_death).format('MMMM Do,YYYY');
});
module.exports = mongoose.model('Author',AuthorSchema);