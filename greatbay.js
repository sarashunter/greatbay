var inquirer = require('inquirer');

function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What do you want to do?',
            choices: ['POST AN ITEM', 'BID ON AN ITEM'],
            name: 'action'
        }
    ]).then(function (response) {
        console.log(response.action);
    });
}