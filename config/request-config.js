module.exports = (app, express) => {
    app.url = require('url');
    const session = require('express-session');
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: 'networksecurity',
        cookie: { maxAge: 60000 }
    }));
    // Protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately
    const helmet = require('helmet');
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.xssFilter());
    app.use(helmet.permittedCrossDomainPolicies());
    // app.use(helmet.noCache());
    // app.use(helmet.referrerPolicy());

    // Get information from html forms
    const bodyParser = require('body-parser');
    const cors = require('cors');

    app.use(cors());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }));

    // Cryptography
    app.crypt = require('bcrypt');
    app.getToken = length => Array(length).fill('~!@#$%^&*()0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz').map(x => x[Math.floor(Math.random() * x.length)]).join('');
    // app.sha256 = require('crypto-js/sha256');

    // Configure session
    app.set('trust proxy', 1); // trust first proxy

    // Read cookies (needed for auth)
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());

    const morgan = require('morgan');
    app.use(morgan('dev'));
    app.use(express.static(app.publicPath));
    // Redirect to webpack server
    app.get('/*.js', (req, res, next) => {
        if (req.originalUrl.endsWith('.min.js')) {
            next();
        } else {
            const http = require('http');
            http.get('http://localhost:' + (app.port + 2) + req.originalUrl, response => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => res.send(data));
            });
        }
    });
};