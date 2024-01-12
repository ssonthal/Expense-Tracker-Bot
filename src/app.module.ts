import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotService } from './bot/bot.service';
import { DatabaseService } from './db/db.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BotService, DatabaseService],
})
export class AppModule {}
