export interface GitHubUser {
    login: string;
    public_repos: number;
    bio: string | null;
    email: string | null;
    followers: number; 
    following: number; 
    location: string | null; 
}

export interface Result {
    status: "ok" | "failed";
    associatedObject?: string; 
}

export interface Activity {
    type: string;
    repo: {
        name: string;
    };
    payload: {
        action?: string;
        ref?: string;
        ref_type?: string;
        before?: string;
        head?: string;
    };
    created_at: string;
}
