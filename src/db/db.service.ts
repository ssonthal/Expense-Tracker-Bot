import { Injectable } from '@nestjs/common';
import { AnyAaaaRecord } from 'dns';
import {
  Collection,
  Db,
  FindCursor,
  InsertOneResult,
  MongoClient,
  UpdateResult,
  WithId,
} from 'mongodb';
import { message } from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

@Injectable()
export class DatabaseService {
  private readonly client: MongoClient;
  private database: Db;
  private collection: Collection;
  constructor() {
    dotenv.config();
    this.client = new MongoClient(process.env.URI);
    this.database = this.client.db(process.env.DATABASE);
    this.collection = this.database.collection(process.env.COLLECTION);
  }
  private _convertToGMT(date): Date {
    const offset = date.getTimezoneOffset();
    const gmtDate = new Date(date.getTime() + offset * 60 * 1000);
    return gmtDate;
  }
  private async _connectDatabase(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.log('Error in connecting to DB', error);
    }
  }
  private async _disconnectDatabase(): Promise<void> {
    try {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.log('Error in disconnecting DB', error);
    }
  }
  private async _addExpenseObject(
    id: Number,
    expenseObject: Object,
  ): Promise<UpdateResult> {
    try {
      const filter = { userId: id };
      const updateQuery = {
        $push: {
          expenses: expenseObject,
        },
      };
      const result = await this.collection.updateOne(filter, updateQuery);
      console.log(`Added expense with userId ${id}`);
      return result;
    } catch (error) {
      console.log(
        `Error in adding expense for userId ${id} and expense object ${expenseObject}`,
        error,
      );
    }
  }
  private async _updateTotalExpense(
    id: Number,
    num: Number,
  ): Promise<UpdateResult> {
    try {
      const filter = { userId: id };
      const updateQuery = {
        $inc: {
          ['totalExpenses']: num,
        },
      };
      const result = await this.collection.updateOne(filter, updateQuery);
      console.log(`Updated totalExpense for userId ${id}`);
      return result;
    } catch (error) {
      console.log(
        `Error in adding expense value to totalExpense for user with id ${id}`,
        error,
      );
    }
  }
  private async _updateExpenseObject(
    id: Number,
    categoryCode: string,
    amount: Number,
  ): Promise<UpdateResult> {
    try {
      const filter = {
        $and: [{ userId: id }, { 'expenses.category.code': categoryCode }],
      };
      const updateQuery = {
        $inc: { 'expenses.$.amount': amount },
      };
      const result = await this.collection.updateOne(filter, updateQuery);
      console.log(`Updated expense object for userId ${id} and category`);
      return result;
    } catch (error) {
      console.log(
        `Error in adding expense value to totalExpense for user with id ${id}`,
        error,
      );
    }
  }
  public async AddUser(msg: message) {
    try {
      await this._connectDatabase();
      var result = await this.collection.insertOne({
        userId: msg.from.id,
        firstName: msg.from.first_name,
        totalExpenses: 0.0,
        expenses: [],
        categories: [],
      });
      console.log(`Success: AddUser for userId ${msg.from.id}`);
      return result;
    } catch (error) {
      console.log('error in adding user', error);
    }
  }
  public async CheckIfUserExists(id: Number) {
    try {
      await this._connectDatabase();
      let filter = { userId: id };
      let document = await this.collection.find(filter).toArray();
      return document;
    } catch (error) {
      console.log(`Error in getting UserExpense document for id ${id}`, error);
    }
  }
  public async RemoveUser(id: Number) {
    try {
      await this._connectDatabase();
      const filter = { userId: id };
      const result = await this.collection.deleteOne(filter);
      console.log(`Deleted userExpense with userId ${id}`);
    } catch (error) {
      console.log(`Error in deleting userExpense with userId ${id}`, error);
    }
  }
  public async AddOrUpdateExpense(
    id: Number,
    description: string,
    name: string,
    amount: number,
  ) {
    try {
      await this._connectDatabase();
      let addOrUpdateExpenseObject = {};
      let updateTotalExpenseRes = {};
      const expenseObject = {
        category: { name: name },
        description: description,
        amount: amount,
        createdOn: this._convertToGMT(new Date()),
      };
      addOrUpdateExpenseObject = await this._addExpenseObject(
        id,
        expenseObject,
      );
      updateTotalExpenseRes = await this._updateTotalExpense(id, amount);
      if (
        addOrUpdateExpenseObject['modifiedCount'] > 0 &&
        updateTotalExpenseRes['modifiedCount'] > 0
      ) {
        return true;
      }
      return false;
    } catch (error) {
      console.log('error in adding expense object', error);
    }
  }
  public async GetExpensesByCategory(id: Number) {
    try {
      await this._connectDatabase();
      const pipeline = [
        { $match: { userId: id } },
        { $unwind: '$expenses' },
        {
          $group: {
            _id: '$expenses.category.name',
            total: { $sum: '$expenses.amount' },
          },
        },
      ];
      const aggregateResult = await this.collection
        .aggregate(pipeline)
        .toArray();
      console.log('Success: GetExpensesByCategory');
      return aggregateResult;
    } catch (error) {
      console.log(
        `error in getting expenses by category for user with id ${id}`,
        error,
      );
    }
  }
  public async GetExpensesWithinDateRange(
    id: Number,
    startTime: Date,
    endTime: Date,
  ) {
    try {
      await this._connectDatabase();
      startTime = new Date(startTime);
      endTime = new Date(endTime);
      const pipeline = [
        {
          $match: {
            userId: id,
          },
        },
        {
          $project: {
            expenses: {
              $filter: {
                input: '$expenses',
                as: 'expense',
                cond: {
                  $and: [
                    {
                      $gte: [
                        '$$expense.createdOn',
                        this._convertToGMT(startTime),
                      ],
                    },
                    {
                      $lt: ['$$expense.createdOn', this._convertToGMT(endTime)],
                    },
                  ],
                },
              },
            },
          },
        },
        { $unwind: '$expenses' },
        {
          $group: {
            _id: '$expenses.category.name',
            total: { $sum: '$expenses.amount' },
          },
        },
      ];
      const aggregateResult = await this.collection
        .aggregate(pipeline)
        .toArray();
      console.log(aggregateResult);
      console.log('Success: GetExpensesByCategory');
      return aggregateResult;
    } catch (error) {
      console.log(
        `error in getting expenses by category for user with id ${id}`,
        error,
      );
    }
  }
  public async GetDescriptiveExpensesWithinDateRange(
    id: Number,
    startTime: Date,
    endTime: Date,
  ) {
    try {
      await this._connectDatabase();
      startTime = new Date(startTime);
      endTime = new Date(endTime);
      const pipeline = [
        {
          $match: {
            userId: id,
          },
        },
        {
          $project: {
            expenses: {
              $filter: {
                input: '$expenses',
                as: 'expense',
                cond: {
                  $and: [
                    {
                      $gte: [
                        '$$expense.createdOn',
                        this._convertToGMT(startTime),
                      ],
                    },
                    {
                      $lt: ['$$expense.createdOn', this._convertToGMT(endTime)],
                    },
                  ],
                },
              },
            },
          },
        },
      ];
      const aggregateResult = await this.collection
        .aggregate(pipeline)
        .toArray();
      console.log(aggregateResult);
      console.log('Success: GetExpensesByCategory');
      return aggregateResult;
    } catch (error) {
      console.log(
        `error in getting expenses by category for user with id ${id}`,
        error,
      );
    }
  }
  public async SetDefaultCategoriesForUser(msg: message) {
    try {
      await this._connectDatabase();
      var result = await this.collection.updateOne(
        { userId: msg.from.id }, // Specify the filter for the document
        {
          $set: {
            categories: [
              'Investment',
              'Rent',
              'Entertainment',
              'Food',
              'Education',
            ],
          },
        },
      );
      console.log(`Success: SetDefaultCategoriesForUser ${msg.from.id}`);
      return result;
    } catch (error) {
      console.log('error in setting default categories for user', error);
    }
  }
  public async GetUserCategories(msg: message) {
    try {
      await this._connectDatabase();
      const matchQuery = { userId: msg.from.id };
      var result = await this.collection.find(matchQuery).toArray();
      console.log(`Success: GetUserCategories ${msg.from.id}`);
      return result[0].categories;
    } catch (error) {
      console.log('error in getting user categories', error);
    }
  }
  public async AddCategoryForUser(msg: message, categories: []) {
    try {
      await this._connectDatabase();
      const matchQuery = { userId: msg.from.id };
      const updateQuery = {
        $push: {
          categories: {
            $each: categories,
          },
        },
      };
      let res = await this.collection.updateOne(matchQuery, updateQuery);
      console.log(`Success: AddCategoryForUser ${msg.from.id}`);
      return res;
    } catch (error) {
      console.log('error in adding user categories', error);
    }
  }
  public async FlushAllCategoriesForUser(userId: Number) {
    try {
      await this._connectDatabase();
      const matchQuery = { userId: userId };
      const updateQuery = { $set: { categories: [] } };
      var res = await this.collection.updateOne(matchQuery, updateQuery);
      console.log(`Success: FlushAllCategoriesForUser ${userId}`);
      return res;
    } catch (error) {
      console.log('error in flushing user categories', error);
    }
  }
}
