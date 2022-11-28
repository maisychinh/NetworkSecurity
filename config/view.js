module.exports = app => {
    // Compress responses =====================================================
    const compression = require('compression');
    app.use(compression());

    // Favicon ================================================================
    const favicon = require('serve-favicon');
    app.fs.existsSync(app.faviconPath) && app.use(favicon(app.faviconPath));

    // Setup PUG view engine ==================================================
    app.viewEngine = require('pug');
    app.set('views', app.viewPath);
    app.set('view engine', 'pug');
};