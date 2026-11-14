export class AppErr extends Error {
    constructor(message: string, public associatedObject?: string, public critic: boolean = false) {
        super(message); 
    }
}
