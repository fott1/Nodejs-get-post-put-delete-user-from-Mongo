var mongoose    =   require("mongoose");
mongoose.connect('mongodb://localhost:27017/fotisdb');

// create instance of Schema
var mongoSchema =   mongoose.Schema;
// create schema
var userSchema  = {
    "userEmail" : String,
    "userPassword" : String,
    "userName"	: String
};
// create model if not exists.
module.exports = mongoose.model('userLogin',userSchema);