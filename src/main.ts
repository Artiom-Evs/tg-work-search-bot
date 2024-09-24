import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './services/bot.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    app.enableShutdownHooks();

    const bot = app.get(BotService);
    await bot.launch();
  }

  bootstrap();