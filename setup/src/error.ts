export default class AppErr extends Error {
    constructor(message: string, public associatedObject?: string, public critical: boolean = false) {
        super(message); 
    }
}
