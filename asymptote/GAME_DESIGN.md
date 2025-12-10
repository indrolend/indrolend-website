# Simplified Asymptote Engine - Risk/Catan Style

## Core Concept
A simple turn-based territory control game inspired by Risk and Catan.

## Game Flow
1. **Setup**: Choose 3 starting resources (keeps existing intro)
2. **Main Game**: Hex-based map with territories
3. **Turn Structure**:
   - Gather resources from controlled territories
   - Build structures or armies
   - Expand to adjacent territories
   - Pass turn

## Map
- Hexagonal grid (7x7 = 49 hexes)
- Each hex has:
  - Resource type (Wood, Stone, Food, Metal)
  - Owner (player, neutral, or enemy)
  - Building level (0-3)

## Player Actions per Turn
1. **Gather** - Collect resources from owned territories
2. **Build** - Upgrade a hex (costs resources, increases production)
3. **Expand** - Claim an adjacent neutral hex (costs resources)
4. **Attack** - Take an enemy hex (simple dice roll, costs army)
5. **End Turn** - Pass to enemy AI

## Resources
- Wood: Build basic structures
- Stone: Build advanced structures  
- Food: Feed population, recruit armies
- Metal: Build armies, weapons

## Win Condition
- Control 60% of the map
- OR: Reach 100 population
- OR: Survive 50 turns

## Simplifications
- No complex sliders (just resource management)
- No metaphysical stats (just practical: resources, buildings, armies)
- Turn-based (no real-time chaos)
- Clear goals and progress indicators
