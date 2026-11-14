import { homedir } from "node:os";
import { join } from "node:path";

export const dataDir = join(
    process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"),
    "taskcli"
);

export const targetFile = process.env.TARGET ?? join(dataDir, "tasks.json");
