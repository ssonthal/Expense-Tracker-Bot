import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import * as Calendar from 'telegram-inline-calendar';
import { DatabaseService } from './../db/db.service';
import * as Table from 'ascii-table';
import { pdfMake } from 'pdfmake';
import * as dotenv from 'dotenv';

@Injectable()
export class BotService {
  private readonly bot: TelegramBot;
  private curExpenseObject = {
    curAmount: 0,
    curCategory: '',
    curDescription: '',
  };
  private categories = [];
  private waitingForUserDescription = false;
  private fromDate = '';
  private toDate = '';
  private messageIdToDelete = '';
  private expenseObj = [];
  private confirmationMessage = ['Yes', 'No'];
  private Instructions = `Instructions - 

    Use /add command to add a new expense category based on your preference. For example, 
    /add Trip -> This will create a new category called 'Trip'. 

    You can create multiple categories in one go like this - 
    /add Trip Movies

    Our default categories are - 
    1. Investment
    2. Rent
    3. Entertainment
    4. Food

    You can use command /setdefault if you wish to use these categories. 
    You can use /flush command to flush all existing categories and add categories of your choices.

    You can use /detail command to get details of your expenses.
    The system will prompt you to select start and end date and return the expenses added in that date range.`;
  private options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true,
      one_time_keyboard: true,
      reply_keyboard_remove: true,
    },
  };
  private optionForDetails = {
    reply_markup: {
      keyboard: [['Choose a day', 'Choose a month'], ['Total Expenses']],
      resize_keyboard: true,
      one_time_keyboard: true,
      reply_keyboard_remove: true,
    },
  };
  private calendar: Calendar;
  constructor(private readonly db: DatabaseService) {
    dotenv.config();
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.calendar = new Calendar(this.bot, {
      date_format: 'YYYY-MM-DD',
      language: 'en',
      stop_date: 'now',
    });
  }
  private createAsciiTable(data) {
    const columnWidths = [];
    data.forEach((row) => {
      row.forEach((cell, colIndex) => {
        columnWidths[colIndex] = Math.max(
          columnWidths[colIndex] || 0,
          cell.length,
        );
      });
    });
    const lines = data.map((row) =>
      row
        .map((cell, colIndex) => cell.padEnd(columnWidths[colIndex]))
        .join(' | '),
    );
    return lines.join('\n');
  }
  private async GetTotalExpenses(chatId, startTime, endTime) {
    this.db
      .GetDescriptiveExpensesWithinDateRange(chatId, startTime, endTime)
      .then((res) => {
        let formattedString = ``;
        if (res == null || res.length == 0 || res[0].expenses.length == 0) {
          this.bot.sendMessage(
            chatId,
            'No expenses added in the requested timeframe!',
          );
        } else {
          this.expenseObj = res;
          let data = new Array();
          data.push([`${this.fromDate} to ${this.toDate}`]);
          data.push(['Amount', 'Cateogry', 'Description']);
          //   const table = new Table(`${this.fromDate} to ${this.toDate}`);
          //   table.setHeading('Amount', 'Cateogry', 'Description');
          for (let i = 0; i < res[0].expenses.length; i++) {
            let expense = res[0].expenses[i];
            data.push([
              expense.amount.toString(),
              expense.category.name,
              expense.description,
            ]);
          }
          let table = this.createAsciiTable(data);
          this.bot
            .sendMessage(chatId, '```\n' + table + '\n```', {
              parse_mode: 'Markdown',
            })
            .then(() => {});
        }
        this.fromDate = '';
        this.toDate = '';
      });
  }
  private convertAsciiTableToPdfMake(asciiTableData) {
    const pdfMakeTableData = [];

    for (const row of asciiTableData) {
      const pdfMakeRow = [];
      for (const cell of row) {
        pdfMakeRow.push({ text: String(cell), border: [1, 1, 1, 1] });
      }
      pdfMakeTableData.push(pdfMakeRow);
    }
    return pdfMakeTableData;
  }
  private async sendWelcomeMessageText(msg) {
    await this.bot.sendMessage(
      msg.chat.id,
      `Hey ${msg.from.first_name}, welcome to ExpenseTracker - a fast and seamless way to track and analyze your expenses. 
    ${this.Instructions}`,
    );
  }
  private PrepareInlineKeyboard(res) {
    let inLineKeyboard = [];
    let tempInlineKeyboard = [];
    for (let i = 0; i < res.length; i++) {
      tempInlineKeyboard.push({ text: res[i], callback_data: res[i] });
      if (tempInlineKeyboard.length % 2 == 0 || i == res.length - 1) {
        inLineKeyboard.push(tempInlineKeyboard);
        tempInlineKeyboard = [];
      }
    }
    const inlineKeyboard = {
      inline_keyboard: inLineKeyboard,
      remove_keyboard: true,
      resize_keyboard: true,
      one_time_keyboard: true,
    };
    return inlineKeyboard;
  }
  private async sendToastMessage(msg, bot) {
    let toastMessage = `Expense added for amount ${this.curExpenseObject.curAmount} under ${this.curExpenseObject.curCategory}`;
    if (this.curExpenseObject.curDescription !== '') {
      toastMessage += ` with description: ${this.curExpenseObject.curDescription}`;
    }
    await bot.sendMessage(msg.chat.id, toastMessage);
    this.curExpenseObject['curAmont'] = 0;
    this.curExpenseObject['curCategory'] = '';
    this.curExpenseObject['curDescription'] = '';
  }
  private async GetExpensesByCategory(chatId, startTime, endTime) {
    this.db
      .GetExpensesWithinDateRange(chatId, startTime, endTime)
      .then((res) => {
        let formattedString = ``;
        if (res.length == 0) {
          this.bot.sendMessage(
            chatId,
            'No expenses added in the requested timeframe!',
          );
        } else {
          const table = new Table(`${this.fromDate} to ${this.toDate}`);
          table.setHeading('S.no', 'Cateogry', 'Amount');
          for (let i = 0; i < res.length; i++) {
            table.addRow(i + 1, res[i]['_id'], res[i]['total']);
          }
          this.bot.sendMessage(chatId, '```\n' + table + '\n```', {
            parse_mode: 'Markdown',
          });
        }
        this.fromDate = '';
        this.toDate = '';
      });
  }
  public botMessage() {
    this.bot.onText(/\/start/, (msg) => {
      this.db.CheckIfUserExists(msg.from.id).then((res) => {
        if (res.length == 0) {
          this.db.AddUser(msg).then((res) => {
            this.sendWelcomeMessageText(msg);
          });
        } else {
          this.sendWelcomeMessageText(msg);
        }
      });
    });
    this.bot.onText(/\/flush/, (msg) => {
      const inlineKeyboard = {
        inline_keyboard: [
          [{ text: 'Yes', callback_data: 'Yes' }],
          [{ text: 'No', callback_data: 'No' }],
        ],
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
      };
      this.bot.sendMessage(
        msg.chat.id,
        'Are you sure you want to delete all the categories?',
        { reply_markup: inlineKeyboard },
      );
    });
    this.bot.onText(/\/detail/, (msg) => {
      this.bot
        .sendMessage(msg.chat.id, `Please choose a start date.`)
        .then((sentMessage) => {
          this.calendar.startNavCalendar(msg);
          this.messageIdToDelete = sentMessage.message_id;
        });
    });
    this.bot.onText(/\/instructions/, (msg) => {
      this.bot.sendMessage(msg.chat.id, this.Instructions);
    });
    this.bot.onText(/\/setdefault/, (msg) => {
      this.db.SetDefaultCategoriesForUser(msg).then(() => {
        this.bot.sendMessage(msg.chat.id, 'Default Categories saved!');
      });
    });
    this.bot.onText(/\/stop/, (msg) => {
      const inlineKeyboard = {
        inline_keyboard: [
          [{ text: 'Yes', callback_data: 'yes_deleteUser' }],
          [{ text: 'No', callback_data: 'no_deleteUser' }],
        ],
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
      };
      this.bot.sendMessage(
        msg.chat.id,
        'Are you sure you want to leave ExpenseTracker and reset all data? ',
        { reply_markup: inlineKeyboard },
      );
    });
    this.bot.onText(/^\d+$/, (msg) => {
      this.curExpenseObject.curAmount = parseFloat(msg.text);
      this.db.GetUserCategories(msg).then((res) => {
        this.categories = res;
        if (this.categories.length > 0) {
          const inlineboard = this.PrepareInlineKeyboard(res);
          this.bot.sendMessage(
            msg.chat.id,
            'Choose a category for the expense - ',
            {
              reply_markup: inlineboard,
            },
          );
        } else {
          this.bot.sendMessage(
            msg.chat.id,
            `No categories added yet. Pls use "/add <category name>" command to add a new category and try adding expense again.`,
          );
        }
      });
    });
    this.bot.on('callback_query', (query) => {
      if (
        query.message.message_id ==
        this.calendar.chats.get(query.message.chat.id)
      ) {
        const res = this.calendar.clickButtonCalendar(query);
        if (res !== -1) {
          this.bot.deleteMessage(query.message.chat.id, this.messageIdToDelete);
          if (this.fromDate === '') {
            this.fromDate = res;
            this.bot
              .sendMessage(query.message.chat.id, `Please choose an end date.`)
              .then((sentMessage) => {
                this.calendar.startNavCalendar(query.message);
                this.messageIdToDelete = sentMessage.message_id;
              });
          } else if (this.toDate === '') {
            let fromDateTime = this.fromDate + ' ' + '00:00:00';
            this.toDate = res;
            let toDateTime = this.toDate + ' ' + '23:59:59';
            this.GetTotalExpenses(
              query.message.chat.id,
              fromDateTime,
              toDateTime,
            );
          }
        }
      } else if (this.categories.includes(query.data)) {
        this.bot.deleteMessage(query.message.chat.id, query.message.message_id);
        if (this.curExpenseObject.curAmount != 0) {
          this.curExpenseObject.curCategory = query.data;
          const inlineKeyboard = {
            inline_keyboard: [
              [{ text: 'Yes', callback_data: 'yes_description' }],
              [{ text: 'No', callback_data: 'no_description' }],
            ],
            remove_keyboard: true,
            resize_keyboard: true,
            one_time_keyboard: true,
          };
          this.bot.sendMessage(
            query.message.chat.id,
            `Do you want to add any description to this expense?`,
            { reply_markup: inlineKeyboard },
          );
        }
      } else if (this.confirmationMessage.includes(query.data)) {
        this.bot.deleteMessage(query.message.chat.id, query.message.message_id);
        if (query.data == 'Yes') {
          this.db
            .FlushAllCategoriesForUser(query.message.chat.id)
            .then((res) => {
              this.bot.sendMessage(
                query.message.chat.id,
                `All categories are removed successfully ✅`,
              );
            });
        }
      } else if (query.data == 'yes_deleteUser') {
        this.bot.deleteMessage(query.message.chat.id, query.message.message_id);
        this.bot.sendMessage(
          query.message.chat.id,
          'User Deleted. If you want to resume again, use /start command',
        );
      } else if (query.data == 'no_description') {
        this.bot.deleteMessage(query.message.chat.id, query.message.message_id);
        this.db
          .AddOrUpdateExpense(
            query.message.chat.id,
            '',
            this.curExpenseObject.curCategory,
            this.curExpenseObject.curAmount,
          )
          .then(() => {
            this.sendToastMessage(query.message, this.bot);
          });
      } else if (query.data == 'yes_description') {
        this.bot.deleteMessage(query.message.chat.id, query.message.message_id);
        this.waitingForUserDescription = true;
        this.bot.sendMessage(
          query.message.chat.id,
          'Enter the description for the expense',
        );
      } else if (query.data == 'yes_userTroubleWithDetail') {
        this.bot.deleteMessage(query.message.chat.id, query.message.message_id);
      } else if (query.data == 'no_userTroubleWithDetail') {
        this.bot.deleteMessage(query.message.chat.id, query.message.message_id);
      }
    });
    this.bot.on('text', (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;
      // Check if the message starts with a specific command
      if (text.startsWith('/add')) {
        // Extract the text after the command
        let listOfCategories = text.split(' ').slice(1);
        if (listOfCategories.length > 0) {
          listOfCategories = [...new Set(listOfCategories)];
          this.db.GetUserCategories(msg).then((res) => {
            res = res.map((element) => element.toLowerCase());
            listOfCategories = listOfCategories.filter((category) => {
              const temp = !res.includes(category.toLowerCase());
              return temp;
            });
            if (listOfCategories.length > 0) {
              this.db.AddCategoryForUser(msg, listOfCategories).then((res) => {
                this.bot.sendMessage(
                  msg.chat.id,
                  `New categories added successfully ✅`,
                );
              });
            } else {
              this.bot.sendMessage(
                msg.chat.id,
                `Given categories are already present.`,
              );
            }
          });
        } else {
          this.bot.sendMessage(
            msg.chat.id,
            `Invalid input. Please use /add <category name1> <category name2> format to add new categories. `,
          );
        }
      }
      if (
        this.waitingForUserDescription == true &&
        this.curExpenseObject.curAmount != 0 &&
        this.curExpenseObject.curCategory != ''
      ) {
        this.curExpenseObject.curDescription = text;
        this.waitingForUserDescription = false;
        this.db
          .AddOrUpdateExpense(
            chatId,
            text,
            this.curExpenseObject.curCategory,
            this.curExpenseObject.curAmount,
          )
          .then(() => {
            this.sendToastMessage(msg, this.bot);
          });
      }
    });
    this.bot.on('polling_error', (msg) => {
      console.log(msg);
    });
  }
}
