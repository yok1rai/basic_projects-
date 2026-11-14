
import { AppErr } from "./error.ts";
import { TaskDB } from "./task.ts";

interface execResult {
    text: string, 
    associatedObject?: string | null 
}; 

export async function exec(
    db: TaskDB,
    command: string,
    args: string[]
): Promise<execResult> {
    switch (command) {
        case "new": {
            if (args[0] === undefined)
                throw new AppErr("No title given");
            if (args[1] === undefined)
                throw new AppErr("No description given");

            await db.newTask(args[0], args[1]);

            return {
                text: "Task successfully created",
                associatedObject: args[0]
            };
        }

        case "delete": {
            if (args[0] === undefined)
                throw new AppErr("No title given");

            await db.deleteTask(args[0]);

            return {
                text: "Task successfully deleted",
                associatedObject: args[0]
            };
        }

        case "finish": {
            if (args[0] === undefined)
                throw new AppErr("No title given");

            await db.completeTask(args[0]);

            return {
                text: "Task successfully marked as completed",
                associatedObject: args[0]
            };
        }

        case "list": {
            return {
                text: db.list(),
                associatedObject: null 
            };
        }

        default:
            throw new AppErr("Unknown command", command);
    }
}

