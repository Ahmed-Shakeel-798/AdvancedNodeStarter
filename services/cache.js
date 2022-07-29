const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);

client.get = util.promisify(client.get);

// toggleable cache implementation
mongoose.Query.prototype._cache = function(){
    this._useCache = true;
    return this;
}

mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(){
    if(!this._useCache){
        console.log('[+] => Normal exec');
        return mongoose.Query.prototype._exec.apply(this, arguments);
    }

    // runs for queries where we do want cache implementation
    console.log('[+] => Cache exec');

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
       'collection':  this.mongooseCollection.name
    }));
    
    // See if key exists in cache

    const cacheValue = await client.get(key);

    // if yes, send the cacheValue back
    if(cacheValue){
        console.log('[+] => Serving from Cache');

        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    // else, normal execution
    const result = await mongoose.Query.prototype._exec.apply(this, arguments);
    client.set(key, JSON.stringify(result));

    return result;
};