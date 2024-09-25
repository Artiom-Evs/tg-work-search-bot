import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './services/bot.service';
import { createServer } from 'http';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    app.enableShutdownHooks();

    const bot = app.get(BotService);
    const server = createServer((req, res) => res.end("healthy"));

    const botTask = bot.launch();
    const serverTask = server.listen(3000, () => console.log("Server is running..."));
    
    await Promise.all([ botTask, serverTask ]);
}

bootstrap();
