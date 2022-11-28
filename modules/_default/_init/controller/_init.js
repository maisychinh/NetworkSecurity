module.exports = app => {
    app.fs.createFolder(app.assetPath, app.uploadPath, app.publicPath, app.documentPath, app.imagePath);

    // Count views ----------------------------------------------------------------------------------------------------------------------------------
    // app.readyHooks.add('todaySchedule', {
    //     ready: () => app.database.redis,
    //     run: () => {
    //         app.primaryWorker && app.schedule('0 0 * * *', () => {
    //             // const today = new Date();
    //             // Cập nhật biến đếm ngày hôm nay về 0
    //             app.database.redis.set(`${app.appName}_state:todayViews`, 0);
    //         });
    //     },
    // });

    // Clear sessions ----------------------------------------------------------------------------------------------------------------------------------
    // const refreshSessionUser = (key, session) => new Promise((resolve) => app.updateSessionUser(null, session.user, newUser => {
    //     if (newUser) {
    //         session.user = newUser;
    //         app.database.redis.set(key, JSON.stringify(session), () => resolve());
    //     } else resolve();
    // }));
    //
    // app.readyHooks.add('clearSessionSchedule', {
    //     ready: () => app.database.redis,
    //     run: () => {
    //         app.primaryWorker && app.schedule('5 0 * * *', () => { // 00h05 hằng ngày
    //             console.log(' - Schedule: Clear session user');
    //             const sessionPrefix = app.appName + '_sess:';
    //             app.database.redis.keys(sessionPrefix + '*', async (error, keys) => {
    //                 // Tính toán hôm nay và 7 ngày trước
    //                 const today = new Date().yyyymmdd();
    //                 let last3Day = new Date();
    //                 last3Day.setDate(last3Day.getDate() - 3);
    //                 last3Day = last3Day.yyyymmdd();
    //
    //                 if (!error) {
    //                     // Lấy sessionUser
    //                     const getKey = (key) => new Promise(resolve => {
    //                         app.database.redis.get(key, (_, item) => resolve(JSON.parse(item)));
    //                     });
    //
    //                     try {
    //                         let deleteCounter = 0, refreshCounter = 0;
    //                         console.log('Total sessions: ', keys.length); // Tổng cộng sessions
    //                         for (const key of keys) {
    //                             const sessionUser = await getKey(key);
    //                             if (!sessionUser) { // Không có session
    //                                 await app.database.redis.del(key);
    //                                 deleteCounter++;
    //                             } else if (sessionUser.user) { // Có login
    //                                 // Nếu ko có today hoặc session lâu hơn 3 ngày => Xóa session
    //                                 if (!sessionUser.today || parseInt(sessionUser.today) < parseInt(last3Day)) {
    //                                     await app.database.redis.del(key);
    //                                     deleteCounter++;
    //                                 } else {
    //                                     await refreshSessionUser(key, sessionUser);
    //                                     refreshCounter++;
    //                                 }
    //                             } else {
    //                                 // Không login
    //                                 if (!sessionUser.today || today != sessionUser.today) { // Session cũ => Xóa session
    //                                     await app.database.redis.del(key);
    //                                     deleteCounter++;
    //                                 }
    //                             }
    //                         }
    //                         console.log(' - Number of deleted sessions: ', deleteCounter);
    //                         console.log(' - Number of refreshed sessions: ', refreshCounter);
    //                         console.log(' - Schedule: Clear session user done!');
    //                     } catch (e) {
    //                         console.error(e);
    //                     }
    //                 }
    //             });
    //         });
    //     },
    // });

    // Upload ---------------------------------------------------------------------------------------------------------------------------------------
    app.post('/user/upload', (req, res) => {
        app.getUploadForm().parse(req, async (error, fields, files) => {
            console.log('User Upload:', fields, files, req.query);
            if (error) {
                res.send({ error });
            } else {
                try {
                    const response = await app.uploadHooks.run(req, fields, files, req.query);
                    if (response) res.send(response);
                    else res.send({ error: 'System has error or not match upload condition!' });
                } catch (error) {
                    res.send({ error });
                }
            }
        });
    });

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

    // System state ---------------------------------------------------------------------------------------------------------------------------------
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