import fs from 'fs';
import path from 'path';

export function getProfileActive(){
    const absPath = getPath();
        const name = fs.readdirSync(`${absPath}/users`).find(file => file.endsWith('_active.json'));
        let file = fs.readFileSync(`${absPath}/users/${name}`, 'utf8');
        file = JSON.parse(file);
        return {file, name};
}

export function getPath(){
    if(!path.resolve().endsWith('snarli')) {
        return path.join(path.resolve(), 'snarli');
    }else{
        return path.resolve();
    }
}