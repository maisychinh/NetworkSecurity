module.exports = (app, appConfig) => {
    app.database = {};
    // Connect MongoDB ----------------------------------------------------------------------------
    const mongoConnectionString = `mongodb://localhost:${appConfig.db.mongoDB.port}/${appConfig.db.mongoDB.dbName}`;
    const mongoose = require('mongoose');
    mongoose.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connection.on('error', console.error.bind(console, ' - The MongoDB connection failed!'));
    mongoose.connection.once('open', () => console.log(' - The MongoDB connection succeeded.'));
    app.database.mongoDB = { Schema: mongoose.Schema, model: mongoose.model };
};