# Transaction API Documentation

## Overview

The Transaction API provides full CRUD (Create, Read, Update, Delete) operations for managing financial transactions. It supports both SPEND and INCOME transactions with comprehensive filtering, searching, and pagination capabilities.

## Endpoints

### Base URL: `/transactions`

---

## 1. Create Transaction

**POST** `/transactions`

Creates a new financial transaction.

### Request Body

```json
{
  "type": "SPEND" | "INCOME",
  "amount": 150.75,
  "currency": "USD",
  "transactionDate": "2024-01-15T10:30:00Z",
  "description": "Grocery shopping",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "categoryIds": ["category-uuid-1", "category-uuid-2"] // Optional
}
```

### Validation Rules

- `type`: Required. Must be either "SPEND" or "INCOME"
- `amount`: Required. Must be a positive number with max 2 decimal places
- `currency`: Required. Must be exactly 3 characters (e.g., "USD", "EUR")
- `transactionDate`: Required. Must be a valid ISO date string
- `description`: Optional. String field for transaction notes
- `userId`: Required. Must be a valid UUID of an existing user
- `categoryIds`: Optional. Array of category UUIDs

### Response

```json
{
  "id": "transaction-uuid",
  "type": "SPEND",
  "amount": 150.75,
  "currency": "USD",
  "transactionDate": "2024-01-15T10:30:00Z",
  "description": "Grocery shopping",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": "user-uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "categories": [
    {
      "id": "category-uuid",
      "name": "Food & Dining"
    }
  ]
}
```

---

## 2. Get All Transactions

**GET** `/transactions`

Retrieves transactions with optional filtering, pagination, and sorting.

### Query Parameters

#### Filtering

- `type`: Filter by transaction type ("SPEND" or "INCOME")
- `currency`: Filter by currency code (e.g., "USD")
- `minAmount`: Filter transactions with amount >= this value
- `maxAmount`: Filter transactions with amount <= this value
- `description`: Filter by description (partial match, case-insensitive)
- `userId`: Filter transactions by user ID
- `categoryIds`: Filter by category IDs (comma-separated UUIDs)
- `search`: Search in transaction descriptions (case-insensitive)

#### Date Filtering

- `transactionDateAfter`: Filter transactions after this date (ISO string)
- `transactionDateBefore`: Filter transactions before this date (ISO string)
- `createdAfter`: Filter by creation date after this date (ISO string)
- `createdBefore`: Filter by creation date before this date (ISO string)

#### Pagination

- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)

#### Sorting

- `sortBy`: Sort field ("type", "amount", "currency", "transactionDate", "createdAt", "updatedAt")
- `sortOrder`: Sort direction ("asc" or "desc", default: "desc")

### Example Requests

```bash
# Get all transactions
GET /transactions

# Get SPEND transactions only
GET /transactions?type=SPEND

# Get transactions with pagination
GET /transactions?page=2&limit=20

# Get transactions above $100, sorted by amount (highest first)
GET /transactions?minAmount=100&sortBy=amount&sortOrder=desc

# Search for coffee transactions
GET /transactions?search=coffee

# Get transactions from January 2024
GET /transactions?transactionDateAfter=2024-01-01&transactionDateBefore=2024-01-31

# Get transactions for specific user
GET /transactions?userId=user-uuid-here
```

### Response (Paginated)

