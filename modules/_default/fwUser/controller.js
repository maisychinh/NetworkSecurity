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
                { type, userId, mail, password, cn, sn } = data;
            await app.ldap.add(type, userId, mail, password, cn, sn);
            res.end();
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });
};