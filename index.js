#!/usr/bin/env node
const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const opn = require('opn');
const app = express();

var apiOnly = false;
if(!fs.existsSync("./config.json")){
    console.error("Config file missing!");
    process.exit(1);
}
if(!fs.existsSync(__dirname + "/static/index.html")){
    console.warn("View is missing, running in API only mode");
    apiOnly = true
}

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
const pool = mysql.createPool(config.mysql);

function query(conn, data, params = []) {
    return new Promise((resolve, reject) => {
        conn.query(data, params, (err, resp, fields) => {
            if(err)return reject(err);
            resolve(resp);
        });
    });
};

if(!apiOnly)
    app.use("/view", express.static(__dirname + '/static'))

app.get("/", (req, res) => {
    res.json({
        ping: true,
        notice: "You're probably looking for /view/"
    });
});

app.get("/database", (req, res) => {
    res.json({
        name: config.mysql.database,
        host: config.mysql.host
    });
});

app.get("/fieldsIgnored", (req, res) => {
    var fi = config.fields_ignored;
    if(!Array.isArray(fi)) fi = [];
    res.json(fi);
});

app.get("/tables", (req, res) => {
    pool.query("SHOW tables", async (err, resp, fields) => {
        if(err) {
            console.error(err);
            return res.json({
                error: "mysql_conn"
            });
        }
        let result = resp.map(a => {
            return a[Object.keys(a)[0]];
        });

        var obj = {};
        for(var r of result) {
            obj[r] = {
                name: r,
                comment: "",
                columns: []
            };
            try {
                obj[r].columns = await query(pool, "SHOW FULL COLUMNS FROM " + r);
                obj[r].comment = await query(pool, `SELECT table_comment 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE table_schema=? 
                    AND table_name=?`, [config.mysql.database, r]);
            } catch(e){
                console.error(e);
            }
        }

        res.json(obj);
    })
});

app.listen(8877, "localhost", () => {
    if(!apiOnly)
        opn('http://localhost:8877/view');
    console.log("Listening on port 8877");
});
