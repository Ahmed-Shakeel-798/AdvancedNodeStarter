const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);

client.hget = util.promisify(client.hget);

// toggleable cache implementation
mongoose.Query.prototype._cache = function( options = {} ){
    this._useCache = true;
    this._hashKey = JSON.stringify(options.key || ''); // top level key for hashes, the caller of ._cache is expected to provide a key
    return this;
}

mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(){
    if(!this._useCache){
        return mongoose.Query.prototype._exec.apply(this, arguments);
    }

    // runs for queries where we do want cache implementation

    // this one now becomes field instead of key
    const field = JSON.stringify(Object.assign({}, this.getQuery(), {
       'collection':  this.mongooseCollection.name
    }));
    
    // See if key exists in cache (hash)
    const cacheValue = await client.hget(this._hashKey, field);

    // if yes, send the cacheValue back
    if(cacheValue){

        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    // else, normal execution
    const result = await mongoose.Query.prototype._exec.apply(this, arguments);
    // need to store the result in cache too
    client.hset(this._hashKey, field, JSON.stringify(result));

    return result;
};