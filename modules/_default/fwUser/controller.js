module.exports = app => {

    // API ------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/users/all', async (req, res) => {
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

    app.post('/api/users', async (req, res) => {
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

    app.put('/api/users', async (req, res) => {
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

    app.delete('/api/users/:type/:userId', async (req, res) => {
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
            if (validUser) {
                await app.model.authLog.create({ uid: validUser, method: 'mail_pass', time: Date.now() });
                res.end();
            } else {
                res.send({ error: 'Login fail!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });
};