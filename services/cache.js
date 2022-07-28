const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);

client.get = util.promisify(client.get);

mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(){
    console.log('I am about to run a query');

    const key = Object.assign({}, this.getQuery(), {
       'collection':  this.mongooseCollection.name
    });
    console.log(key);

    return await mongoose.Query.prototype._exec.apply(this, arguments);
};