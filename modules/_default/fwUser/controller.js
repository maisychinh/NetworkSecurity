module.exports = app => {

    // API ------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/admin/users/all', async (req, res) => {
        try {
            let types = req.query.types;
            const [items, logs] = await Promise.all([
                app.ldap.getAllUser(types),
                app.model.authLog.getAllDistinct(),
            ]);
            res.send({ items, logs });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.get('/api/admin/users/search', async (req, res) => {
        try {
            const data = await app.ldap.search(req.query.searchText);
            if (!data) { res.send({ error: 'No user' }); }
            else {
                let { uid } = data;
                const [authLogs, userData, changePassLog] = await Promise.all([
                    app.model.authLog.getAll({ uid }),
                    app.model.user.get({ uid }),
                    app.model.changePassLog.getAll({ uid })
                ]);
                res.send({ authLogs, userData, changePassLog, data });
            }
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.get('/api/admin/users/logs', async (req, res) => {
        try {
            let uid = req.query.uid;
            const [logs, data, changePassLog] = await Promise.all([
                app.model.authLog.getAll({ uid }),
                app.model.user.get({ uid }),
                app.model.changePassLog.getAll({ uid })
            ]);
            res.send({ logs, data, changePassLog });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.post('/api/admin/users', async (req, res) => {
        try {
            const data = req.body.data,
                { type, uid, mail, password, cn, sn } = data;
            await app.ldap.add(type, uid, mail, password, cn, sn);
            res.end();
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.put('/api/admin/users', async (req, res) => {
        try {
            let { userId, changes } = req.body,
                { type } = changes;
            delete changes.type;

            await app.ldap.modify(type, userId, changes);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/admin/users/:type/:userId', async (req, res) => {
        try {
            let { type, userId } = req.params;
            await app.ldap.remove(type, userId);
            res.end();
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    const rand = (items) => {
        return items[~~(items.length * Math.random())];
    };

    app.post('/api/user/login-by-pass', async (req, res) => {
        try {
            let { email, password } = req.body;
            const validUser = await app.ldap.auth(email, password);
            if (validUser.uid) {
                const userInfo = await app.model.user.create({ uid: validUser.uid });
                let path = rand(['/user', '/pin-authen']);
                if (!userInfo.pinCode) {
                    path = '/user';
                }
                if (path == '/user') await app.model.authLog.create({ uid: validUser.uid, method: 'mail_pass', time: Date.now() });

                req.session.user = {
                    email: validUser.mail,
                    uid: validUser.uid,
                    type: validUser.dn.split(',')[1].replace('ou=', ''),
                    authen: path == '/user'
                };
                if (path == '/user') {
                    res.status(200).json({ status: 'success', session: req.session.user });
                } else {
                    res.end();
                }
            } else {
                res.send({ error: 'Login fail!' });
            }
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.post('/api/user/login-by-pin', async (req, res) => {
        try {
            let data = req.body.data,
                user = req.session.user;
            const userData = await app.model.user.get({ uid: user.uid });
            let checkHashPin = app.model.user.equalPassword(data.pinCode, userData.pinCode);
            if (checkHashPin) {
                app.model.authLog.create({ uid: user.uid, method: 'pin', time: Date.now() });
                req.session.user.authen = true;
                res.send({ user });
            }
            else res.send({ error: 'Invalid PIN' });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/user/info', async (req, res) => {
        try {
            const user = req.session.user;
            const [data, userInfo] = await Promise.all([
                app.ldap.search(user.email),
                app.model.user.get({ uid: user.uid })
            ]);
            res.send({ uid: data.uid, email: data.mail, cn: data.cn, sn: data.sn, type: user.type, pin: userInfo.pinCode });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.post('/api/user/pin', async (req, res) => {
        try {
            let data = req.body.data, user = req.session.user;
            await app.model.user.create({ uid: user.uid, ...data, pinCode: app.model.user.hashPassword(data.pinCode), lastModified: Date.now() });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/user/change-password', async (req, res) => {
        try {
            const { data } = req.body,
                { email, type, uid } = req.session.user;
            const checkUser = await app.ldap.auth(email, data.oldPassword);
            if (!checkUser) res.send({ error: 'Invalid old password' });
            else {
                await app.ldap.modify(type, uid, { userPassword: data.newPassword });
                await app.model.changePassLog.create({ uid, success: true, time: Date.now() });
                res.end();
            }
        } catch (error) {
            await app.model.changePassLog.create({ uid: req.session.user.uid, success: false, time: Date.now() });
            res.send({ error });
        }
    });

};