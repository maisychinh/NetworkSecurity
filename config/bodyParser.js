module.exports = app => {
    const express = require("express");

    const bodyParser = require("body-parser");
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(app.path.join(__dirname, "public")));
}