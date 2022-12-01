module.exports = (app, appConfig) => {
    const ldap = require('ldapjs'),
        { authenticate } = require('ldap-authentication');
    const client = ldap.createClient({ url: `ldap://${appConfig.ldap.ip}:${appConfig.ldap.port}` });
    client.bind(appConfig.ldap.username, appConfig.ldap.password, error => {
        if (error) {
            console.log(' - Error LDAP connection:', error);
        } else {
            console.log(` - Connect to LDAP Server at ${client.host}:${client.port}`);
            app.ldap = {
                search: (type = 'staff', userId, done) => new Promise(resolve => {
                    // type = 'staff' || 'student' || 'outsider'
                    client.search(`uid=${userId},ou=${type},dc=ussh,dc=edu,dc=vn`, {}, (error, result) => {
                        if (error) {
                            console.log('Error: Search =>', error);
                            done(error);
                            resolve({ error });
                        } else {
                            result.on('searchRequest', (searchRequest) => {
                                console.log('searchRequest: ', searchRequest.messageID);
                            });
                            result.on('searchEntry', (entry) => {
                                console.log('entry: ' + JSON.stringify(entry.object));
                                resolve({ result: entry.object });
                            });
                            result.on('searchReference', (referral) => {
                                console.log('referral: ' + referral.uris.join());
                            });
                            result.on('error', (err) => {
                                console.error('error: ' + err.message);
                                resolve({ error: err.message });
                            });
                        }
                    });
                }),

                auth: (type = 'staff', userId, password, done) => { // type = 'staff' || 'student' || 'outsider'
                    authenticate({
                        ldapOpts: { url: `ldap://${appConfig.ldap.ip}:${appConfig.ldap.port}` },
                        userDn: `uid=${userId},ou=${type},dc=ussh,dc=edu,dc=vn`,
                        userPassword: password,
                    }).then(validUser => {
                        done(validUser);
                    }).catch(error => {
                        console.error('Error: login fail!', error);
                        done(false);
                    });
                },


                add: (type, userId, email, password, cn, sn, done) => {
                    const entry = {
                        cn, sn, objectclass: ['inetOrgPerson', 'organizationalPerson', 'person'], uid: userId,
                        // email, password
                    };
                    client.add(`uid=${userId},ou=${type},dc=ussh,dc=edu,dc=vn`, entry, (err) => {
                        if (err) console.error(err);
                        else {
                            console.log(` - Add ${userId} successfully`);
                            done();
                        }
                    });
                }
            };

            // app.ldap.add('student', '1810582', 'tien.trantan', '12345', 'Tien', 'Tan', () => {

            // });

        }
    });

};