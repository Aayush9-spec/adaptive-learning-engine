# SaaS Subscription Model

## Core Monetization

The product monetizes AI-driven cognitive optimization, not static content access.

## Tiers

### Free
- Basic recommendation engine
- Limited AI help
- Limited question generation
- Basic performance score
- AI call cap: **5/day**

### Pro
- Unlimited recommendations
- Advanced question generation
- Weakness classifier
- Trend prediction
- AI strategy planner
- Diagram engine
- AI call cap: **50/day**

### Elite
- All Pro features
- Deep learning memory analysis
- Priority AI workflows
- AI call cap: **200/day** (configurable)

## Technical Enforcement

`Users.subscription_tier` controls:
- per-user Bedrock daily limits via `UserUsage`
- route-level feature access guards

Current default mapping:
- `free` -> 5 calls/day
- `pro` -> 50 calls/day
- `elite` -> 200 calls/day

## Upgrade Trigger

When AI limits are reached, API returns:
- HTTP `429`
- message: `Upgrade plan to continue`

When premium feature is blocked, API returns:
- HTTP `403`
- tier-specific upgrade guidance

## Payment Integration Hook (MVP)

1. Payment success webhook (Razorpay/Stripe)
2. Update `Users.subscription_tier`
3. New limits and access apply immediately on next request
