import AppErr from "./error.ts";
import type { GitHubUser, Activity } from "./interfaces.ts"

export class User {
    constructor(
        public username: string,
        public repoCount: number,
        public followers: number, 
        public following: number, 
        public location?: string, 
        public bio?: string,
        public email?: string,
    ) {}

    public static async getUser(user: string): Promise<User> {
        const res = await fetch(
            `https://api.github.com/users/${encodeURIComponent(user)}`,
        );
        switch (res.status) {
            case 404:
                throw new AppErr("Unknown user", user);
            case 403:
                throw new AppErr("Request refused");
            case 400:
                throw new AppErr("invalid request");
            case 500:
                throw new AppErr("Internal server error");
        }
        if (!res.ok) throw new AppErr("Unknown Connection Error");

        const data = await res.json();
        if (!this.verifyUser(data))
            throw new AppErr("Corrupted REST API", JSON.stringify(data), true);

        return new User(
            data.login,
            data.public_repos,
            data.followers,
            data.following,
            data.location ?? undefined,  
            data.bio ?? undefined,
            data.email ?? undefined,
        );
    }

    private static verifyUser(obj: unknown): obj is GitHubUser {
        if (
            typeof obj !== "object" ||
            obj === null ||
            !("login" in obj) ||
            typeof obj.login !== "string" ||
            !("public_repos" in obj) ||
            !Number.isSafeInteger(obj.public_repos) ||
            (obj.public_repos as number) < 0 ||
            !("bio" in obj) ||
            (obj.bio !== null && typeof obj.bio !== "string") ||
            !("email" in obj) ||
            (obj.email !== null && typeof obj.email !== "string")
        )
            return false;

        return true;
    }

    private static verifyActivity(obj: unknown): obj is Activity {
        if (
            typeof obj !== "object" ||
            obj === null ||
            Array.isArray(obj) ||
            !("type" in obj) ||
            typeof obj.type !== "string" ||
            !("repo" in obj) ||
            typeof obj.repo !== "object" ||
            obj.repo === null ||
            Array.isArray(obj.repo) ||
            !("name" in obj.repo) ||
            typeof obj.repo.name !== "string" ||
            !("payload" in obj) ||
            typeof obj.payload !== "object" ||
            obj.payload === null ||
            Array.isArray(obj.payload)
        )
            return false;

        const payload = obj.payload;

        if (
            ("action" in payload && typeof payload.action !== "string") ||
            ("ref" in payload && typeof payload.ref !== "string") ||
            ("ref_type" in payload && typeof payload.ref_type !== "string") ||
            ("before" in payload && typeof payload.before !== "string") ||
            ("head" in payload && typeof payload.head !== "string") ||
            ("created_at" in obj &&
                obj.created_at !== null &&
                typeof obj.created_at !== "string")
        )
            return false;

        return true;
    }

    public async getActivity(): Promise<Activity[]> {
        const res = await fetch(
            `https://api.github.com/users/${encodeURIComponent(this.username)}/events`,
        );

        if (res.status === 404) throw new AppErr("Unknown user", this.username);

        if (!res.ok)
            throw new AppErr("Failed to fetch activity", String(res.status));

        const data: unknown = await res.json();

        if (!Array.isArray(data) || !data.every(User.verifyActivity))
            throw new AppErr("Corrupted Activity", JSON.stringify(data), true);

        return data;
    }
}
