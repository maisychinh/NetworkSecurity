module.exports = () => {
    const appConfig = require("../package.json");
    const app = require("express")();

    app.fs = require('fs');
    app.path = require('path');
    app.port = appConfig.port;
    app.rootDir = require('../util/path');
    const server = require('http').createServer(app);
    server.listen(app.port);

    console.log(` - Debugging on localhost:${app.port}`);

    // Set up ---------------------------------------------------------------
    require("./bodyParser")(app);
    require("./ldap.admin")(app);
    require("./ldap.client")(app);

}