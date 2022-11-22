module.exports = (app, router) => {

    // /admin/add-product => GET
    router.get('/add-product', (req, res, next) => {
        res.sendFile(app.path.join(app.rootDir, 'views', 'add-product.html'));
    });

    // /admin/add-product => POST
    router.post('/add-product', (req, res, next) => {
        console.log(req.body);
        res.redirect('/');
    });

}
