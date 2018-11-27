var env = process.env.NODE_ENV || "development";

if(env === 'development' || env === 'test'){

    var config = require('./config.json')
    
    var envConfig = config[env];

    Object.keys(envConfig).forEach(key => {
        process.env[key] = envConfig[key];
    });
}
var uri = process.env.MONGODB_URI
console.log(uri)
console.log(typeof uri)

console.log(`env: ${env} | port:${process.env.PORT} | db_uri:${uri}`);