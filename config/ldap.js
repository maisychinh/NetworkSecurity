module.exports = (app, appConfig) => {
    const ldap = require('ldapjs'),
        { authenticate } = require('ldap-authentication');
    const client = ldap.createClient({ url: `ldap://${appConfig.ldap.ip}:${appConfig.ldap.port}` });

    client.bind(appConfig.ldap.username, appConfig.ldap.password, async (error) => {
        if (error) {
            console.log(' - Error LDAP connection:', error);
        } else {
            console.log(` - Connect to LDAP Server at ${client.host}:${client.port}`);

            app.ldap = {
                getAllGroup: () => new Promise(resolve => {
                    client.search('dc=example,dc=com', { filter: '(&(ou=*))', scope: 'sub', attributes: ['*'] }, (error, result) => {
                        if (error) resolve({ error });
                        else {
                            const data = [];
                            result.on('searchEntry', (entry) => {
                                data.push(entry.object.cn);
                            });
                            result.on('end', () => {
                                resolve(data);
                            });

                        }
                    });
                }),

                getAllUser: (types) => new Promise((resolve, reject) => {
                    const items = {};
                    for (let i = 0; i < types.length; i++) {
                        const type = types[i];
                        client.search(`ou=${type},dc=example,dc=com`, { filter: '(&(uid=*))', scope: 'sub', attributes: ['*'] }, (error, result) => {
                            if (error) reject({ error });
                            else {
                                const data = [];
                                result.on('searchEntry', (entry) => {
                                    data.push(entry.object);
                                });
                                result.on('end', () => {
                                    items[type] = data;
                                    i == types.length - 1 && resolve(items);
                                });
                            }
                        });
                    }

                }),
                
                search: (username, done) => new Promise(resolve => {
                    client.search('ou=system', {
                        filter: `(&(objectClass=inetOrgPerson)(|(mail=${username})(uid=${username})))`,
                        scope: 'sub',
                        client: '*',
                        attributes: ['mail', 'uid', 'objectClass', 'cn', 'sn']
                    }, (error, result) => {
                        if (error) {
                            console.log('Error: Search =>', error);
                            done(error);
                            resolve({ error });
                        } else {
                            let data = null;
                            result.on('searchRequest', (searchRequest) => {
                                console.log('searchRequest: ', searchRequest.messageID);
                            });
                            result.on('searchEntry', (entry) => {
                                console.log('entry: ' + JSON.stringify(entry.object));
                                data = entry.object;
                            });
                            result.on('searchReference', (referral) => {
                                console.log('referral: ' + referral.uris.join());
                            });
                            result.on('error', (err) => {
                                console.error('error: ' + err.message);
                                resolve({ error: err.message });
                            });
                            result.on('end', () => {
                                resolve(data);
                            });
                        }
                    });
                }),

                auth: async (email, password, done) => {
                    const checkUser = await app.ldap.search(email);
                    if (!checkUser) {
                        return false;
                    }
                    else if (checkUser.error) {
                        done && done({ error: checkUser.error });
                        return false;
                    } else {
                        let userDn = checkUser.dn;
                        const isValidUser = await authenticate({
                            ldapOpts: { url: `ldap://${appConfig.ldap.ip}:${appConfig.ldap.port}` },
                            userDn, userPassword: password,
                        });
                        if (isValidUser) return checkUser;
                        else return false;
                    }
                },

                add: (type, userId, mail, userPassword, cn, sn, done) => new Promise(resolve => {
                    const entry = {
                        cn, sn, objectclass: ['inetOrgPerson', 'organizationalPerson', 'person'], uid: userId,
                        mail, userPassword
                    };
                    client.add(`uid=${userId},ou=${type},dc=example,dc=com`, entry, (err) => {
                        if (err) console.error(err);
                        else {
                            console.log(` - Add ${userId} successfully`);
                            done && done();
                            resolve();
                        }
                    });
                }),

                modify: async (type, userId, changes) => new Promise(resolve => {
                    for (let i = 0; i < Object.entries(changes).length; i++) {
                        let [key, value] = Object.entries(changes)[i];
                        let change = { [key]: value };
                        console.log(change);
                        client.modify(`uid=${userId},ou=${type},dc=example,dc=com`, new ldap.Change({
                            operation: 'replace',
                            modification: change
                        }), (error, result) => {
                            if (error) resolve({ error });
                            else if (i == Object.entries(changes).length - 1) resolve({ result });
                        });
                    }
                }),

                remove: (type, userId) => new Promise(resolve => {
                    client.del(`uid=${userId},ou=${type},dc=example,dc=com`, (error, result) => {
                        if (error) resolve({ error });
                        else resolve({ result });
                    });
                })
            };
        }
    });

};