import { rpgState, addToBattleLog } from './rpgState.js';

// Thinking-based moves (science-heavy civilization)
export const thinkingMoves = [
  {
    name: 'Predict Next Move',
    description: 'Use analytical thinking to predict and counter',
    cost: 20,
    execute: (player, enemy) => {
      const damage = Math.floor(player.thinking * 0.8);
      enemy.currentHP -= damage;
      player.buffs.evasion = 2; // lasts 2 turns
      addToBattleLog(`You predict the pattern! Deal ${damage} damage and gain evasion.`);
    }
  },
  {
    name: 'Evade Sequence',
    description: 'Calculate optimal dodge pattern',
    cost: 15,
    execute: (player, enemy) => {
      player.buffs.evasion = 3;
      const heal = Math.floor(player.thinking * 0.3);
      player.currentHP = Math.min(player.currentHP + heal, player.maxHP);
      addToBattleLog(`You calculate the perfect dodge and recover ${heal} HP.`);
    }
  },
  {
    name: 'Exploit Pattern',
    description: 'Find weakness through analysis',
    cost: 25,
    execute: (player, enemy) => {
      const damage = Math.floor(player.thinking * 1.2);
      enemy.currentHP -= damage;
      addToBattleLog(`You exploit a critical weakness! Deal ${damage} damage.`);
    }
  }
];

// Expression-based moves (art-heavy civilization)
export const expressionMoves = [
  {
    name: 'Inspire',
    description: 'Rally your spirit through art',
    cost: 15,
    execute: (player, enemy) => {
      const heal = Math.floor(player.expression * 0.6);
      player.currentHP = Math.min(player.currentHP + heal, player.maxHP);
      player.buffs.inspired = 2;
      addToBattleLog(`Your spirit soars! Heal ${heal} HP and gain power.`);
    }
  },
  {
    name: 'Confuse Imagery',
    description: 'Disorient with symbolic attacks',
    cost: 20,
    execute: (player, enemy) => {
      const damage = Math.floor(player.expression * 0.7);
      enemy.currentHP -= damage;
      enemy.confused = 2;
      addToBattleLog(`Confusing visions assault the enemy! Deal ${damage} damage.`);
    }
  },
  {
    name: 'Echo of Ages',
    description: 'Channel cultural power',
    cost: 30,
    execute: (player, enemy) => {
      const damage = Math.floor(player.expression * 1.5);
      enemy.currentHP -= damage;
      addToBattleLog(`The weight of culture crashes down! Deal ${damage} damage.`);
    }
  }
];

// Faith-based moves (faith-heavy civilization)
export const faithMoves = [
  {
    name: 'Unshakable Resolve',
    description: 'Stand firm through conviction',
    cost: 10,
    execute: (player, enemy) => {
      player.buffs.shield = Math.floor(player.conviction * 0.5);
      addToBattleLog(`Your faith shields you! Gain ${player.buffs.shield} shield points.`);
    }
  },
  {
    name: 'Blessing',
    description: 'Restore through faith',
    cost: 20,
    execute: (player, enemy) => {
      const heal = Math.floor(player.conviction * 0.8);
      player.currentHP = Math.min(player.currentHP + heal, player.maxHP);
      addToBattleLog(`Divine grace flows through you! Heal ${heal} HP.`);
    }
  },
  {
    name: 'Judgment',
    description: 'Strike with righteous power',
    cost: 25,
    execute: (player, enemy) => {
      const damage = Math.floor(player.conviction * 1.1);
      enemy.currentHP -= damage;
      addToBattleLog(`Judgment falls upon the wicked! Deal ${damage} damage.`);
    }
  }
];

export function getAvailableMoves() {
  const allMoves = [...thinkingMoves, ...expressionMoves, ...faithMoves];
  
  // Filter based on which stat is highest
  const { thinking, expression, conviction } = rpgState.player;
  const maxStat = Math.max(thinking, expression, conviction);
  
  let primaryMoves = [];
  if (maxStat === thinking) {
    primaryMoves = thinkingMoves;
  } else if (maxStat === expression) {
    primaryMoves = expressionMoves;
  } else {
    primaryMoves = faithMoves;
  }
  
  // Return primary moves plus one random from others
  const otherMoves = allMoves.filter(m => !primaryMoves.includes(m));
  const bonusMove = otherMoves[Math.floor(Math.random() * otherMoves.length)];
  
  return [...primaryMoves.slice(0, 3), bonusMove].filter(Boolean);
}
