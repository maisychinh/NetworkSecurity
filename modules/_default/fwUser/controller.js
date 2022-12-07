module.exports = app => {

    // API ------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/users/all', app.permission.check('admin'), async (req, res) => {
        try {
            console.log(req.session.user);
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

    app.post('/api/users', app.permission.check('admin'), async (req, res) => {
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

    app.put('/api/users', app.permission.check('admin'), async (req, res) => {
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

    app.delete('/api/users/:type/:userId', app.permission.check('admin'), async (req, res) => {
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
                const [, userInfo] = await Promise.all([
                    app.model.authLog.create({ uid: validUser.uid, method: 'mail_pass', time: Date.now() }),
                    app.model.user.create({ uid: validUser.uid })
                ]);
                let path = rand(['/user', '/pin-authen']);
                if (!userInfo.pinCode) {
                    path = '/user';
                }
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

    app.get('/api/user/info', app.permission.orCheck('staff', 'student', 'outsider'), async (req, res) => {
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

    app.post('/api/user/pin', app.permission.orCheck('staff', 'student', 'outsider'), async (req, res) => {
        try {
            let data = req.body.data, user = req.session.user;
            await app.model.user.create({ uid: user.uid, ...data, pinCode: app.model.user.hashPassword(data.pinCode), lastModified: Date.now() });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });


};