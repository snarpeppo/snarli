import chalk from "chalk";
import inquirer from "inquirer";
import TreePrompt from "inquirer-tree-prompt";
import { getProfileActive } from "../utils.js";
import { mainMenuLogged } from "../index.js";
import { config } from "../config.js";
import { logger } from "../logger.js";

import {runRoutine, editRoutine, deleteRoutine, routineBash} from "../routinesCommands/bash.js";

type DoerCallback = () => void;

export async function doer(): Promise<void> {
    logger.debug("Entering doer menu");
    const answers = await inquirer.prompt([
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

    ]);

    switch (answers.Operation) {
        case "new_routine":
            logger.info("User selected create routine");
            console.log(chalk.green("Creating a new routine..."));
            // Add logic for creating a new routine here
            await routineType(doer);
            break;
        case "routines":
            logger.info("User selected my routines");
            console.log(chalk.green("Listing your routines..."));
            // Add logic for creating a new routine here
            await myRoutines(doer);
            break;
        case "back":
            logger.info("User selected back to main menu");
            console.clear()
            mainMenuLogged(getProfileActive().file.username);
            break;
        case "exit":
            logger.info("User selected exit");
            console.log(chalk.yellow("Exiting..."));
            process.exit(0);
        default:
            logger.warn(`Invalid option selected: ${answers.Operation}`);
            console.log(chalk.red("Invalid option selected!", answers.Operation));
    }
}

export async function routineType(doer: DoerCallback): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "RoutineType",
            message: "What kind of routine you want to create?",
            choices: [
                { name: "Bash", value: "bash" },
                { name: "Back", value: "back" }
            ]
        },

    ]);

    console.clear();
    switch (answers.RoutineType) {
        case "bash":
            console.clear();
            console.log(chalk.green("Creating a new routine..."));
            // Add logic for creating a new routine here
            await routineBash();
            break;
        case "back":
            console.clear()
            await doer();
            break;
        default:
            console.log(chalk.red(answers.RoutineType));
    }
}


export async function myRoutines(doer: DoerCallback): Promise<void> {
    console.clear();
    logger.debug("Listing user routines");
    let profile;
    try {
        profile = getProfileActive();
    } catch (err) {
        logger.error(`Error getting active profile: ${(err as Error).message}`);
        console.log(chalk.red((err as Error).message));
        await doer();
        return;
    }
    if (!profile.file.routines || Object.keys(profile.file.routines).length === 0) {
        logger.info("No routines found for user");
        console.log(chalk.yellow("No routines found, please create one first!"));
        await doer();
    } else {
        logger.info(`Found ${Object.keys(profile.file.routines).length} routines`);
        inquirer.registerPrompt('tree', TreePrompt);
        const arr = [
            {
                type: 'tree',
                name: 'command',
                message: 'Select a routine to execute:',
                tree: [] as any[]
            }
        ];
        Object.entries(profile.file.routines).forEach(([routineName, routinePath]) => {
            // @ts-ignore
            arr[0].tree.push(buildCommandTree(routineName));
        });

        const answers = await inquirer.prompt(arr);
        logger.info(`User selected action: ${answers.command[0].action} on ${answers.command[0].routine}`);

        switch (answers.command[0].action) {
            case "execute":
                console.clear();;
                await runRoutine(answers.command[0].routine, 'bash');
                break;
            case "edit":
                console.log(chalk.green(`Editing routine: ${answers.command[0].routine}`));
                await editRoutine(answers.command[0].routine);
                break;
            case "delete":
                console.log(chalk.red(`Deleting routine: ${answers.command[0].routine}`));
                await deleteRoutine(answers.command[0].routine);
                break;
            default:
                logger.warn(`Invalid action selected: ${answers.command[0].action}`);
                console.log(chalk.red("Invalid option selected!"));
                await myRoutines(doer);
        }
    }
}

function buildCommandTree(routineName: string) {
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
