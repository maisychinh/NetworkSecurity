module.exports = app => {
    app.permission.add(
        { name: 'dashboard:standard', menu: { parentMenu: app.parentMenu.dashboard }, },
        { name: 'user:login', menu: { parentMenu: app.parentMenu.user } },
    );

    app.get('/', app.templates.admin);

    // API ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/system', async (req, res) => {
        try {
            const data = await app.ldap.getAllGroup();
            res.send({ data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/fw-setting', app.permission.check('system:settings'), (req, res) => {
        let changes = req.body.changes;
        app.model.setting.setValue(changes, (error) => res.send({ error }));
    });

    app.get('/api/fw-setting', app.permission.check('system:settings'), async (req, res) => {
        let keys = req.query.keys || [];
        app.model.setting.getValue(keys, (items) => {
            res.send(items);
        });
    });

    app.get('/api/state', app.isDebug ? app.permission.check() : (req, res, next) => next(), async (req, res) => {
        try {
            const template = req.query.template, link = req.query.link;
            const data = await app.state.get();
            if (data == null) {
                res.send({ error: 'System has error!' });
            } else {
                Object.keys(data).forEach(key => {
                    if (key.toLowerCase().indexOf('password') != -1) delete data[key]; // delete data.emailPassword, data.tchcEmailPassword
                });
                if (app.isDebug) data.isDebug = true;
                if (req.session.user) data.user = req.session.user;
                // while (!(app.database.postgres.connected && app.model && app.model.fwMenu && app.model.fwSubmenu)) {
                //     await app.utils.waiting(500);
                // }
                if (template == 'home' || template == 'unit') {
                    if (template == 'home') {
                        const menus = await app.model.fwMenu.getDivisionMenuTree('00');
                        if (menus) {
                            data.menus = menus;
                        }
                    }

                    if (template == 'unit') {
                        data.divisionMenus = [];
                        if (link) {
                            const checkMenu = await app.model.fwMenu.get({ link });
                            if (checkMenu && checkMenu.maDonVi) {
                                data.divisionMenus = await app.model.fwMenu.getDivisionMenuTree(checkMenu.maDonVi);
                            }
                        }
                    }

                    const submenus = await app.model.fwSubmenu.getAll({ active: 1 }, '*', 'priority ASC');
                    if (submenus) {
                        data.submenus = submenus.slice();
                    }

                    data.languageText = await app.model.dmNgonNguTruyenThong.getLanguage();
                }

                // app.model.setting.getValue(['headerTitle', 'headerLink', 'isShowHeaderTitle', 'mapLink'], result => {
                //     data.headerTitle = result.headerTitle;
                //     data.headerLink = result.headerLink;
                //     data.isShowHeaderTitle = result.isShowHeaderTitle;
                //     data.mapLink = result.mapLink;
                if (data.user && data.user.permissions && data.user.permissions.includes('website:write') &&
                    !data.user.permissions.includes('menu:write')
                ) {
                    delete data.user.menu['2000'];
                    delete data.user.menu['5100'];
                }

                if (data.user && data.user.permissions
                    && data.user.permissions.includes('website:write')) {
                    if (data.user.menu['2000']) delete data.user.menu['2000'].menus['2090'];
                }
                res.send(data);
                // });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    const getComponent = (index, componentIds, components, done) => {
        if (index < componentIds.length) {
            app.model.fwComponent.get({ id: componentIds[index] }, (error, component) => {
                if (error || component == null) {
                    getComponent(index + 1, componentIds, components, done);
                } else {
                    component = app.clone(component);
                    component.components = [];
                    components.push(component);
                    const getNextComponent = view => {
                        if (view) component.view = view;
                        if (component.componentIds) {
                            getComponent(0, component.componentIds.split(','), component.components, () =>
                                getComponent(index + 1, componentIds, components, done));
                        } else {
                            getComponent(index + 1, componentIds, components, done);
                        }
                    };
                    if (component.viewType && component.viewId) {
                        const viewType = component.viewType;
                        if (component.viewId && app.model.fwComponent.viewTypes.indexOf(viewType) !== -1) {
                            let modelName = '';
                            if (viewType === 'carousel' || viewType === 'gallery')
                                modelName = 'homeCarousel';
                            else if (viewType === 'video')
                                modelName = 'homeVideo';
                            else if (viewType === 'feature')
                                modelName = 'homeFeature';
                            else if (viewType === 'content')
                                modelName = 'homeContent';
                            else if (viewType === 'all news' || viewType == 'all events' || viewType === 'tin tức chung' || viewType === 'last events')
                                modelName = 'fwCategory';
                            else if (viewType === 'all divisions')
                                modelName = 'dmLoaiDonVi';
                            if (modelName == 'fwCategory') {
                                app.model.fwCategory.get({ id: component.viewId }, (error, item) => getNextComponent(item));
                            } else if (modelName) {
                                app.model[modelName].get({ viewId: component.viewId }, (error, item) => getNextComponent(item));
                            } else {
                                getNextComponent();
                            }
                        } else {
                            getNextComponent();
                        }
                    } else {
                        getNextComponent();
                    }
                }
            });
        } else {
            done();
        }
    };

    app.get('/api/menu', (req, res) => {
        try {
            let pathname = app.url.parse(req.headers.referer).pathname;
            if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.substring(0, pathname.length - 1);

            const promiseMenus = new Promise((resolve, reject) => app.database.redis.get(app.database.redis.menusKey, (error, menus) => {
                error ? reject(error) : resolve(menus ? JSON.parse(menus) : {});
            }));
            const promiseDivisionMenus = new Promise((resolve, reject) => app.database.redis.get(app.database.redis.divisionMenusKey, (error, divisionMenus) => {
                error ? reject(error) : resolve(divisionMenus ? JSON.parse(divisionMenus) : {});
            }));

            Promise.all([promiseMenus, promiseDivisionMenus]).then(([menus, divisionMenus]) => {
                let menu = null, menuType = '';
                if (menus && menus[pathname]) {
                    menu = menus[pathname];
                    menuType = 'common';
                }
                if (!menu && divisionMenus && divisionMenus[pathname]) {
                    menu = divisionMenus[pathname];
                    menuType = 'division';
                }

                if (!menu) {
                    res.send({ error: 'Link không hợp lệ!' });
                } else if (menu.component) {
                    res.send(menu.component);
                } else if (menu.componentId) {
                    //TODO
                    const menuComponents = [];
                    getComponent(0, [menu.componentId], menuComponents, () => {
                        const newComponents = menuComponents[0].components.sort((a, b) => a.priority - b.priority);
                        menu.component = Object.assign(menuComponents[0], { components: newComponents });

                        if (menuType == 'common') {
                            menus[pathname] = menu;
                            app.database.redis.set(app.database.redis.menusKey, JSON.stringify(menus));
                        } else {
                            divisionMenus[pathname] = menu;
                            app.database.redis.set(app.database.redis.divisionMenusKey, JSON.stringify(divisionMenus));
                        }

                        res.send(menu.component);
                    });
                } else {
                    res.send({ error: 'Menu không hợp lệ!' });
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/clear-session', app.permission.check(), (req, res) => {
        const sessionName = req.body.sessionName;
        req.session[sessionName] = null;
        res.end();
    });
};