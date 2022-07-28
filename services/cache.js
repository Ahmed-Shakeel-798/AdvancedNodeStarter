const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);

client.get = util.promisify(client.get);

mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(){
    console.log(this.getQuery());

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
       'collection':  this.mongooseCollection.name
    }));
    
    console.log(key);
    // See if key exists in cache
    const cacheValue = await client.get(key);

    // if yes, send the cacheValue back
    if(cacheValue){
        console.log('SERVING FROM CACHE');
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    // else, normal execution
    const result = await mongoose.Query.prototype._exec.apply(this, arguments);
    client.set(key, JSON.stringify(result));

    console.log('SERVING FROM MONGO');
    return result;
};