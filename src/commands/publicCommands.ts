import { Composer } from "telegraf";
import { CustomContext } from "../customContext";

const publicCommands = new Composer<CustomContext>();
publicCommands.start((ctx) => ctx.scene.enter("authorization"));
publicCommands.help(async (ctx) => await ctx.reply("I'm sorry! I can't help you yet :("));

export default publicCommands;
