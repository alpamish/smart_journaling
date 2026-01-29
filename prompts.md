Role

You are a Principal Full-Stack Engineer, FinTech Architect, and UX-focused Product Designer with deep experience building trading platforms, portfolio management systems, and risk-aware financial software.

You design systems for serious traders, where correct math, capital safety, and clarity matter more than visual polish or marketing features.

Objective

Design and build a Professional Trading Journal, Portfolio, and Strategy Management Application that enables traders to:

Track balances, equity, profits, and drawdowns across multiple accounts

Journal manual trades, grid strategies, and spot holdings

Monitor open positions and long-term portfolios in real time

Analyze performance with deep, strategy-level statistics

The application must be:

Accurate, deterministic, and fast

Minimal and trader-centric

Scalable and modular

Suitable for retail traders, swing traders, and prop-firm professionals

Core Design Principles

Trading accuracy > visual complexity

Math correctness is non-negotiable

Fast, low-friction trade logging

Hard separation between:

Spot (capital-based)

Futures / leveraged trading (margin-based)

Optional automation, Optional signals, Optional AI (leave out if not needed or for future expansion)

No gamification or emotional UI manipulation

Global Trading Model Rules
Spot (Capital-Based)

No leverage

No liquidation

Loss limited to invested capital

Used by:

Spot holdings

Spot grid strategies

Futures / Margin (Leveraged)

Explicit leverage configuration required

Margin-based P&L

Liquidation risk must be tracked and visualized

Used by:

Manual futures trades

Futures grid strategies

Leverage must never be implied — it must always be explicitly configured.

Core Features
1. Authentication & Security

Secure email/password authentication

Per-user data isolation

Encrypted sensitive fields

JWT-based sessions

Role-ready architecture (user / admin)

Audit logs for all financial state changes

2. Multi-Account Management

Support multiple accounts:

Personal

Prop firm

Demo

Per account tracking:

Starting balance

Current balance

Equity

Realized & unrealized P&L

Margin used (futures only)

Free margin (futures only)

Max drawdown

Daily / weekly / monthly performance

Automatic balance and equity updates from all positions.

3. Manual Trade Journal (Spot & Futures)
Trade Type (Required)

Spot trade

Futures trade

Common Fields

Symbol / market

Long / short

Entry price

Stop loss

Take profit

Position size

Open / close timestamps

Status (open / closed)

Net P&L ($ and %)

R-multiple

Futures-Only Fields

Leverage

Margin used

Margin mode (isolated / cross)

Estimated liquidation price

Maintenance margin

Funding fees (optional)

All futures P&L must correctly account for leverage and fees.

Journaling

Setup & thesis

Execution notes

Post-trade review

Screenshot uploads (charts, executions)

4. Grid Trading Module (Spot vs Futures)

Grid strategies are first-class entities, not grouped trades.

Grid Type (Required)
Spot Grid

No leverage

Capital-limited

No liquidation risk

Futures Grid

Leverage-enabled

Margin-based

Liquidation-aware

Common Grid Configuration

Symbol

Upper & lower price range

Grid count / spacing

Allocated capital

Direction:

Neutral

Long grid

Short grid

Futures Grid – Additional Configuration

Leverage

Margin mode (isolated / cross)

Maintenance margin rate

Estimated liquidation price

Grid Tracking

Active grid orders

Filled grid trades

Realized P&L

Floating P&L

Fees

Margin usage % (futures only)

Spot and futures grid analytics must remain strictly separate.

5. Spot Holdings & Portfolio Tracking

Spot holdings are non-leveraged, long-term assets only.

Per asset:

Asset name & symbol

Quantity

Average entry price

Current value

Unrealized P&L

Support:

Multiple spot portfolios per account

Partial buys and sells

Long-term holding notes

Portfolio analytics:

Allocation percentages

Performance over time

6. Open Positions Monitoring

Unified view across:

Manual trades

Grid strategies

Spot holdings

Display:

Realized & unrealized P&L

Capital allocation

Margin usage (futures only)

Liquidation distance (futures only)

Controls:

Manual close

Edit metadata (never historical prices)

7. Performance Analytics (Leverage-Aware)

Global and per-strategy metrics:

Win rate

Expectancy

Average win vs loss

Risk-to-reward distribution

Equity curve

Drawdown curve

Leverage-specific metrics:

Return on margin (ROM)

Max leverage used

Closest liquidation distance reached

Drawdown adjusted for leverage

Fee impact on net performance

Breakdowns by:

Strategy type (spot / futures)

Symbol

Time of day

Day of week

8. Daily Journal & Trading Psychology

Daily journaling:

Pre-market plan

Post-market review

Psychology tracking:

Confidence

Fear

FOMO

Overtrading

Discipline

Features:

Tag system

Link emotions and notes to trades and grids

Liquidation Math (Futures)
Notation

EP = Entry price

P = Current price

Q = Position size

L = Leverage

IM = Initial margin = (EP × Q) / L

MMR = Maintenance margin rate

MM = Maintenance margin = EP × Q × MMR

Unrealized P&L

Long

UPnL = (P − EP) × Q


Short

UPnL = (EP − P) × Q

Equity
Equity = IM + UPnL

Liquidation Condition
Equity ≤ MM

Estimated Liquidation Price (Isolated Margin)

Long

LiqPrice = EP × (1 − (1 / L) + MMR)


Short

LiqPrice = EP × (1 + (1 / L) − MMR)


Liquidation prices are approximations and exchange-dependent.

Liquidation Distance (%)
LiqDistance% = |P − LiqPrice| / P × 100


Used strictly for risk visualization.

Dashboard

At-a-glance overview:

Total balance & equity

Open trades, grids, and spot holdings

Today’s realized & unrealized P&L

Margin usage (futures)

Portfolio allocation

Recent activity

UI:

Dark mode by default

Clean, data-dense, trader-centric

Risk elements always visible but non-alarming

Technical Architecture
Frontend

Next.js (App Router)

Tailwind CSS

Desktop-first responsive design

Charts: Recharts / Chart.js

Server Components where possible for performance

Backend

Vercel Serverless Functions

REST API with versioning

Clear service separation:

Spot trading

Futures trading

Grid strategies

Journals

Database

PostgreSQL (hosted: Neon / Supabase / RDS-compatible)

Prisma ORM

Core tables:

Users

Accounts

Trades

GridStrategies

GridOrders

SpotHoldings

JournalEntries

Attachments

Deployment (Vercel)

Build & deploy using Vercel

Environment-based configuration:

Development

Preview

Production

Secure environment variables

Automatic CI/CD on Git push

Edge caching for read-heavy endpoints

Serverless cron (optional) for daily stats aggregation

Deliverables

ERD & database schema

API endpoint specification

Frontend component structure

Reusable UI components

Sample seed data

Clean, documented code

Explanation of architectural decisions

Constraints

Assume the end user is a trader, not a developer

Prioritize clarity, correctness, and speed

Optional AI, optional automation, optional signals

Avoid unnecessary abstraction or over-engineering