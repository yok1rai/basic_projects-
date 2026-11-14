import { User } from "./net.ts";
import type { Result } from "./interfaces.ts";
import { sectionText } from "./utils.ts";
import AppErr from "./error.ts";

export function UserData(user: User): Result {
    const text = sectionText(`${user.username}`, [
        `Bio: ${user.bio ?? "Unavailable"}`,
        `Email: ${user.email ?? "Unavailable"}`,
        `Follower Count: ${user.followers}`,
        `Following Count: ${user.following}`,
        `Location: ${user.location ?? "Unavailable"}`,
    ]);
    return { status: "ok", associatedObject: text };
}

export async function formatActivity(user: User): Promise<Result> {
    const activityText: string[] = [];
    const activities = await user.getActivity();
    for (const activity of activities) {
        const repo = activity.repo.name;
        let description: string;

        switch (activity.type) {
            case "PushEvent":
                description = `Pushed to ${repo}`;
                break;
            case "CreateEvent": 
                description = `Created ${activity.payload.ref_type ?? 'a resource'} in ${repo}`; 
                break; 
            case "IssueEvent":
                description = `${activity.payload.action ?? 'Updated'} an issue in ${repo}`;
                break; 
            case "WatchEvent": 
                description = `Starred ${repo}`; 
                break; 
            case "ForkEvent": 
                description = `Forked ${repo}`; 
                break;  
            default: 
                description = `${activity.type} in ${repo}`
        }
        activityText.push(description); 
    }

    if (activityText.length === 0) throw new AppErr("No Recent Activity");

    return {
        status: "ok",
        associatedObject: sectionText(
            `${user.username}'s Recent Activity`,
            activityText,
        ),
    };
}
