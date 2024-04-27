const fs = require('fs');
module.exports = (client) => {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(`./${file}`);
        const name = file.slice(0,-3);
        client.on(name, (...args) => event(client, ...args));
    }
    
    process
        .on('unhandledRejection', err => require('./unhandledRejection')(client, err))
        .on('uncaughtException', err => require('./uncaughtException')(client, err));
};