import { AppErr } from "./error.ts";
import { TaskDB } from "./task.ts";
import { statusText, input, splitArgs } from "./utils.ts";
import { argv } from "bun";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { exec } from "./exec.ts";

function handleError(err: unknown): boolean {
    if (err instanceof AppErr) {
        console.error(
            statusText(
                err.critic ? "critical" : "error",
                err.message,
                err.associatedObject
            )
        );

        return err.critic;
    }

    if (err instanceof Error) {
        console.error(
            statusText("critical", `Unknown Error: ${err.message}`)
        );

        return true;
    }

    console.error(
        statusText("critical", `Unknown Error: ${String(err)}`)
    );

    return true;
}

async function main(): Promise<void> {
    try {
        const db = new TaskDB();
        await db.initTasks();

        const args = argv.slice(2);

        // CLI mode
        if (args[0] !== undefined) {
            const result = await exec(db, args[0], args.slice(1));
            console.log(statusText("ok", result.text, result.associatedObject ?? undefined)); 
            return;
        }

        // REPL mode
        const rl = createInterface({
            input: stdin,
            output: stdout
        });

        try {
            console.log("Welcome to the REPL mode!");

            while (true) {
                try {
                    const line = await input(
                        rl,
                        process.env.PROMPT ?? "> "
                    );

                    const args = splitArgs(line);
                    const command = args[0];

                    if (command === undefined)
                        throw new AppErr("No command given");

                    if (command.startsWith(".")) {
                        switch (command) {
                            case ".exit":
                                console.log("Goodbye!");
                                return;

                            default:
                                throw new AppErr(
                                    "Invalid special command",
                                    command
                                );
                        }
                    }

                    const result = await exec(db, command, args.slice(1)); 
                    console.log(statusText("ok", result.text, result.associatedObject ?? undefined)); 
                } catch (err) {
                    if (handleError(err)) {
                        process.exitCode = 1;
                        return;
                    }
                }
            }
        } finally {
            rl.close();
        }
    } catch (err) {
        process.exitCode = 1;
        handleError(err);
    }
}

await main();

