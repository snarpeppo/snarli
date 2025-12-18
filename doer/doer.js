import chalk from "chalk";
import inquirer from "inquirer";
import TreePrompt from "inquirer-tree-prompt";
import { getProfileActive,getPath } from "../utils.js";
import { mainMenuLogged } from "../index.js";

import {runRoutine, editRoutine, deleteRoutine, routineBash} from "../routinesCommands/bash.js";
const absPath = getPath();
export function doer() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "Operation",
                message: "What would you like to do?",
                choices: [
                    { name: "Create routine", value: "new_routine" },
                    { name: "My Routines", value: "routines" },
                    { name: "Back", value: "back" },
                    { name: "Exit", value: "exit" }
                ]
            },

        ]).then(answers => {
            switch (answers.Operation) {
                case "new_routine":
                    console.log(chalk.green("Creating a new routine..."));
                    // Add logic for creating a new routine here
                    routineType(doer);
                    break;
                case "routines":
                    console.log(chalk.green("Listing your routines..."));
                    // Add logic for creating a new routine here
                    myRoutines(doer);
                    break;
                case "back":
                    console.clear()
                    mainMenuLogged(getProfileActive().file.username);
                    break;
                case "exit":
                    console.log(chalk.yellow("Exiting..."));
                    process.exit(0);
                default:
                    console.log(chalk.red("Invalid option selected!", answers.Operation));
            }
        })
}

export function routineType(doer) {
    inquirer
        .prompt([
            {
                type: "list",
                name: "RoutineType",
                message: "What kind of routine you want to create?",
                choices: [
                    { name: "Bash", value: "bash" },
                    { name: "Back", value: "back" }
                ]
            },

        ]).then(answers => {
            console.clear();
            switch (answers.RoutineType) {
                case "bash":
                    console.clear();
                    console.log(chalk.green("Creating a new routine..."));
                    // Add logic for creating a new routine here
                    routineBash();
                    break;
                case "back":
                    console.clear()
                    doer();
                    break;
                default:
                    console.log(chalk.red(answers.RoutineType));
            }
        })
}


export function myRoutines(doer) {
    console.clear();
    let profile = getProfileActive();
    if (!profile.file.routines || Object.keys(profile.file.routines).length === 0) {
        console.log(chalk.yellow("No routines found, please create one first!"));
        doer();
    } else {
        inquirer.registerPrompt('tree', TreePrompt);
        let arr = [
            {
                type: 'tree',
                name: 'command',
                message: 'Select a routine to execute:',
                tree: []
            }
        ];
        Object.entries(profile.file.routines).forEach(([routineName, routinePath]) => {
            arr[0].tree.push(buildCommandTree(routineName));
        });

        inquirer.prompt(arr).then((answers) => {
            console.log(JSON.stringify(answers));

            switch (answers.command[0].action) {
                case "execute":
                    console.clear();;
                    runRoutine(answers.command[0].routine, 'bash');
                    break;
                case "edit":
                    console.log(chalk.green(`Editing routine: ${answers.command[0].routine}`));
                    editRoutine(answers.command[0].routine);
                    break;
                case "delete":
                    console.log(chalk.red(`Deleting routine: ${answers.command[0].routine}`));
                    deleteRoutine(answers.command[0].routine);
                    break;
                default:
                    console.log(chalk.red("Invalid option selected!"));
                    myRoutines();
            }
        })

    }
}

function buildCommandTree(routineName) {
    return {
        value: routineName,
        children: [
            {
                value: [{ action: "execute", routine: routineName }],
                name: "Execute",
            },
            {
                value: [{ action: "edit", routine: routineName }],
                name: "Edit",
            },
            {
                value: [{ action: "delete", routine: routineName }],
                name: "Delete",
            }
        ]
    }

}
