import { getPath } from "./utils.js";

export interface Config {
  absPath: string;
  usersDir: string;
  routinesDir: string;
  passwordMinLength: number;
  editors: string[];
}

export const config: Config = {
    absPath: getPath(),
    usersDir: `${getPath()}/users`,
    routinesDir: `${getPath()}/_routines`,
    passwordMinLength: 4,
    editors: ['nano', 'vim']
};