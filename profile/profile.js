import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import ora from "ora";
import { doer } from "../doer/doer.js";
import { getPath } from "../utils.js";

let absPath = getPath();
export function create(backToMenu) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "username",
                message: "Enter your username:"
            },
            {
                type: "password",
                name: "password",
                message: "Enter your password:"
            }
        ])
        .then((profileAnswers) => {
            let profileExists = false;
           
            try {
                if (fs.existsSync(`${absPath}/users/${profileAnswers.username}.json`, 'utf8')) {
                    let file = fs.readFileSync(`${absPath}/users/${profileAnswers.username}.json`, 'utf8');
                    file = JSON.parse(file);
                    if (file.username === profileAnswers.username) {
                        profileExists = true;
                        console.log(chalk.red(`Profile with username ${profileAnswers.username} already exists!`));
                        backToMenu();
                    }
                }
            } catch (err) {
                console.log(err);
            }

            if (!profileExists) {
                const spinner = ora(`Creating profile...`).start(); // Start the spinner
                fs.writeFileSync(`${absPath}/users/${profileAnswers.username}.json`,
                    JSON.stringify({ username: profileAnswers.username,
                         password: profileAnswers.password,
                          routines:{} 
                        }, null, 2)
                );
                setTimeout(() => {
                    spinner.succeed(chalk.green("Profile Created!"))
                    backToMenu();
                }, 1000);
            }

        });
}

export function login() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "username",
                message: "Enter your username:"
            },
            {
                type: "password",
                name: "password",
                message: "Enter your password:"
            }
        ])
        .then((loginAnswers) => {
            console.clear();
            try {
                if (fs.existsSync(`${absPath}/users/${loginAnswers.username}.json`, 'utf8')) {
                    let file = fs.readFileSync(`${absPath}/users/${loginAnswers.username}.json`, 'utf8');
                    file = JSON.parse(file);
                    if (file.username === loginAnswers.username && file.password === loginAnswers.password) {
                        console.log(chalk.green(`Login successful! Welcome ${file.username}!`));
                        fs.renameSync(`${absPath}/users/${loginAnswers.username}.json`, `${absPath}/users/${loginAnswers.username}_active.json`); // Rename the file to profile.json
                        doer(); // Call the doer function to proceed with the next steps
                    } else {
                        console.log(chalk.red("Invalid username or password!"));
                    }
                } else {
                    console.log(chalk.red(`Profile with username ${loginAnswers.username} does not exist!`));
                }
            } catch (err) {
                console.log(err);
            }
        });
}

export function logout(username, mainMenu) {
    try {
        fs.renameSync(`${absPath}/users/${username}_active.json`, `${absPath}/users/${username}.json`)
        console.log(chalk.yellow("Logged out successfully!"));
        mainMenu();
    } catch (err) {
        console.log(chalk.red(err));
    }
}