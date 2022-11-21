const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const ldap = require("ldapjs");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000);

function authenticateDN(username, password) {
  const client = ldap.createClient({
    url: ["ldap://127.0.0.1:10389"],
  });

  const opts = {
    filter: "(objectClass=*)",
    scope: "sub",
    attributes: ["sn", "cn"],
  };

  client.bind(username, password, (err) => {
    if (err) {
      console.log("Error in new connection", err);
    } else {
      console.log("success");
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
  });
}

authenticateDN("uid=admin,ou=system", "secret");
