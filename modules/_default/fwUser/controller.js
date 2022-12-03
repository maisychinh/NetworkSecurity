module.exports = app => {

    // API:

    app.get('/api/users/all', async (req, res) => {
        try {
            let types = req.query.types;
            const items = await app.ldap.getAllUser(types);
            res.send({ items });
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
};