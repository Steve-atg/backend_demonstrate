-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SPEND', 'INCOME');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "userLevel" INTEGER NOT NULL DEFAULT 1,
    "email" VARCHAR(256) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(256),
    "gender" "Gender" NOT NULL DEFAULT 'OTHER',
    "dateOfBirth" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_transaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "transactionId" UUID NOT NULL,

    CONSTRAINT "user_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(256),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_category" (
    "id" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "transaction_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_transaction_userId_transactionId_key" ON "user_transaction"("userId", "transactionId");

-- AddForeignKey
ALTER TABLE "user_transaction" ADD CONSTRAINT "user_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_transaction" ADD CONSTRAINT "user_transaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_category" ADD CONSTRAINT "transaction_category_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_category" ADD CONSTRAINT "transaction_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
