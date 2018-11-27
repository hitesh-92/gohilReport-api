var env = process.env.NODE_ENV || "development";

if(env === 'development' || env === 'test'){

    var config = require('./config.json')
    
    var envConfig = config[env];

    Object.keys(envConfig).forEach(key => {
        process.env[key] = envConfig[key];
    });
    console.log('-- env set --', envConfig)
}

//log env details on server start
console.log(
    `env: ${env} | ` +
    `port:${process.env.PORT} | ` +
    `db_uri: ${process.env.MONGODB_URI}`
);


// const ENV = require('dotenv')
// ENV.config()