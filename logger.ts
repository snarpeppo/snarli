import chalk from "chalk";

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

export const logger = {
    debug: (message: string): void => {
        if (levels[LOG_LEVEL] <= 0) console.log(chalk.blue(`[DEBUG] ${message}`));
    },
    info: (message: string): void => {
        if (levels[LOG_LEVEL] <= 1) console.log(chalk.green(`[INFO] ${message}`));
    },
    warn: (message: string): void => {
        if (levels[LOG_LEVEL] <= 2) console.log(chalk.yellow(`[WARN] ${message}`));
    },
    error: (message: string): void => {
        if (levels[LOG_LEVEL] <= 3) console.log(chalk.red(`[ERROR] ${message}`));
    }
};