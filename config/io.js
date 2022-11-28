module.exports = (app, http) => {
    app.io = require('socket.io')(http);
    app.onRedisConnect = () => {
        const { createAdapter } = require('socket.io-redis');
        app.io.adapter(createAdapter({ pubClient: app.database.redis, subClient: app.database.redis.duplicate() }));
        const socketListeners = {};
        app.io.addSocketListener = (name, listener) => socketListeners[name] = listener;
        // app.io.addSocketListener('someListener', (socket) => { });

        app.io.getSessionUser = socket => {
            const sessionUser = socket.request.session ? socket.request.session.user : null;
            if (sessionUser) {
                delete sessionUser.password;
                delete sessionUser.token;
                delete sessionUser.tokenDate;
            }
            return sessionUser;
        };

        const joinSystem = socket => {
            // Leave all rooms except default room
            const rooms = Array.from(socket.rooms).slice(1);
            rooms.forEach(room => socket.leave(room));

            // Join with room of current user email
            const sessionUser = app.io.getSessionUser(socket);
            sessionUser && socket.join(sessionUser.email.toString());

            // Remove all listener
            const eventNames = socket.eventNames().filter(event => !['disconnect', 'system:join'].includes(event));
            eventNames.forEach(event => socket.removeAllListeners(event));

            // Run all socketListeners
            Object.values(socketListeners).forEach(listeners => listeners(socket));
        };

        app.io.on('connection', socket => {
            app.isDebug && console.log(` - Socket ID ${socket.id} connected!`);
            app.isDebug && socket.on('disconnect', () => console.log(` - Socket ID ${socket.id} disconnected!`));

            socket.on('system:join', () => joinSystem(socket));
            joinSystem(socket);
        });
    };

    if (app.isDebug) {
        app.fs.watch('public/js', () => {
            console.log('Reload client!');
            app.io.emit('debug', 'reload');
        });
    }
};