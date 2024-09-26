import { Injectable } from "@nestjs/common";

//@Injectable()
export class SessionMiddleware {
    constructor() {
        console.log("Session middleware initialized.");
    }
}