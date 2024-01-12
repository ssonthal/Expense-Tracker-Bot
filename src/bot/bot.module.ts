// bot.module.ts
import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { DatabaseModule } from './../db/db.module';

@Module({
  imports: [DatabaseModule],
  providers: [BotService],
})
export class BotModule {}
