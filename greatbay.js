var inquirer = require('inquirer');
var mysql = require('mysql');

var mysql = require("mysql");
var currentUserId = 0;

var connection = mysql.createConnection({
    host: "localhost",

    port: 8889,

    user: "root",

    password: "root",
    database: "greatbayDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    afterConnection();
});

function afterConnection() {
    connection.query("SELECT * FROM items", function (err, res) {
        if (err) throw err;
        console.log(res);
        // mainMenu();
        userMenu();
        // connection.end();
    });
}


function userMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What do you want to do?',
            choices: ['Log in as existing user', 'Create new user'],
            name: 'loginchoice'
        }
    ]).then(function (response) {
        if (response.loginchoice === 'Log in as existing user') {
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'Username',
                    name: 'username'
                },
                {
                    type: 'input',
                    message: 'Password',
                    name: 'password'
                }
            ]).then(function (credentials) {
                connection.query("SELECT * FROM users WHERE ?",
                    {
                        user: credentials.username
                    },
                    function (err, res) {
                        if (err) throw err;

                        if(res[0].password === credentials.password){
                            console.log('Correct password');
                            currentUserId=res.id;
                            mainMenu();
                        }else{
                            console.log('Wrong username or password');
                            userMenu();
                        }
                    })
            });
        }
        else{
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'New username',
                    name: 'username'
                },
                {
                    type: 'input',
                    message: 'New password',
                    name: 'password'
                }
            ]).then(function (credentials){
                connection.query("SELECT * FROM users WHERE ?",
                {
                    user: credentials.username
                },
                function (err, res) {
                    if (err) throw err;
                    if(res.length > 0){
                        console.log("That username is taken.")
                        userMenu();
                    }else{
                        connection.query("INSERT INTO users SET ?",
                        {
                            user: credentials.username,
                            password: credentials.password
                        }, 
                        function(err, res){
                            if (err) throw err;
                            console.log("New user added");
                            console.log(res);
                            currentUserId=res.insertId;
                            mainMenu();
                        })
                    }
                })
            })
        }
    })
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
        } else if (response.action === 'BID ON AN ITEM') {
            bid();
        }
        else if (response.action === 'EXIT') {
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

function bid() {
    connection.query("SELECT * FROM items", function (err, res) {
        if (err) throw err;
        var choicesArray = [];

        console.log(res);
        console.log(`Item Number    Item   Highest Bidder  Highest Bid`);
        res.forEach(function (element) {
            choicesArray.push(element.id.toString());
            console.log(`${element.id}  ${element.item_name}       ${element.highest_bidder}       ${element.highest_bid}`);
        })

        inquirer.prompt([
            {
                type: 'list',
                choices: choicesArray,
                message: 'What is the item number you would like to bid on?',
                name: 'itemNumber'
            },
            {
                type: 'input',
                message: 'How much would you like to bid?',
                name: 'bidAmt'
            }
        ]).then(function (response) {
            console.log("in here?" + response.itemNumber);
            //check current bid.  Compare.
            connection.query("SELECT * FROM items WHERE ?",
                {
                    id: response.itemNumber
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(res);
                    console.log(res[0].highest_bid);
                    if (parseFloat(response.bidAmt) > parseFloat(res[0].highest_bid)) {
                        console.log("You have the new highest bid");
                        updateHighBid(response.itemNumber, response.bidAmt);
                    } else {
                        console.log("That bid is not high enough");
                        mainMenu();
                    }
                });

            //if it's bigger, update

            //else console.log
            // mainMenu();
        });

    })

}

function updateHighBid(id, bid) {
    connection.query("UPDATE items SET ? WHERE ?",
        [
            {
                highest_bid: bid
            },
            {
                id: id
            }
        ],
        function (err, res) {
            if (err) throw err;
            console.log("Updated bid");
            mainMenu();
        }
    )
}