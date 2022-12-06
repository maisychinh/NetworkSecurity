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

    app.post('/api/user/login-by-pass', async (req, res) => {
        try {
            let { email, password } = req.body;
            const validUser = await app.ldap.auth(email, password);
            if (validUser.uid) {
                await app.model.authLog.create({ uid: validUser.uid, method: 'mail_pass', time: Date.now() });
                req.session.user = {
                    email: validUser.mail,
                    uid: validUser.uid,
                    type: validUser.dn.split(',')[1].replace('ou=', '')
                };
                res.status(200).json({ status: 'success', session: req.session.user });
            } else {
                res.send({ error: 'Login fail!' });
            }
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.get('/api/user/info', app.permission.orCheck('staff', 'student', 'outsider'), async (req, res) => {
        try {
            const user = req.session.user;
            const data = await app.ldap.search(user.email);
            res.send({ uid: data.uid, email: data.mail, cn: data.cn, sn: data.sn, type: user.type });
        } catch (error) {
            res.send({ error });
        }
    });


};