module.exports = app => {
    app.fs.createFolder(app.assetPath, app.uploadPath, app.publicPath, app.documentPath, app.imagePath);

    app.put('/api/profile', app.permission.check(), async (req, res) => {
        try {
            const id = req.session.user.id, body = req.body.changes;
            if (id && body) {
                const changes = {
                    firstName: body.firstName,
                    lastName: body.lastName
                };

                const user = await app.model.fwUser.update({ ma: req.session.user.ma }, changes);
                if (user) {
                    await app.updateSessionUser(req, user);
                }
                res.send({ user });
            } else {
                res.send({ error: 'Not found user' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.state = {
        prefixKey: `${app.appName}_state:`,

        initState: {
            header: '/img/header.jpg'
        },

        init: () => app.database.redis.keys(`${app.appName}_state:*`, (_, keys) => {
            keys && Object.keys(app.state.initState).forEach(key => {
                const redisKey = `${app.appName}_state:${key}`;
                if (!keys.includes(redisKey) && app.state.initState[key]) app.database.redis.set(redisKey, app.state.initState[key]);
            });
        }),

        get: (...params) => new Promise((resolve, reject) => {
            const n = params.length, prefixKeyLength = app.state.prefixKey.length;
            const keys = n == 0 ? app.state.keys : params.map(key => `${app.appName}_state:${key}`); // get chỉ có done => đọc hết app.state
            app.database.redis.mget(keys, (error, values) => {
                if (error || values == null) {
                    reject(error || 'Error when get Redis value!');
                } else if (n == 1) { // Get 1 value
                    resolve(values[0]);
                } else {
                    const state = {};
                    keys.forEach((key, index) => state[key.substring(prefixKeyLength)] = values[index]);
                    resolve(state);
                }
            });
        }),

        set: (...params) => new Promise((resolve, reject) => {
            const n = params.length;
            for (let i = 0; i < n - 1; i += 2) params[i] = app.state.prefixKey + params[i];
            app.database.redis.mset(params, error => error ? reject(error) : resolve());
        }),
    };
    app.state.keys = Object.keys(app.state.initState).map(key => app.state.prefixKey + key);
};