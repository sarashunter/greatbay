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
            function(err, res){
                if (err) throw err;
                console.log(res);
                console.log(res[0].highest_bid);
                if(parseFloat(response.bidAmt) > parseFloat(res[0].highest_bid)){
                    console.log("You have the new highest bid");
                    updateHighBid(response.itemNumber, response.bidAmt);
                }else{
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

function updateHighBid(id, bid){
    connection.query("UPDATE items SET ? WHERE ?",
    [
        {
            highest_bid: bid
        },
        {
            id: id
        }
    ],
    function(err, res){
        if (err) throw err;
        console.log("Updated bid");
        mainMenu();
    }
    )
}