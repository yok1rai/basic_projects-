import { targetFile } from "./info.ts"
import { AppErr } from "./error.ts"

class Task {
    public static titleStyle = /^[a-zA-Z]{3,20}$/; 
    public static descriptionStyle = /^[a-zA-Z0-9 -]{10,50}$/; 
    public deleted = false; 
    public completed = false; 

    constructor(public title: string, public description: string, public id: number) {
        if (!Task.titleStyle.test(title))
            throw new AppErr("Invalid title", title);
        if (!Task.descriptionStyle.test(description))
            throw new AppErr("Invalid description", description); 
    }
}

export class TaskDB {
    private taskList: Task[] = [];
    private lastID = 0; 

    public async initTasks(): Promise<void> {
        const file = Bun.file(targetFile);

        if (!await file.exists()) {
            await Bun.write(targetFile, "[]"); 
            return; 
        }

        const content: Task[] = await file.json();

        if (!Array.isArray(content))
            throw new AppErr("Invalid task database", undefined, true);

        this.taskList = content; 
        this.integrityCheck(this.taskList); 
        this.lastID = Math.max(0, ...content.map(task => task.id)); 
    }

    private async update(): Promise<void> {
        await Bun.write(
            targetFile,
            JSON.stringify(this.taskList, null, 4) 
        ); 
    }

    private integrityCheck(objects: unknown[]) {
        for (const obj of objects) {
            if (typeof obj !== "object" || obj === null
               || !("title" in obj) || typeof obj.title !== "string"
               || !("description" in obj) || typeof obj.description !== "string"
               || !("id" in obj) || typeof obj.id !== "number"
               || !("deleted" in obj) || typeof obj.deleted !== "boolean"
               || !("completed" in obj) || typeof obj.completed !== "boolean")
                throw new AppErr("Corrupted JSON file", undefined, true); 
        }
    } 

    private findTask(title: string): Task | null {
        return this.taskList.find(task => task.title === title) ?? null; 
    }

    public async newTask(title: string, description: string): Promise<void> {
        if (this.findTask(title) !== null)
            throw new AppErr("Task exists", title);
        const task = new Task(title, description, this.lastID + 1);
        this.lastID++;
        this.taskList.push(task); 
        await this.update(); 
    }

    public async deleteTask(title: string): Promise<void> {
        const task = this.findTask(title); 

        if (task === null)
            throw new AppErr("Task not found", title); 

        if (task.deleted === true)
            throw new AppErr("Task is already deleted", title); 

        task.deleted = true; 
        await this.update(); 
    }

    public async completeTask(title: string): Promise<void> {
        const task = this.findTask(title); 

        if (task === null || task.deleted)
            throw new AppErr("Task not found", title); 
        if (task.completed === true)
            throw new AppErr("Task is already marked as deleted", title); 
        
        task.completed = true; 
        await this.update(); 
    }

    public list(): string {
    const activeTasks = this.taskList.filter(task => !task.deleted);

    if (activeTasks.length === 0)
        throw new AppErr("There are no tasks");

    return "\n" + activeTasks.map(task =>
        `#${task.id} ${task.title}: '${task.description}' ${task.completed ? "Completed" : "Still active"}`
    ).join("\n");
}
}
