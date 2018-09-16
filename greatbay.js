var inquirer = require('inquirer');
var mysql = require('mysql');

var currentUserId = 0;

//Establish connection to db.  Update details for local database.
var connection = mysql.createConnection({
    host: "localhost",

    port: 8889,

    user: "root",

    password: "root",
    database: "greatbayDB"
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    afterConnection();
});

function afterConnection() {
    connection.query("SELECT * FROM items", function (err, res) {
        if (err) throw err;
        userMenu();
        //Open usermenu to start
    });
}

//Have user create username or login to existing user
function userMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What do you want to do?',
            choices: ['Log in as existing user', 'Create new user', 'Exit'],
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

                        //Check password
                        if (res[0].password === credentials.password) {
                            console.log('Correct password');
                            currentUserId = res[0].id;
                            mainMenu();
                        } else {
                            console.log('Wrong username or password');
                            userMenu();
                        }
                    })
            });
        }
        else if (response.loginchoice === 'Exit') {
            connection.end();
        }

        //create new user
        else {
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
            ]).then(function (credentials) {
                connection.query("SELECT * FROM users WHERE ?",
                    {
                        user: credentials.username
                    },
                    function (err, res) {
                        if (err) throw err;

                        //check if user already exists
                        if (res.length > 0) {
                            console.log("That username is taken.")
                            userMenu();
                        } else {
                            connection.query("INSERT INTO users SET ?",
                                {
                                    user: credentials.username,
                                    password: credentials.password
                                },
                                function (err, res) {
                                    if (err) throw err;
                                    console.log("New user added");
                                    currentUserId = res.insertId;
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
            choices: ['Check your items', 'Check your current winning bids', 'Post an item', 'Bid on an item', 'Exit'],
            name: 'action'
        }
    ]).then(function (response) {
        console.log(response.action);
        if (response.action === 'Check your items') {
            connection.query("SELECT * FROM items WHERE ?", {
                ownerID: currentUserId
            }, function (err, currentItems) {
                if (err) throw err;
                currentItems.forEach(function (element) {
                    console.log(`${element.item_name}               ${element.highest_bid}`)
                })
                mainMenu();
            })
        } else if (response.action === 'Check your current winning bids') {
            connection.query("SELECT * FROM items WHERE ?", {
                highest_bidderID: currentUserId
            }, function (err, currentBids) {
                if (err) throw err;

                currentBids.forEach(function (element) {
                    console.log(`${element.item_name}           ${element.highest_bid}`)
                })
                mainMenu();
            })
        }
        else if (response.action === 'Post an item') {
            postItem();
        } else if (response.action === 'Bid on an item') {
            bid();
        }
        else if (response.action === 'Exit') {
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
                highest_bidderID: 0,
                ownerID: currentUserId
            },
            function (err, response) {
                if (err) throw err;
                console.log("Added item");
            })
        mainMenu();
    })
}

function bid() {
    connection.query("SELECT * FROM items", function (err, res) {
        if (err) throw err;
        var choicesArray = [];

        if (res.length === 0) {
            console.log('No current items');
            mainMenu();
        } else {
            console.log(`Item Number    Item   Highest Bidder  Highest Bid`);
            res.forEach(function (element) {
                choicesArray.push(element.id.toString());
                console.log(`${element.id}  ${element.item_name}       ${element.highest_bidderID}       ${element.highest_bid}`);
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

                //check current bid.  Compare.
                connection.query("SELECT * FROM items WHERE ?",
                    {
                        id: response.itemNumber
                    },
                    function (err, res) {
                        if (err) throw err;

                        if (parseFloat(response.bidAmt) > parseFloat(res[0].highest_bid)) {
                            console.log("You have the new highest bid");
                            updateHighBid(response.itemNumber, response.bidAmt);
                        } else {
                            console.log("That bid is not high enough");
                            mainMenu();
                        }
                    });
            });
        }
    })

}

function updateHighBid(id, bid) {
    connection.query("UPDATE items SET ? WHERE ?",
        [
            {
                highest_bid: bid,
                highest_bidderID: currentUserId
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