
import AppErr, { handleError } from "./error";
import { User } from "./net";
import { argv } from "node:process";
import { UserData, formatActivity } from "./exec";
import type { Result } from "./interfaces";

const usage = `Usage: github-activity <username> [command]

Commands:
  info       Show user information (default)
  activity   Show recent GitHub activity
  all        Show both user information and activity
  help       Show this message`;

function printResult(result: Result): void {
    if (result.status !== "ok")
        throw new AppErr(
            "Failed to process result",
            result.associatedObject,
        );

    if (result.associatedObject)
        console.log(result.associatedObject);
}

async function main(): Promise<void> {
    try {
        const args = argv.slice(2);
        const username = args[0];
        const command = args[1] ?? "info";

        if (username === "--help" || username === "-h" ||
            username === "help") {
            console.log(usage);
            return;
        }

        if (!username)
            throw new AppErr("No user given", usage);

        if (args.length > 2)
            throw new AppErr("Too many arguments", usage);

        if (!["info", "activity", "all", "help"].includes(command))
            throw new AppErr("Unknown command", command);

        if (command === "help") {
            console.log(usage);
            return;
        }

        const user = await User.getUser(username);

        switch (command) {
            case "info":
                printResult(UserData(user));
                break;

            case "activity":
                printResult(await formatActivity(user));
                break;

            case "all":
                printResult(UserData(user));
                console.log();
                printResult(await formatActivity(user));
                break;
        }
    } catch (e: unknown) {
        process.exitCode = 1;
        handleError(e);
    }
}

await main();

