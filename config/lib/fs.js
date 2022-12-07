const fse = require('fs-extra');
module.exports = app => {

    // Download file (http / https)
    app.fs.downloadFile = (url, path) => {
        let network = require(url.startsWith('http') ? 'http' : 'https'),
            file = app.fs.createWriteStream(path);
        network.get(url, response => response.pipe(file));
    };

    app.fs.createFolder = function () {
        for (let i = 0; i < arguments.length; i++) {
            arguments[i] && !app.fs.existsSync(arguments[i]) && app.fs.mkdirSync(arguments[i]);
        }
    };

    app.fs.deleteFolder = path => {
        if (app.fs.existsSync(path)) {
            app.fs.readdirSync(path).forEach(file => {
                const curPath = path + '/' + file;
                if (app.fs.lstatSync(curPath).isDirectory()) {
                    app.fs.deleteFolder(curPath);
                } else {
                    app.fs.unlinkSync(curPath);
                }
            });
            app.fs.rmdirSync(path);
        }
    };

    app.fs.deleteImage = (image) => {
        if (image && image !== '') {
            let imagePath = app.path.join(app.publicPath, image),
                imageIndex = imagePath.indexOf('?t=');
            if (imageIndex != -1) {
                imagePath = imagePath.substring(0, imageIndex);
            }

            if (app.fs.existsSync(imagePath)) {
                app.fs.unlinkSync(imagePath);
            }
        }
    };

    app.fs.deleteFile = (path) => {
        if (path && path !== '') {
            const index = path.indexOf('?t=');
            if (index != -1) path = path.substring(0, index);
            if (app.fs.existsSync(path)) app.fs.unlinkSync(path);
        }
    };

    // Replace renameSync for fileSystem
    app.fs.renameSync = (oldPath, newPath) => {
        fse.copySync(oldPath, newPath);
        fse.removeSync(oldPath);
    };

    // Replace rename for fileSystem
    app.fs.rename = async (oldPath, newPath) => {
        await fse.copy(oldPath, newPath);
        await fse.remove(oldPath);
    };

    const archiver = require('archiver');

    /**
     * @param {String} sourceDir: /some/folder/to/compress
     * @param {String} outPath: /path/to/created.zip
     * @returns {Promise}
     */
    app.fs.zipDirectory = (sourceDir, outPath) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const stream = app.fs.createWriteStream(outPath);

        return new Promise((resolve, reject) => {
            archive.directory(sourceDir, false).on('error', err => reject(err)).pipe(stream);
            stream.on('close', () => resolve());
            archive.finalize();
        });
    };
};