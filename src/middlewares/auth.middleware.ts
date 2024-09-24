import { CustomContext } from "../customContext";

export default async function authMiddleware(ctx: CustomContext, next: () => Promise<void>) {
    if (ctx.session.auth.isAuthorized)
        await next();
    else 
        await ctx.reply("You are not authorized. Please, use /start to authorize.");
}
