import inquirer from "inquirer";
import chalk from "chalk";
import { create, login, logout } from "./profile/userManager.js";
import { doer } from "./doer/routineManager.js";

export function mainMenu() {
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
          login((username) => mainMenuLogged(username, true));
          break;
        case "exit":
          console.log(chalk.yellow("Exiting..."));
          process.exit(0);
        default:
          break;
      }
    });
}

export function mainMenuLogged(username, isFirst = false) {
  if (isFirst) console.log(chalk.green(`Hey there, ${username}!`));
  console.clear();
  inquirer
    .prompt([
      {
        type: "list",
        name: "Operation",
        message: "What would you like to do?",
        choices: [
          { name: "Create profile", value: "create" },
          { name: "Routines", value: "routines" },
          { name: "Commands", value: "commands" },
          { name: "Logout", value: "logout" },
          { name: "Exit", value: "exit" }
        ]
      },
    ])
    .then((answers) => {
      switch (answers.Operation) {
        case "create":
          create(() => mainMenuLogged(username, false));
          break;
        case "logout":
          logout(username, mainMenu);
          break;
        case "routines":
          doer(username, () => mainMenuLogged(username, false));
          break;
        case "exit":
          console.log(chalk.yellow("Exiting..."));
          process.exit(0);
        default:
          break;
      }
    });
}