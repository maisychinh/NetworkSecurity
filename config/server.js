module.exports = (app, appConfig) => {
    app.fs = require('fs');
    app.path = require('path');
    const express = require('express');
    app.port = appConfig.port;
    const server = require('http').createServer(app);
    server.listen(app.port);
    console.log(` - Debugging main app on localhost:${app.port}`);

    app.publicPath = app.path.join(__dirname, '../public');
    app.imagePath = app.path.join(app.publicPath, 'img');
    app.viewPath = app.path.join(__dirname, '../view');
    app.modulesPath = app.path.join(__dirname, '../modules');
    app.faviconPath = app.path.join(app.imagePath, 'favicon.png');

    // Set up ---------------------------------------------------------------
    require('./lib/fs')(app);
    require('./request-config')(app, express);
    require('./io')(app);
    require('./database')(app, appConfig);
    require('./common')(app, appConfig);
    require('./view')(app, express);
    require('./permission')(app);

    app.createTemplate('login', 'admin');
    app.loadModules();
};