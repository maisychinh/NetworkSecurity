module.exports = app => {
    app.permission.add(
        { name: 'dashboard:standard', menu: { parentMenu: app.parentMenu.dashboard }, },
        { name: 'user:login', menu: { parentMenu: app.parentMenu.user } },
    );

    app.get('/', app.templates.login);
    app.get('/pin-authen', app.templates.login);
    app.get('/user', app.templates.admin);

    app.get('/dashboard', app.templates.admin);

    // API ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/system', async (req, res) => {
        try {
            const data = await app.ldap.getAllGroup();
            res.send({ data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/logout', (req, res) => {
        req.session.destroy(() => {
            return res.status(200).json({ status: 'success', session: null });
        });
    });

    app.get('/api/state', (req, res) => {
        res.send({ user: req.session?.user || null });
    });
};