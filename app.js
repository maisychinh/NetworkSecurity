// Set up config --------------------------------------------------
const appConfig = require('./package.json');
const app = require('express')();
require('./config/server')(app, appConfig);
// require('./config/ldap.server')(app, appConfig);
// app.use((req, res, next) => {
//     res.status(404).sendFile(app.path.join(__dirname, 'views', '404.html'));
// });


