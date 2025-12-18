import fs from 'fs';
import path from 'path';
import { config } from './config.js';

export interface ProfileFile {
  username: string;
  password: string;
  routines: Record<string, string>;
}

export interface ActiveProfile {
  file: ProfileFile;
  name: string;
}

export function getProfileActive(): ActiveProfile {
    try {
        const name = fs.readdirSync(config.usersDir).find(file => file.endsWith('_active.json'));
        if (!name) {
            throw new Error("No active profile found");
        }
        let file: ProfileFile = JSON.parse(fs.readFileSync(`${config.usersDir}/${name}`, 'utf8'));
        return {file, name};
    } catch (err) {
        throw new Error(`Error getting active profile: ${(err as Error).message}`);
    }
}

export function getPath(): string {
    if(!path.resolve().endsWith('snarli')) {
        return path.join(path.resolve(), 'snarli');
    }else{
        return path.resolve();
    }
}