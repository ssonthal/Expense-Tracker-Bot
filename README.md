
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

<img width="571" alt="Screenshot 2024-10-27 at 7 05 45 PM" src="https://github.com/user-attachments/assets/45fdf326-e26c-4881-99a5-497cebe52dd7">


