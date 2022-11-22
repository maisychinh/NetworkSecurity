module.exports = app => {
    const ldap = require("ldapjs");
    const router = require("express").Router();

    require("../routes/shop")(app, router);

    // const client = ldap.createClient({
    //     url: ["ldap://127.0.0.1:10389"],
    // });

    // Section: Client LDAP Func ---------------------------------------------------------------

}