
# ExpenseTracker

It's a Telegram bot for managing and analyzing your day-to-day expenses. Installing a new app for tracking expenses, or maintaining an expense diary is a challenge and this chatbot is an attempt to overcome them. 







## Screenshots




## Features

- Categorise your expenses
- Add a new category as per convenience
- Get expenses in the entered date range
- Add a description to each expense for faster recall


## Run Locally

Clone the project

```bash
  git clone   git clone https://github.com/shubham-sonthalia/ExpenseTracker.git
```

Go to the project directory

```bash
  cd ExpenseTracker
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`URI` - MongoDB connection string

`TELEGRAM_BOT_TOKEN` - Bot Token to be generated using BotFather

`DATABASE` - Name of the MongoDB database 

`COLLECTION` - Name of the MongoDB collection


## Roadmap

- A Splitwise like expense-tracker and debt-caculator chatbot.

- Improved User Experience


## Tech Stack

**Server:** NestJS, MongoClient

**Database:** MongoDB

**Deployment:** AWS EC2


