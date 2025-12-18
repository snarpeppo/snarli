import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import { execSync, spawn } from "child_process";
import { doer } from "../doer/doer.js";
import { getPath,getProfileActive } from "../utils.js";

const absPath = getPath();

export async function routineBash() {
    // Chiedi il nome del file da creare/modificare
    await inquirer.prompt([
        {
            type: 'input',
            name: 'fileName',
            message: 'Come vuoi chiamare lo script? (ad es. myscript.sh):',
            default: 'myscript'
        }
    ]).then(async answers => {
        console.clear();
        if (!fs.existsSync(`${absPath}/_routines/${answers.fileName}.sh`)) {
            let profile = getProfileActive();
            profile.file.routines = {
                ...profile.file.routines,
                [answers.fileName]: `${absPath}/_routines/${answers.fileName}.sh`,
            }

            console.log(profile.file.routines);
            
            fs.writeFileSync(`${absPath}/users/${profile.name}`, JSON.stringify(profile.file, null, 2));
            fs.writeFileSync(`${absPath}/_routines/${answers.fileName}.sh`, '#!/bin/bash\n\n', { mode: 0o755 });
        }

        // Chiedi quale editor usare
        const { editor } = await inquirer.prompt([
            {
                type: 'list',
                name: 'editor',
                message: 'Scegli un editor di testo:',
                choices: ['nano', 'vim']
            }
        ]);

        // Apri l’editor selezionato
        try {
            execSync(`${editor} ${absPath}/_routines/${answers.fileName}.sh`, { stdio: 'inherit' });
            console.log(chalk.green(`File ${answers.fileName} creato con successo!`));
            doer();

        } catch (err) {
            console.error('Errore durante la modifica del file:', err.message);
        }
    })
}

export async function runRoutine(routineName, action) {
    let profile = getProfileActive();
    let routinePath = profile.file.routines[routineName];
    if (routinePath) {
        try {
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
        } catch (error) {
            console.error(chalk.red(`Error executing routine ${routineName}: ${error.message}`));
        }
    } else {
        console.error(chalk.red(`Routine ${routineName} not found!`));
    }
}

export function editRoutine(routineName) {
    try {
        execSync(`nano ${absPath}/_routines/${routineName}.sh`, { stdio: 'inherit' })
    } catch (err) {
        console.error(chalk.red(`Error editing routine ${routineName}: ${err.message}`));
    }finally{
        console.log(chalk.green(`Routine ${routineName} edited successfully!`));
        doer();
    }
}

export function deleteRoutine(routineName) {
    let profile = getProfileActive();
    if (profile.file.routines[routineName]) {
        delete profile.file.routines[routineName];
        fs.writeFileSync(`${absPath}/users/${profile.name}`, JSON.stringify(profile.file, null, 2));
        fs.unlinkSync(`${absPath}/_routines/${routineName}.sh`);
        console.log(chalk.green(`Routine ${routineName} deleted successfully!`));
    } else {
        console.error(chalk.red(`Routine ${routineName} not found!`));
    }
    doer();
}

