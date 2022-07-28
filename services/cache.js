const mongoose = require('mongoose');

mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(){
    console.log('I am about to run a query');

    return await mongoose.Query.prototype._exec.apply(this, arguments);
};