
# ExpenseTracker

It's a Telegram bot for managing and analyzing your day-to-day expenses. Installing a new app for tracking expenses, or maintaining an expense diary is a challenge and this chatbot is an attempt to overcome them. 







## Screenshots
### Adding a New Expense - 
<img src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/add_new_expense.png" data-canonical-src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/add_new_expense.png" width="200" height="400" />    <img src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/expense_added_success.png" data-canonical-src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/expense_added_success.png" width="200" height="400" />  

### Get Expense Details - 
<img src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/choose_start_date.png" data-canonical-src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/choose_start_date.png" width="200" height="400" />    <img src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/choose_start_date.png" data-canonical-src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/choose_start_date.png" width="200" height="400" />    <img src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/get_details.png" data-canonical-src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/get_details.png" width="200" height="400" />

### Add a new expense Category - 
 <img src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/new_category_added.png" data-canonical-src="https://github.com/shubham-sonthalia/ExpenseTracker/blob/main/screenshots/new_category_added.png" width="250" height="300" />

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

## Removing dependency on NestJS opinionated architecture and using pure NodeJS logi  and the below code structure for modular code architecture. 

expense-bot/
├── src/
│   ├── bot/
│   │   ├── commands/                # Folder for command-specific files
│   │   │   ├── start.js             # /start command handler
│   │   │   ├── addExpense.js        # Command to add expenses
│   │   │   ├── splitExpense.js      # Command to split expenses
│   │   │   └── viewBalance.js       # Command to view balances
│   │   └── index.js                 # Initializes the bot, sets up commands
│   ├── controllers/                 # Core logic for expenses, calculations, etc.
│   │   ├── expenseController.js     # Handles expense-related logic
│   │   └── userController.js        # Handles user-related actions
│   ├── models/                      # Database models
│   │   ├── expense.js               # Expense model (defines schema)
│   │   └── user.js                  # User model (defines schema)
│   ├── services/                    # Services for calculations and data processing
│   │   └── paymentSimplification.js # Logic for payment simplification algorithms
│   ├── config/                      # Configuration files (e.g., for env variables)
│   │   └── dbConfig.js              # Database connection config
│   ├── utils/                       # Utility functions
│   │   └── helpers.js               # Helper functions like currency formatting
│   ├── index.js                     # Main entry point, initializes bot and server
├── .env                             # Environment variables (e.g., TOKEN, DB URI)
├── package.json
└── README.md

