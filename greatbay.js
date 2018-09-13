var inquirer = require('inquirer');
var mysql = require('mysql');

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",

    port: 8889,

    user: "root",

    password: "root",
    database: "greatbayDB"
});

connection.connect(function (err) {
    if (err) throw err;
    //   console.log("connected as id " + connection.threadId);
    afterConnection();
});

function afterConnection() {
    connection.query("SELECT * FROM items", function (err, res) {
        if (err) throw err;
        console.log(res);
        mainMenu();
        // connection.end();
    });
}




function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What do you want to do?',
            choices: ['POST AN ITEM', 'BID ON AN ITEM', 'EXIT'],
            name: 'action'
        }
    ]).then(function (response) {
        console.log(response.action);
        if (response.action === 'POST AN ITEM') {
            postItem();
        } else if (response.action === 'EXIT') {
            connection.end();
        }
    });
}

function postItem() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the item?',
            name: 'itemtype'
        }
    ]).then(function (response) {
        connection.query("INSERT INTO items SET ?",
            {
                item_name: response.itemtype,
                highest_bid: 0,
                highest_bidder: 'someone'
            },
            function (err, response) {
                // if (err) throw err;
                console.log("Added item");
            })
        mainMenu();
    })
}