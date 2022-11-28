const appConfig = require('./package'),
    fs = require('fs'),
    personnelConfig = fs.existsSync('./asset/config.json') ? require('./asset/config.json') : { ignoreModules: [] },
    path = require('path'),
    endOfLine = require('os').EOL;

const cleanFilesPluginOptions = [],
    CleanFilesPlugin = function (options) {
        options.forEach(option => {
            if (option.path) {
                option = Object.assign({ fileExtension: '.js' }, option, { path: __dirname + option.path });
                cleanFilesPluginOptions.push(option);
                console.log(`  - Clean files in folder ${option.path}!`);
            }
        });
    };
CleanFilesPlugin.prototype.apply = compiler => {
    const removeFiles = (option) => {
        fs.readdirSync(option.path).forEach(filePath => {
            filePath = option.path + '/' + filePath;
            const state = fs.statSync(filePath);
            if (option.recursive && state.isDirectory()) {
                removeFiles(Object.assign({}, option, { path: filePath }));
            } else if (state.isFile() && filePath.endsWith(option.fileExtension) && (option.excludeExtension == null || !filePath.endsWith(option.excludeExtension))) {
                console.log(`Delete file ${filePath}`);
                fs.unlinkSync(filePath);
            }
        });
    };

    compiler.hooks.done.tap('CleanFiles', () => cleanFilesPluginOptions.forEach(removeFiles));
};

const moduleContainer = { admin: {}, login: {} }, // Add template here
    templateNames = Object.keys(moduleContainer);
let isProduction = true;
const UpdateModulesPlugin = function (_isProduction) {
    isProduction = _isProduction;
};
UpdateModulesPlugin.prototype.apply = compiler => compiler.hooks.done.tap('UpdateModules', () => {
    templateNames.forEach(templateName => {
        moduleContainer[templateName].moduleNames = [];
        moduleContainer[templateName].importText = '// That code below is generated automatically. Do not change them manually!\n';
    });

    const moduleData = [];
    const ignoreModules = personnelConfig.ignoreModules || [];
    fs.readdirSync('./modules').forEach(mainModuleName => {
        if (isProduction) {
            fs.statSync(`./modules/${mainModuleName}`).isDirectory() && fs.readdirSync(`./modules/${mainModuleName}`).forEach(moduleName => {
                if (fs.statSync(`./modules/${mainModuleName}/${moduleName}`).isDirectory() && fs.existsSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`)) {
                    moduleData.push(mainModuleName + '|' + moduleName);
                }
            });
        } else {
            !ignoreModules.includes(mainModuleName) && fs.statSync(`./modules/${mainModuleName}`).isDirectory() && fs.readdirSync(`./modules/${mainModuleName}`).forEach(moduleName => {
                if (fs.statSync(`./modules/${mainModuleName}/${moduleName}`).isDirectory() && fs.existsSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`)) {
                    moduleData.push(mainModuleName + '|' + moduleName);
                }
            });
        }
    });
    moduleData.sort().forEach(item => {
        const [mainModuleName, moduleName] = item.split('|');
        console.log(`./modules/${mainModuleName}/${moduleName}/index.jsx`);
        const moduleTextLines = fs.readFileSync(`./modules/${mainModuleName}/${moduleName}/index.jsx`)?.toString().split(endOfLine);
        if (moduleTextLines.length && moduleTextLines[0].startsWith('//TEMPLATES: ')) {
            const moduleTemplateNames = moduleTextLines[0].substring('//TEMPLATES: '.length).split('|').map(item => item.replace(/(\r\n|\n|\r)/gm, ''));
            templateNames.forEach(templateName => {
                if (moduleTemplateNames.indexOf(templateName) != -1) {
                    moduleContainer[templateName].moduleNames.push(moduleName);
                    moduleContainer[templateName].importText += `import ${moduleName} from 'modules/${mainModuleName}/${moduleName}/index';\n`;
                }
            });
        } else {
            console.warn(`  - Warning: ${mainModuleName}:${moduleName} không thuộc template nào cả!`);
        }
    });

    templateNames.forEach(templateName => {
        const templateModule = moduleContainer[templateName];
        if (templateModule.preModuleNames == null || templateModule.preModuleNames.length != templateModule.moduleNames.length) {
            templateModule.preModuleNames = [...templateModule.moduleNames];
            fs.writeFileSync(`./view/${templateName}/modules.jsx`, `${templateModule.importText}\nexport const modules = [${templateModule.moduleNames.join(', ')}];`);
        }
    });
});

const entry = {};
fs.readdirSync('./view').forEach(folder => {
    if (fs.lstatSync('./view/' + folder).isDirectory() && fs.existsSync('./view/' + folder + '/' + folder + '.jsx')) {
        entry[folder] = path.join(__dirname, 'view', folder, folder + '.jsx');
    }
});
const genHtmlWebpackPlugins = (isProductionMode) => {
    let HtmlWebpackPlugin = isProductionMode ? require(require.resolve('html-webpack-plugin', { paths: [require.main.path] })) : require('html-webpack-plugin'),
        plugins = [],
        htmlPluginOptions = {
            inject: false,
            hash: true,
            minifyOptions: { removeComments: true, collapseWhitespace: true, conservativeCollapse: true },
            title: appConfig.title,
            keywords: appConfig.keywords,
            version: appConfig.version,
            description: appConfig.description,
        };
    fs.readdirSync('./view').forEach(filename => {
        const template = `./view/${filename}/${filename}.pug`;
        if (filename != '.DS_Store' && fs.existsSync(template) && fs.lstatSync(template).isFile()) {
            const options = Object.assign({ template, filename: filename + '.template' }, htmlPluginOptions);
            plugins.push(new HtmlWebpackPlugin(options));
        }
    });
    return plugins;
};

module.exports = (env, argv) => ({
    entry,
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: 'js/[name].[contenthash].js',
    },
    plugins: [
        ...genHtmlWebpackPlugins(argv.mode === 'production'),
        new CleanFilesPlugin(argv.mode === 'production' ?
            [
                { path: '/public/js', fileExtension: '.txt' },
            ] : [
                { path: '/public/js', fileExtension: '.txt' },
                { path: '/public/js', fileExtension: '.js', excludeExtension: '.min.js' },
                { path: '/public', fileExtension: '.template' },
            ]),
        new UpdateModulesPlugin(argv.mode === 'production'),
    ],
    module: {
        rules: [
            { test: /\.pug$/, use: ['pug-loader'] },
            { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
            { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
            {
                test: /\.jsx?$/, exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties'],
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        cacheDirectory: true,
                        cacheCompression: false,
                    },
                }
            },
            {
                test: /\.(eot|.svg|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: { limit: 10000 },
                },
            },
            {
                test: /\.svg$/,
                use: {
                    loader: 'svg-url-loader',
                    options: { limit: 10000 },
                },
            },
        ]
    },
    devServer: {
        port: appConfig.port + 2,
        compress: true,
        historyApiFallback: true,
        open: true,
        hot: true,
        static: {
            watch: false,
        }
    },
    resolve: {
        alias: { exceljsFE: path.resolve(__dirname, 'node_modules/exceljs/dist/exceljs.min') },
        modules: [path.resolve(__dirname, './'), 'node_modules'],
        extensions: ['.js', '.jsx', '.json'],
    },
    optimization: { minimize: true },
});