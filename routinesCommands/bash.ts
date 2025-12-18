import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import { execSync, spawn } from "child_process";
import { doer } from "../doer/doer.js";
import { getProfileActive } from "../utils.js";
import { config } from "../config.js";

export async function routineBash(): Promise<void> {
    // Chiedi il nome del file da creare/modificare
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'fileName',
            message: 'Come vuoi chiamare lo script? (ad es. myscript.sh):',
            default: 'myscript'
        }
    ]);
    console.clear();
    try {
        if (!fs.existsSync(`${config.routinesDir}/${answers.fileName}.sh`)) {
            let profile = getProfileActive();
            profile.file.routines = {
                ...profile.file.routines,
                [answers.fileName]: `${config.routinesDir}/${answers.fileName}.sh`,
            }

            console.log(profile.file.routines);
            
            fs.writeFileSync(`${config.usersDir}/${profile.name}`, JSON.stringify(profile.file, null, 2));
            fs.writeFileSync(`${config.routinesDir}/${answers.fileName}.sh`, '#!/bin/bash\n\n', { mode: 0o755 });
        }

        // Chiedi quale editor usare
        const { editor } = await inquirer.prompt([
            {
                type: 'list',
                name: 'editor',
                message: 'Scegli un editor di testo:',
                choices: config.editors
            }
        ]);

        // Apri l’editor selezionato
        execSync(`${editor} ${config.routinesDir}/${answers.fileName}.sh`, { stdio: 'inherit' });
        console.log(chalk.green(`File ${answers.fileName} creato con successo!`));
        doer();
    } catch (err) {
        console.error(chalk.red('Errore durante la creazione/modifica del file:', (err as Error).message));
        doer();
    }
}

export async function runRoutine(routineName: string, action: string): Promise<void> {
    try {
        let profile = getProfileActive();
        let routinePath = profile.file.routines[routineName];
        if (routinePath) {
            const child = spawn(action, [routinePath]);

            let spinner = ora(`Running\t`).start(); 

            child.stdout.on('data', (data) => {
                process.stdout.write(data);
            });

            child.stderr.on('data', (data) => {
                process.stderr.write(chalk.yellow(data.toString()));
            });

            child.on('close', (code) => {
                if (code === 0) {
                    spinner.succeed(chalk.green("Routine executed successfully!"));
                    doer();
                } else {;
                    spinner.fail(chalk.red(`Routine exited with code ${code}`));
                    doer();
                }
            });
        } else {
            console.error(chalk.red(`Routine ${routineName} not found!`));
            doer();
        }
    } catch (error) {
        console.error(chalk.red(`Error executing routine ${routineName}: ${(error as Error).message}`));
        doer();
    }
}

export async function editRoutine(routineName: string): Promise<void> {
    try {
        execSync(`nano ${config.routinesDir}/${routineName}.sh`, { stdio: 'inherit' });
        console.log(chalk.green(`Routine ${routineName} edited successfully!`));
    } catch (err) {
        console.error(chalk.red(`Error editing routine ${routineName}: ${(err as Error).message}`));
    } finally {
        doer();
    }
}

export async function deleteRoutine(routineName: string): Promise<void> {
    try {
        let profile = getProfileActive();
        if (profile.file.routines[routineName]) {
            delete profile.file.routines[routineName];
            fs.writeFileSync(`${config.usersDir}/${profile.name}`, JSON.stringify(profile.file, null, 2));
            fs.unlinkSync(`${config.routinesDir}/${routineName}.sh`);
            console.log(chalk.green(`Routine ${routineName} deleted successfully!`));
        } else {
            console.error(chalk.red(`Routine ${routineName} not found!`));
        }
    } catch (err) {
        console.error(chalk.red(`Error deleting routine ${routineName}: ${(err as Error).message}`));
    } finally {
        doer();
    }
}

