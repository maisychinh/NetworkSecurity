module.exports = (app) => {
    const checkPermissions = (req, res, next, permissions) => {
        if (req.session?.user) {
            const user = req.session.user;
            if (user.permissions && user.permissions.contains(permissions)) {
                next();
            } else if (permissions.length == 0) {
                next();
            } else {
                responseError(req, res);
            }
        } else {
            responseError(req, res);
        }
    };

    const checkOrPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            const user = req.session.user;
            if (user.permissions && user.permissions.exists(permissions)) {
                next();
            } else if (permissions.length == 0) {
                next();
            } else {
                responseError(req, res);
            }
        } else {
            responseError(req, res);
        }
    };

    const responseError = (req, res) => {
        if (req.method.toLowerCase() === 'get') { // is get method
            if (req.originalUrl.startsWith('/api')) {
                res.send({ error: req.session.user ? 'request-permissions' : 'request-login' });
            } else {
                res.redirect(req.session?.user ? '/request-permissions' : '/request-login');
            }
        } else {
            res.send({ error: 'You don\'t have permission!' });
        }
    };

    const systemPermission = [];
    const menuTree = {};
    app.permission = {
        all: () => [...systemPermission],

        tree: () => app.clone(menuTree),

        add: (...permissions) => {
            permissions.forEach(permission => {
                if (typeof permission == 'string') {
                    permission = { name: permission };
                } else if (permission.menu) {
                    if (permission.menu.parentMenu) {
                        const { index, subMenusRender } = permission.menu.parentMenu;
                        if (menuTree[index] == null) {
                            menuTree[index] = {
                                parentMenu: app.clone(permission.menu.parentMenu),
                                menus: {}
                            };
                        }
                        if (permission.menu.menus == null) {
                            menuTree[index].parentMenu.permissions = [permission.name];
                        }
                        menuTree[index].parentMenu.subMenusRender = menuTree[index].parentMenu.subMenusRender || (subMenusRender != null ? subMenusRender : true);
                    }
                    const menuTreeItem = menuTree[permission.menu.parentMenu?.index || 100],
                        submenus = permission.menu.menus;
                    if (submenus) {
                        Object.keys(submenus).forEach(menuIndex => {
                            if (menuTreeItem.menus[menuIndex]) {
                                const menuTreItemMenus = menuTreeItem.menus[menuIndex];
                                if (menuTreItemMenus.title == submenus[menuIndex].title && menuTreItemMenus.link == submenus[menuIndex].link) {
                                    menuTreItemMenus.permissions.push(permission.name);
                                } else {
                                    console.error(`Menu index #${menuIndex} is not available!`);
                                }
                            } else {
                                menuTreeItem.menus[menuIndex] = app.clone(submenus[menuIndex], { permissions: [permission.name] });
                            }
                        });
                    }
                }

                systemPermission.includes(permission.name) || systemPermission.push(permission.name);
            });
        },

        check: (...permissions) => async (req, res, next) => {
            if (app.isDebug && req.session.user == null) {
                try {
                    const personEmail = req.cookies.personEmail || app.defaultAdminEmail;
                    const user = await app.model.fwUser.get({ email: personEmail });
                    if (!user) {
                        res.send({ error: 'System has errors!' });
                    } else {
                        await app.updateSessionUser(req, user);
                        checkPermissions(req, res, next, permissions);
                    }
                } catch (error) {
                    res.send({ error: 'System has errors!' });
                }
            } else {
                checkPermissions(req, res, next, permissions);
            }
        },

        orCheck: (...permissions) => async (req, res, next) => {
            if (app.isDebug && req.session.user == null) {
                try {
                    const personEmail = req.cookies.personEmail || app.defaultAdminEmail;
                    const user = await app.model.fwUser.get({ email: personEmail });
                    if (!user) {
                        res.send({ error: 'System has errors!' });
                    } else {
                        await app.updateSessionUser(req, user);
                        checkOrPermissions(req, res, next, permissions);
                    }
                } catch (error) {
                    res.send({ error: 'System has errors!' });
                }
            } else {
                checkOrPermissions(req, res, next, permissions);
            }
        },

        has: async (req, ...permissions) => {
            let sessionUser = req.session.user;
            if (app.isDebug && !sessionUser) {
                const personEmail = req.cookies.personEmail || app.defaultAdminEmail;
                try {
                    const user = await app.model.fwUser.get({ email: personEmail });
                    if (!user) {
                        return false;
                    } else {
                        sessionUser = await app.updateSessionUser(req, user);
                    }
                } catch (error) {
                    console.error('app.permission.has error: ', error);
                    return false;
                }
            }

            if (sessionUser) {
                return sessionUser.permissions && sessionUser.permissions.contains(permissions);
            } else {
                return permissions.length == 0;
            }
        },

        getTreeMenuText: () => {
            let result = '';
            Object.keys(menuTree).sort().forEach(parentIndex => {
                result += `${parentIndex}. ${menuTree[parentIndex].parentMenu.title} (${menuTree[parentIndex].parentMenu.link})\n`;

                Object.keys(menuTree[parentIndex].menus).sort().forEach(menuIndex => {
                    const submenu = menuTree[parentIndex].menus[menuIndex];
                    result += `\t${menuIndex} - ${submenu.title} (${submenu.link})\n`;
                });
            });
            app.fs.writeFileSync(app.path.join(app.assetPath, 'menu.txt'), result);
        }
    };

    // Update user's session ------------------------------------------------------------------------------------------------------------------------
    const hasPermission = (userPermissions, menuPermissions) => {
        for (let i = 0; i < menuPermissions.length; i++) {
            if (userPermissions.includes(menuPermissions[i])) return true;
        }
        return false;
    };

    app.updateSessionUser = async (req, user) => {
        user = app.clone(user, { permissions: [], menu: {} });
        delete user.password;

        try {
            // app.model.fwUser.getUserRoles(user.email, (error, result) => {
            //     if (error || result == null || result.rows == null) {
            //         console.error('app.updateSessionUser', error);
            //     } else {
            user.roles = [];
            // for (let i = 0; i < user.roles.length; i++) {
            //     let role = user.roles[i];
            //     if (role.name == 'admin') {
            // user.permissions = app.permission.all().filter(permission => !permission.endsWith(':classify') && (permission.endsWith(':login') || permission.endsWith(':read')));
            //     } else
            //         (role.permission ? role.permission.split(',') : []).forEach(permission => app.permissionHooks.pushUserPermission(user, permission.trim()));
            // }
            // }
            // });
            user.permissions = app.permission.all();
            if (user.active) app.permissionHooks.pushUserPermission(user, 'user:login');
            // await app.permissionHooks.run('staff', user, user.staff);
            // await app.permissionHooks.run('assignRole', user, validRoles);

            user.menu = app.permission.tree();
            Object.keys(user.menu).forEach(parentMenuIndex => {
                let flag = true;
                const menuItem = user.menu[parentMenuIndex];
                if (menuItem.parentMenu && menuItem.parentMenu.permissions) {
                    if (hasPermission(user.permissions, menuItem.parentMenu.permissions)) {
                        delete menuItem.parentMenu.permissions;
                    } else {
                        delete user.menu[parentMenuIndex];
                        flag = false;
                    }
                }

                flag && Object.keys(menuItem.menus).forEach(menuIndex => {
                    const menu = menuItem.menus[menuIndex];
                    if (hasPermission(user.permissions, menu.permissions)) {
                        delete menu.permissions;
                    } else {
                        delete menuItem.menus[menuIndex];
                        if (Object.keys(menuItem.menus).length == 0) delete user.menu[parentMenuIndex];
                    }
                });
            });

            if (req) {
                if (req.session) {
                    req.session.user = user;
                } else {
                    req.session = { user };
                }
                req.session.save();
            }

            return user;
        } catch (error) {
            console.error('app.updateSessionUser', error);
        }
    };

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    // app.readyHooks.add('permissionInit', {
    //     ready: () => app.database.postgres.connected && app.model.fwRole != null,
    //     // ready: () => true,
    //     run: () => app.isDebug && app.permission.getTreeMenuText(),
    // });
};