# Asymptote Engine - Idle Clicker Game Design

## Core Concept
An idle/incremental clicker game where players click to generate "Understanding" points and purchase upgrades that automate and accelerate progress.

## Inspiration
- Cookie Clicker (upgrade purchasing, passive income)
- Spacebar Clicker (simple click mechanic)
- Universal Paperclips (philosophical theme, escalating complexity)

## Game Flow

### Phase 1: Manual Clicking (0-100 Understanding)
- Player clicks big central button to generate Understanding
- Each click = +1 Understanding
- First upgrade appears at 10 Understanding: "Contemplation" (+0.1 Understanding/sec)

### Phase 2: Basic Automation (100-1000 Understanding)
- More generators unlock:
  - Meditation (1 Understanding/sec, costs 50)
  - Study (5 Understanding/sec, costs 250)
  - Research (25 Understanding/sec, costs 1000)
- Click multiplier upgrades available

### Phase 3: Prestige System (1000+ Understanding)
- Unlock "Enlightenment" - reset progress for permanent bonuses
- Each Enlightenment gives +10% to all production
- New prestige-only upgrades unlock

### Phase 4: Meta Progression (10+ Enlightenments)
- Unlock "Dimensions" - new currency types
- Meaning Points (generated from Understanding)
- Complexity Points (unlock special abilities)
- Transcendence (ultimate prestige layer)

## UI Layout

```
┌─────────────────────────────────────┐
│      THE ASYMPTOTE ENGINE           │
│                                      │
│   Understanding: 1,234,567          │
│   Per Second: 12,345                │
│                                      │
│   ┌──────────────────────┐         │
│   │                      │         │
│   │   [CLICK FOR +1]     │         │  
│   │                      │         │
│   └──────────────────────┘         │
│                                      │
│   ┌─ Generators ─────────────┐    │
│   │ Contemplation  [BUY 1]    │    │
│   │ Cost: 10  Owned: 5        │    │
│   │ +0.5 Understanding/sec    │    │
│   │                           │    │
│   │ Meditation     [BUY 1]    │    │
│   │ Cost: 50  Owned: 2        │    │
│   │ +2 Understanding/sec      │    │
│   └───────────────────────────┘    │
│                                      │
│   ┌─ Upgrades ─────────────┐       │
│   │ Click Multiplier x2     │       │
│   │ Cost: 100               │       │
│   │ [PURCHASE]              │       │
│   └─────────────────────────┘      │
└─────────────────────────────────────┘
```

## Progression Tiers

### Tier 1: Generators (Understanding/sec)
1. Contemplation (0.1/sec, cost: 10)
2. Meditation (1/sec, cost: 50)
3. Study (5/sec, cost: 250)
4. Research (25/sec, cost: 1000)
5. Analysis (100/sec, cost: 5000)
6. Synthesis (500/sec, cost: 25000)
7. Revelation (2500/sec, cost: 100000)
8. Transcendence (10000/sec, cost: 500000)

### Tier 2: Multipliers
- Click Power (x2, x5, x10, x50, x100)
- Generator Efficiency (2x all production)
- Golden Clicks (random 777x multiplier)

### Tier 3: Prestige
- Enlightenment Points (reset for +10% forever)
- Meaning Conversion (Understanding → Meaning at 1000:1 ratio)
- Dimension Unlocks

## Numbers Balance
- Base click: 1 Understanding
- First generator unlocks at: 10 Understanding
- Cost scaling: 1.15x per purchase
- Production scaling: Linear with count
- Prestige requirement: 1000 Understanding
- Prestige bonus: 10% per Enlightenment

## Features
- Offline progress (up to 24 hours)
- Auto-save every 10 seconds
- Statistics tracking
- Achievements
- Export/import save
