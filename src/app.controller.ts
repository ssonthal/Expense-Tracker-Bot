import { Controller } from '@nestjs/common';
import { DatabaseService } from './db/db.service';
import { BotService } from './bot/bot.service';

@Controller()
export class AppController {
  constructor(private botService: BotService) {
    botService.botMessage();
  }
}
