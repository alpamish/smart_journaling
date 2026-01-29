/*
  Warnings:

  - You are about to drop the column `closeTime` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `Trade` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GridStrategy" ADD COLUMN "closeNote" TEXT;
ALTER TABLE "GridStrategy" ADD COLUMN "entryPrice" REAL;
ALTER TABLE "GridStrategy" ADD COLUMN "exitPrice" REAL;
ALTER TABLE "GridStrategy" ADD COLUMN "gridProfit" REAL;
ALTER TABLE "GridStrategy" ADD COLUMN "investmentAfterLeverage" REAL;
ALTER TABLE "GridStrategy" ADD COLUMN "maintenanceMargin" REAL;
ALTER TABLE "GridStrategy" ADD COLUMN "totalProfit" REAL;

-- CreateTable
CREATE TABLE "TradeCondition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpotHolding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "avgEntryPrice" REAL NOT NULL,
    "targetPrice" REAL,
    "exitPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'HODLING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SpotHolding_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SpotHolding" ("accountId", "assetSymbol", "avgEntryPrice", "createdAt", "id", "notes", "quantity", "updatedAt") SELECT "accountId", "assetSymbol", "avgEntryPrice", "createdAt", "id", "notes", "quantity", "updatedAt" FROM "SpotHolding";
DROP TABLE "SpotHolding";
ALTER TABLE "new_SpotHolding" RENAME TO "SpotHolding";
CREATE TABLE "new_Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "segment" TEXT,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "marginMode" TEXT,
    "tradeType" TEXT,
    "session" TEXT,
    "analysisTimeframe" TEXT,
    "entryTimeframe" TEXT,
    "entryPrice" REAL NOT NULL,
    "entryDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryCondition" TEXT,
    "stopLoss" REAL,
    "takeProfit" REAL,
    "quantity" REAL NOT NULL,
    "leverage" REAL,
    "marginUsed" REAL,
    "exitPrice" REAL,
    "exitDate" DATETIME,
    "exitQuantity" REAL,
    "exitCondition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "netPnL" REAL,
    "netPnLPercent" REAL,
    "rMultiple" REAL,
    "liquidationPrice" REAL,
    "maintenanceMargin" REAL,
    "fundingFees" REAL DEFAULT 0,
    "remarks" TEXT,
    "setup" TEXT,
    "thesis" TEXT,
    "executionNotes" TEXT,
    "postTradeReview" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "Trade_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Trade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Trade" ("accountId", "createdAt", "entryPrice", "executionNotes", "exitPrice", "fundingFees", "id", "leverage", "liquidationPrice", "maintenanceMargin", "marginMode", "marginUsed", "netPnL", "netPnLPercent", "postTradeReview", "quantity", "rMultiple", "setup", "side", "status", "stopLoss", "symbol", "takeProfit", "thesis", "type", "updatedAt") SELECT "accountId", "createdAt", "entryPrice", "executionNotes", "exitPrice", "fundingFees", "id", "leverage", "liquidationPrice", "maintenanceMargin", "marginMode", "marginUsed", "netPnL", "netPnLPercent", "postTradeReview", "quantity", "rMultiple", "setup", "side", "status", "stopLoss", "symbol", "takeProfit", "thesis", "type", "updatedAt" FROM "Trade";
DROP TABLE "Trade";
ALTER TABLE "new_Trade" RENAME TO "Trade";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TradeCondition_name_type_key" ON "TradeCondition"("name", "type");
