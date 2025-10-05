# Users API Filtering Examples

## Basic Usage

### Get all users (with pagination)

```bash
GET /users
# Returns first 10 users, sorted by creation date (newest first)
```

### Custom pagination

```bash
GET /users?page=2&limit=5
# Returns page 2 with 5 users per page
```

## Filtering Examples

### Filter by gender

```bash
GET /users?gender=M          # Male users
GET /users?gender=F          # Female users
GET /users?gender=OTHER      # Other gender
```

### Filter by user level

```bash
GET /users?userLevel=5               # Exact level 5
GET /users?minUserLevel=3            # Level 3 and above
GET /users?maxUserLevel=8            # Level 8 and below
GET /users?minUserLevel=3&maxUserLevel=8  # Level between 3-8
```

### Search by username or email

```bash
GET /users?username=john             # Username contains "john"
GET /users?email=gmail               # Email contains "gmail"
GET /users?search=admin              # Username OR email contains "admin"
```

### Date range filters

```bash
# Users created in the last 7 days
GET /users?createdAfter=2025-09-28T00:00:00Z

# Users born in the 1990s
GET /users?bornAfter=1990-01-01T00:00:00Z&bornBefore=1999-12-31T23:59:59Z
```

## Sorting Examples

```bash
GET /users?sortBy=username&sortOrder=asc     # Sort by username A-Z
GET /users?sortBy=userLevel&sortOrder=desc   # Sort by level (highest first)
GET /users?sortBy=createdAt&sortOrder=asc    # Sort by creation (oldest first)
```

## Complex Combinations

```bash
# Female users with level 5+, sorted by username, page 2
GET /users?gender=F&minUserLevel=5&sortBy=username&sortOrder=asc&page=2&limit=10

# Users with "admin" in username/email, created this month
GET /users?search=admin&createdAfter=2025-10-01T00:00:00Z&sortBy=createdAt
```

## Response Format

### Paginated Response (when using filters/pagination)

```json
{
  "data": [
    {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "userLevel": 5,
      "gender": "M",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "createdAt": "2025-10-05T15:00:00.000Z",
      "updatedAt": "2025-10-05T15:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Simple Array Response (when no query parameters)

```json
[
  {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com"
    // ... other fields
  }
]
```

## Available Parameters

| Parameter       | Type   | Description                                                   | Example                               |
| --------------- | ------ | ------------------------------------------------------------- | ------------------------------------- |
| `username`      | string | Partial username match (case-insensitive)                     | `?username=john`                      |
| `email`         | string | Partial email match (case-insensitive)                        | `?email=gmail`                        |
| `gender`        | enum   | Exact gender match (M, F, OTHER)                              | `?gender=M`                           |
| `userLevel`     | number | Exact user level                                              | `?userLevel=5`                        |
| `minUserLevel`  | number | Minimum user level                                            | `?minUserLevel=3`                     |
| `maxUserLevel`  | number | Maximum user level                                            | `?maxUserLevel=8`                     |
| `search`        | string | Search in username and email                                  | `?search=admin`                       |
| `createdAfter`  | date   | Created after date                                            | `?createdAfter=2025-10-01T00:00:00Z`  |
| `createdBefore` | date   | Created before date                                           | `?createdBefore=2025-10-31T23:59:59Z` |
| `bornAfter`     | date   | Born after date                                               | `?bornAfter=1990-01-01T00:00:00Z`     |
| `bornBefore`    | date   | Born before date                                              | `?bornBefore=2000-12-31T23:59:59Z`    |
| `page`          | number | Page number (default: 1)                                      | `?page=2`                             |
| `limit`         | number | Results per page (default: 10, max: 100)                      | `?limit=25`                           |
| `sortBy`        | string | Sort field (username, email, userLevel, createdAt, updatedAt) | `?sortBy=username`                    |
| `sortOrder`     | string | Sort direction (asc, desc)                                    | `?sortOrder=asc`                      |
