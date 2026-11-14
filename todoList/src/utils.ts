import { Interface } from "node:readline/promises"; 

type Status = "ok" | "error" | "warning" | "critical";

export function statusText(
    status: Status,
    text: string,
    extra?: string,
    bold = false
): string {
    let color: string;

    switch (status) {
        case "ok":
            color = "\x1b[32m";
            break;
        case "error":
        case "critical":
            color = "\x1b[31m";
            break;
        case "warning":
            color = "\x1b[33m";
            break;
    }

    const header = bold || status === "critical" ? "\x1b[1m" : "";
    const extraText = extra !== undefined ? ` [${extra}]` : "";

    return `${header}${color}[${status.toUpperCase()}]\x1b[39m ${text}${extraText}\x1b[0m`;
}

export async function input(rl: Interface, prompt?: string): Promise<string> {
    return await rl.question(prompt ?? "> "); 
}


export function splitArgs(line: string): string[] {
    const args: string[] = [];
    let current = "";
    let quote: "'" | '"' | null = null;
    let started = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i]!;

        if (quote !== null) {
            if (char === quote) {
                quote = null;
                continue;
            }

            if (char === "\\") {
                const next = line[i + 1];

                if (
                    next === quote ||
                    next === "\\" ||
                    (quote === '"' && next === "$")
                ) {
                    current += next;
                    i++;
                    continue;
                }

                if (quote === '"' && next === "\n") {
                    i++;
                    continue;
                }
            }

            current += char;
            continue;
        }

        if (/\s/.test(char)) {
            if (started) {
                args.push(current);
                current = "";
                started = false;
            }
            continue;
        }

        if (char === "'" || char === '"') {
            quote = char;
            started = true;
            continue;
        }

        if (char === "\\") {
            const next = line[++i];

            if (next === undefined)
                throw new Error("Trailing backslash");

            if (next === "\n")
                continue;

            const escapes: Record<string, string> = {
                n: "\n",
                t: "\t",
                r: "\r",
                a: "\x07",
                e: "\x1b",
                f: "\f",
                v: "\v"
            };

            current += escapes[next] ?? next;
            started = true;
            continue;
        }

        current += char;
        started = true;
    }

    if (quote !== null)
        throw new Error("Unterminated quote");

    if (started)
        args.push(current);

    return args;
}

