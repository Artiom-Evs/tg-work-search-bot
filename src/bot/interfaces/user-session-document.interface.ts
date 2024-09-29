import { CustomSession } from "./custom-context.interface";

export interface UserSessionDocument {
    key: string;
    session: CustomSession;
}
