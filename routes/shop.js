module.exports = (app, router) => {

    router.get('/', (req, res, next) => {
        res.sendFile(app.path.join(app.rootDir, 'views', 'shop.html'));
    });

};
