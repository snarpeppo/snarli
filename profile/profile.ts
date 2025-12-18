import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import ora from "ora";
import { doer } from "../doer/doer.js";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { ProfileFile } from "../utils.js";

type BackToMenu = () => void;

export async function create(backToMenu: BackToMenu): Promise<void> {
    logger.info("Prompting for profile creation");
    const profileAnswers = await inquirer.prompt([
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
    ]);

    // Validate inputs
    if (!profileAnswers.username.trim()) {
        logger.warn("Username validation failed: empty username");
        console.log(chalk.red("Username cannot be empty!"));
        backToMenu();
        return;
    }
    if (profileAnswers.password.length < config.passwordMinLength) {
        logger.warn(`Password validation failed: too short (${profileAnswers.password.length})`);
        console.log(chalk.red(`Password must be at least ${config.passwordMinLength} characters long!`));
        backToMenu();
        return;
    }

    let profileExists = false;
   
    try {
        if (fs.existsSync(`${config.usersDir}/${profileAnswers.username}.json`)) {
            let fileContent = fs.readFileSync(`${config.usersDir}/${profileAnswers.username}.json`, 'utf8');
            let file = JSON.parse(fileContent) as ProfileFile;
            if (file.username === profileAnswers.username) {
                profileExists = true;
                logger.warn(`Profile already exists: ${profileAnswers.username}`);
                console.log(chalk.red(`Profile with username ${profileAnswers.username} already exists!`));
                backToMenu();
            }
        }
    } catch (err) {
        logger.error(`Error checking profile existence: ${(err as Error).message}`);
        console.log(chalk.red(`Error checking profile: ${(err as Error).message}`));
        backToMenu();
        return;
    }

    if (!profileExists) {
        logger.info(`Creating profile for ${profileAnswers.username}`);
        const spinner = ora(`Creating profile...`).start(); // Start the spinner
        try {
            fs.writeFileSync(`${config.usersDir}/${profileAnswers.username}.json`,
                JSON.stringify({ username: profileAnswers.username,
                     password: profileAnswers.password,
                      routines:{} 
                    }, null, 2)
            );
            setTimeout(() => {
                spinner.succeed(chalk.green("Profile Created!"))
                logger.info(`Profile created successfully: ${profileAnswers.username}`);
                backToMenu();
            }, 1000);
        } catch (err) {
            spinner.fail(chalk.red("Failed to create profile"));
            logger.error(`Failed to create profile: ${(err as Error).message}`);
            console.log(chalk.red(`Error: ${(err as Error).message}`));
            backToMenu();
        }
    }
}

export async function login(): Promise<void> {
    logger.info("Prompting for login");
    const loginAnswers = await inquirer.prompt([
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
    ]);

    // Validate inputs
    if (!loginAnswers.username.trim()) {
        logger.warn("Login validation failed: empty username");
        console.log(chalk.red("Username cannot be empty!"));
        return;
    }
    if (!loginAnswers.password) {
        logger.warn("Login validation failed: empty password");
        console.log(chalk.red("Password cannot be empty!"));
        return;
    }

    console.clear();
    try {
        if (fs.existsSync(`${config.usersDir}/${loginAnswers.username}.json`)) {
            let fileContent = fs.readFileSync(`${config.usersDir}/${loginAnswers.username}.json`, 'utf8');
            let file = JSON.parse(fileContent) as ProfileFile;
            if (file.username === loginAnswers.username && file.password === loginAnswers.password) {
                logger.info(`Login successful for ${file.username}`);
                console.log(chalk.green(`Login successful! Welcome ${file.username}!`));
                fs.renameSync(`${config.usersDir}/${loginAnswers.username}.json`, `${config.usersDir}/${loginAnswers.username}_active.json`); // Rename the file to profile.json
                await doer(); // Call the doer function to proceed with the next steps
            } else {
                logger.warn(`Invalid login attempt for ${loginAnswers.username}`);
                console.log(chalk.red("Invalid username or password!"));
            }
        } else {
            logger.warn(`Profile not found for login: ${loginAnswers.username}`);
            console.log(chalk.red(`Profile with username ${loginAnswers.username} does not exist!`));
        }
    } catch (err) {
        logger.error(`Error during login: ${(err as Error).message}`);
        console.log(chalk.red(`Error during login: ${(err as Error).message}`));
    }
}

export async function logout(username: string, mainMenu: BackToMenu): Promise<void> {
    try {
        logger.info(`Logging out user: ${username}`);
        fs.renameSync(`${config.usersDir}/${username}_active.json`, `${config.usersDir}/${username}.json`)
        console.log(chalk.yellow("Logged out successfully!"));
        logger.info(`Logged out successfully: ${username}`);
        await mainMenu();
    } catch (err) {
        logger.error(`Error during logout: ${(err as Error).message}`);
        console.log(chalk.red(`Error during logout: ${(err as Error).message}`));
    }
}