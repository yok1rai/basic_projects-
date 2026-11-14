import { statusText } from "./utils";

export function handleError(err: unknown): boolean {
    if (err instanceof AppErr) {
        
        console.error(
            statusText(
                err.critical ? "critical" : "error",
                err.message,
                err.associatedObject
            )
        );

        return err.critical;
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

export default class AppErr extends Error {
    constructor(message: string, public associatedObject?: string, public critical: boolean = false) {
        super(message); 
    }
}
