# Smart Expense Splitter

A full-stack expense splitting platform for groups of people to split expenses easily.

## Features

- **Expense Splitting**: Split expenses easily with a simple interface
- **Group Management**: Create and manage groups of people
- **Expense Management**: Add and manage expenses
- **Payment Management**: Pay expenses easily with a simple interface

## Tech Stack

- **Backend**: Node.js + Express.js + MongoDB + Mongoose
- **Frontend**: React.js + Tailwind CSS + Axios + React Router

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- RESTful API

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/scriptWithKishan/smart-expense-splitter.git
cd smart-expense-splitter
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install express mongoose cors dotenv


# Edit .env and add your MongoDB Atlas URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-expense-splitter?retryWrites=true&w=majority
# PORT=3000

# Start the development server
npm run dev
```

The backend server will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install 

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Auth
- `POST /api/users/register` - Create a new user account
- `POST /api/users/login` - Authenticate user
- `GET /api/users/me` - Get current user details

### Groups
- `POST /api/groups` - Create a new group
- `GET /api/groups` - List user's groups
- `POST /api/groups/join` - Join a group
- `GET /api/groups/:id` - Get group details
- `DELETE /api/groups/:id` - Delete a group (Creator only)

### Expenses
- `POST /api/expenses` - Add a new expense
- `GET /api/expenses/group/:groupId` - List expenses for a group
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/expenses/export/:groupId` - Export expenses as CSV

### Messages
- `POST /api/messages` - Send a message to the group chat
- `GET /api/messages/:groupId` - Get chat history


## Future Enhancements
- **AI Receipt Scanning**: Automatically scan and extract expense details from receipt images.
- **Payment Gateway Integration**: Allow users to settle debts directly within the app using UPI or Stripe.
- **Recurring Expenses**: Support for automated monthly bills like rent and subscriptions.
- **Multi-Currency Support**: Real-time currency conversion for international trips and expenses.

