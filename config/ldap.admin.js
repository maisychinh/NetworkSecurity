module.exports = (app) => {
    const ldap = require("ldapjs");
    const router = require("express").Router();

    require("../routes/admin")(app, router);

    // Section: Admin LDAP Func -------------------------------------------

    // authenticateDN("uid=admin,ou=system", "secret");
    function authenticateDN(username, password) {
        client.bind(username, password, (err) => {
            if (err) {
                console.error("Error in new connection:", err);
            } else {
                console.log("Authenticate successfully!");
                // searchUser();
                // addUser();
                // deleteUser();
                // addUserToTheGroup('cn=Administrators,ou=groups,ou=system')
                // deleteUserFromTheGroup('cn=Administrators,ou=groups,ou=system')
                // updateUser('cn=john,ou=users,ou=system')
                // compare('cn=john,ou=users,ou=system')
                modifyDN('cn=john,ou=users,ou=system');
            }
        });
    }

    function searchUser() {
        const opts = {
            filter: "(objectClass=*)",
            scope: "sub",
            attributes: ["sn", "cn"],
        };
        client.search("ou=users,ou=system", opts, (err, res) => {
            if (err) {
                console.log("Error in search", err);
            } else {
                res.on("searchRequest", (searchRequest) => {
                    console.log("searchRequest: ", searchRequest.messageID);
                });
                res.on("searchEntry", (entry) => {
                    console.log("entry: " + JSON.stringify(entry.object));
                });
                res.on("searchReference", (referral) => {
                    console.log("referral: " + referral.uris.join());
                });
                res.on("error", (err) => {
                    console.error("error: " + err.message);
                });
                res.on("end", (result) => {
                    console.log("status: " + result.status);
                });
            }
        });
    }

    function addUser() {
        const entry = {
            sn: "bar",
            objectclass: "inetOrgPerson",
        };
        client.add("cn=foo,ou=users,ou=system", entry, (err) => {
            if (err) {
                console.log("err in new user" + err);
            } else {
                console.log("added user");
            }
        });
    }

    function deleteUser() {
        client.del('cn=foo,ou=users,ou=system', (err) => {
            if (err) {
                console.log('err in delete new user' + err)
            } else {
                console.log('deleted user')
            }
        });
    }

    function addUserToTheGroup(groupName) {
        const change = new ldap.Change({
            operation: 'add',
            modification: {
                uniqueMember: 'cn=john,ou=users,ou=system'
            }
        });

        client.modify(groupName, change, (err) => {
            if (err) {
                console.log('err in add user to the group' + err)
            } else {
                console.log('added user')
            }
        });
    }

    function deleteUserFromTheGroup(groupName) {
        const change = new ldap.Change({
            operation: 'delete',
            modification: {
                uniqueMember: 'cn=john,ou=users,ou=system'
            }
        });

        client.modify(groupName, change, (err) => {
            if (err) {
                console.log('err in delete user from the group' + err)
            } else {
                console.log('deleted user')
            }
        });
    }


    function updateUser(dn) {
        const change = new ldap.Change({
            operation: 'replace',
            modification: {
                displayName: '657'
            }
        });

        client.modify(dn, change, (err) => {
            if (err) {
                console.log('err in update user ' + err)
            } else {
                console.log('updated user')
            }
        });
    }

    function compare(dn) {
        client.compare(dn, 'sn', 'bar', (err, matched) => {
            if (err) {
                console.log('err in compare')
            } else {

                console.log('matched: ' + matched);
            }

        });
    }

    function modifyDN(dn) {
        client.modifyDN(dn, 'cn=bar', (err) => {
            if (err) {
                console.log('err in modifyDN')
            } else {
                console.log('modified dn')
            }
        });
    }


}