// Set up config --------------------------------------------------
const appConfig = require('./package.json');
const app = require('express')();
require('./config/server')(app, appConfig);
require('./config/ldap')(app, appConfig);

