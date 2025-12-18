#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { create, login, logout } from "./profile/profile.js";
// import figlet from "figlet";
import fs from "fs";
import { doer } from "./doer/doer.js";
import path from "path";
import {exec} from "child_process";
import si from "systeminformation";

// promises style - new since version 3

// import { getPath } from "./utils.js";

// const absPath = getPath();

program.version("1.0.0").description("Snarli");



function mainMenu() {

  // console.log(chalk.blueBright(figlet.textSync("Snarli", { horizontalLayout: "full" })));
  inquirer
    .prompt([
      {
        type: "list",
        name: "Operation",
        message: "What would you like to do?",
        choices: [
          { name: "Create profile", value: "create" },
          { name: "Login", value: "login" },
          { name: "Exit", value: "exit" }
        ]
      },

    ])
    .then((answers) => {
      switch (answers.Operation) {
        case "create":
          create(mainMenu);
          break;
        case "login":
          login();
          break;
        case "exit":
          console.log(chalk.yellow("Exiting..."));
          process.exit(0);
        default:

      }
      // console.log(chalk.green(`Hey there, ${answers.Operation}!`));
    });
};

export function mainMenuLogged(username) {
  console.log(chalk.green(`Hey there, ${username}!`));
  inquirer
    .prompt([
      {
        type: "list",
        name: "Operation",
        message: "What would you like to do?",
        choices: [
          { name: "Create profile", value: "create" },
          { name: "Routines", value: "routines" },
          {name: "Commands", value: "commands"},
          { name: "Logout", value: "logout" },
          { name: "Exit", value: "exit" }
        ]
      },

    ])
    .then((answers) => {
      switch (answers.Operation) {
        case "create":
          create(mainMenuLogged);
          break;
        case "logout":
          logout(username, mainMenu);
          break;
        case "routines":
          console.clear();
          doer(username);
          break;
        case "exit":
          console.log(chalk.yellow("Exiting..."));
          process.exit(0);
        default:

      }
      // console.log(chalk.green(`Hey there, ${answers.Operation}!`));
    });
};

program.action(() => {
  var absolutePath = path.resolve();
  if(!absolutePath.endsWith('snarli')) {
    // absolutePath = path.join(absolutePath, 'users');
     exec('mkdir -p snarli/users', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating users directory: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error creating users directory: ${stderr}`);
        return;
      }
      console.log(`Users directory created: ${stdout}`);
    });
    exec('mkdir -p snarli/_routines', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating users directory: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error creating users directory: ${stderr}`);
        return;
      }
      console.log(`Users directory created: ${stdout}`);
    });
  }
  

  let activeProfile = fs.readdirSync(`${absolutePath}/users`).find(file => file.endsWith('_active.json'));
  if (activeProfile) {
    const username = activeProfile.replace('_active.json', '');
    mainMenuLogged(username);
  } else {
    mainMenu();
  }
});

program.parse(process.argv);
