module.exports = (app, appConfig) => {
    app.parentMenu = {
        dashboard: {
            index: 100, title: 'Dashboard', link: '/user/dashboard', icon: 'home',
            subMenusRender: false,
        },
    };

    app.clone = function () {
        const length = arguments.length;
        let result = null;
        if (length && Array.isArray(arguments[0])) {
            result = [];
            for (let i = 0; i < length; i++) {
                result = result.concat(arguments[i]);
            }
        } else if (length && typeof arguments[0] == 'object') {
            result = {};
            for (let i = 0; i < length; i++) {
                const obj = JSON.parse(JSON.stringify(arguments[i]));
                Object.keys(obj).forEach(key => result[key] = obj[key]);
            }
        }
        return result;
    };

    // Template html file ---------------------------------------------------------------------------------------------------------------------------
    app.templates = {};
    app.createTemplate = function () {
        for (let i = 0; i < arguments.length; i++) {
            const templateName = arguments[i],
                path = `/${templateName}.template`;
            app.templates[templateName] = (req, res) => {
                const http = require('http');
                http.get(`http://localhost:${(app.port + 2) + path}`, response => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => res.send(data));
                });
            };
        }
    };

    // Load modules ---------------------------------------------------------------------------------------------------------------------------------
    app.loadModules = (loadController = true) => {
        const modulePaths = app.fs.readdirSync(app.modulesPath, { withFileTypes: true }).filter(item => item.isDirectory()).map(item => app.modulesPath + '/' + item.name),
            modelPaths = [],
            controllerPaths = [],
            requireFolder = (loadPath) => app.fs.readdirSync(loadPath).forEach((filename) => {
                const filepath = app.path.join(loadPath, filename);
                if (app.fs.existsSync(filepath) && app.fs.statSync(filepath).isFile() && filepath.endsWith('.js') && !filepath.endsWith('.manualDefine.js')) {
                    require(filepath)(app);
                }
            });

        modulePaths.forEach(modulePath => {
            app.fs.readdirSync(modulePath).forEach(dirName => {
                const modelFilePath = app.path.join(modulePath, dirName, 'model.js'),
                    controllerFilePath = app.path.join(modulePath, dirName, 'controller.js'),
                    modelFolderPath = app.path.join(modulePath, dirName, 'model'),
                    controllerFolderPath = app.path.join(modulePath, dirName, 'controller');

                if (app.fs.existsSync(modelFilePath) && app.fs.statSync(modelFilePath).isFile())
                    modelPaths.push(modelFilePath);
                if (loadController && app.fs.existsSync(controllerFilePath) && app.fs.statSync(controllerFilePath).isFile())
                    controllerPaths.push(controllerFilePath);

                if (app.fs.existsSync(modelFolderPath) && app.fs.statSync(modelFolderPath).isDirectory())
                    requireFolder(modelFolderPath);
                if (loadController && controllerFolderPath && app.fs.existsSync(controllerFolderPath) && app.fs.statSync(controllerFolderPath).isDirectory())
                    requireFolder(controllerFolderPath);
            });
        });
        modelPaths.forEach(path => require(path)(app));
        if (loadController) controllerPaths.forEach(path => require(path)(app, appConfig));
    };
};