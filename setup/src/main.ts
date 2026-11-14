import { argv } from "bun";
import AppErr from "./error";

async function main() {
    try {
        const validApps = ["todoList", "github-activity"];  
        const args = argv.slice(2); 
        if (args[0] === undefined)
            throw new AppErr("No argument given");
        if (!validApps.includes(args[0]))
            throw new AppErr("Invalid app");
        const proc = Bun.spawn(["make", "-C", `${args[0]}`, ...args.slice(1)], {
            stdout: "inherit",
            stderr: "inherit",
        }); 

        const exitCode = await proc.exited;

        console.log(`Exited with code ${exitCode}`); 
    } catch (e) {
        process.exitCode = 1; 
        if (e instanceof AppErr) 
            console.log(`\x1b[31m[ERROR]\x1b[0m ${e.message}`); 
        else if (e instanceof Error)
            console.log(`\x1b[31m[Error]\x1b[0m ${e.message}`); 
        else 
            throw e; 
    }
}

await main(); 