```json
{
  "data": [
    {
      "id": "transaction-uuid",
      "type": "SPEND",
      "amount": 150.75,
      "currency": "USD",
      "transactionDate": "2024-01-15T10:30:00Z",
      "description": "Grocery shopping",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "user": { ... },
      "categories": [ ... ]
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

---

## 3. Get Transaction by ID

**GET** `/transactions/:id`

Retrieves a specific transaction by its UUID.

### Parameters

- `id`: Transaction UUID

### Response

```json
{
  "id": "transaction-uuid",
  "type": "SPEND",
  "amount": 150.75,
  "currency": "USD",
  "transactionDate": "2024-01-15T10:30:00Z",
  "description": "Grocery shopping",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": "user-uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "categories": [
    {
      "id": "category-uuid",
      "name": "Food & Dining"
    }
  ]
}
```

---

## 4. Update Transaction

**PATCH** `/transactions/:id`

Updates an existing transaction. All fields are optional.

### Parameters

- `id`: Transaction UUID

### Request Body

```json
{
  "type": "INCOME",
  "amount": 200.0,
  "currency": "EUR",
  "transactionDate": "2024-01-16T10:30:00Z",
  "description": "Updated description",
  "userId": "new-user-uuid",
  "categoryIds": ["new-category-uuid"]
}
```

### Response

Returns the updated transaction object (same format as GET).

---

## 5. Delete Transaction

**DELETE** `/transactions/:id`

Soft deletes a transaction (marks as deleted but keeps in database).

### Parameters

- `id`: Transaction UUID

### Response

- Status: `204 No Content`
- Body: Empty

---

## Error Responses

### Common Error Codes

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "type must be one of the following values: SPEND, INCOME",
    "amount must be a positive number",
    "currency must be exactly 3 characters"
  ],
  "error": "Bad Request"
}
```

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Transaction not found",
  "error": "Not Found"
}
```

#### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "User not found",
  "error": "Conflict"
}
```

---

## Testing Scripts

### Run Complete API Tests

```bash
# Make sure your server is running on http://localhost:3000
./test-transactions-api.sh
```

### Setup Sample Data

```bash
# Creates sample transactions for testing
./setup-sample-transactions.sh
```

---

## Data Models

### Transaction Model

```typescript
interface Transaction {
  id: string; // UUID
  type: 'SPEND' | 'INCOME'; // Transaction type
  amount: number; // Decimal with 2 decimal places
  currency: string; // 3-character currency code
  transactionDate: Date; // When the transaction occurred
  description?: string; // Optional description
  createdAt: Date; // When record was created
  updatedAt: Date; // When record was last updated
  deletedAt?: Date; // Soft delete timestamp
  isDeleted: boolean; // Soft delete flag
}
```

### Relationships

- **User**: Many-to-many relationship through `UserTransaction` junction table
- **Category**: Many-to-many relationship through `TransactionCategory` junction table

---

## Example Usage Scenarios

### Personal Finance Tracking

```bash
# Create income transaction
POST /transactions
{
  "type": "INCOME",
  "amount": 3500.00,
  "currency": "USD",
  "transactionDate": "2024-01-01T00:00:00Z",
  "description": "Monthly salary",
  "userId": "user-uuid"
}

# Create expense transaction
POST /transactions
{
  "type": "SPEND",
  "amount": 85.50,
  "currency": "USD",
  "transactionDate": "2024-01-02T10:30:00Z",
  "description": "Grocery shopping",
  "userId": "user-uuid"
}

# Get monthly spending summary
GET /transactions?type=SPEND&transactionDateAfter=2024-01-01&transactionDateBefore=2024-01-31&sortBy=amount&sortOrder=desc
```

### Business Expense Tracking

```bash
# Track business expenses by category
GET /transactions?type=SPEND&categoryIds=business-travel-uuid,meals-uuid&sortBy=transactionDate

# Get quarterly financial report
GET /transactions?transactionDateAfter=2024-01-01&transactionDateBefore=2024-03-31&sortBy=type
```

---

## Performance Considerations

- **Pagination**: Always use pagination for large datasets (default limit: 10, max: 100)
- **Indexing**: Database indexes on `userId`, `type`, `transactionDate`, and `currency` for optimal query performance
- **Soft Deletes**: Deleted transactions are not physically removed, allowing for audit trails
- **Date Filtering**: Use specific date ranges to improve query performance on large datasets

---

## Security Notes

- All endpoints validate UUID formats for path parameters
- Input validation prevents SQL injection and data corruption
- Soft deletes maintain data integrity and audit trails
- User existence is verified before creating transactions
- Category existence is verified if category IDs are provided
