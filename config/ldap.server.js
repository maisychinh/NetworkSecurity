module.exports = (app, appConfig) => {
    const ldap = require('ldapjs');
    const serverLdap = ldap.createServer();
    serverLdap.listen(appConfig.ldapPort, 'localhost', function () {
        console.log(' - LDAP server listening at: ' + serverLdap.url);
    });

    // serverLdap.use(function (req, res, next) {
    //     console.log('hello world');
    //     return next();
    // });

    // function authorize(req, res, next) {
    //     if (!req.connection.ldap.bindDN.equals('cn=root'))
    //         return next(new ldap.InsufficientAccessRightsError());
    //     return next();
    // }

    app.ldap = {
        // search: (req, res, next) => serverLdap.search('o=example', authorize, function (req, res, next) { }),

        // add: (req, res, next) => serverLdap.add('ou=people, o=example', (req, res, next) => {
        //     console.log('DN: ' + req.dn.toString());
        //     console.log('Entry attributes: ' + req.toObject().attributes);
        //     res.end();
        // }),


    };
};