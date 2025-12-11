import { state } from '../state.js';
import { params } from '../config.js';

export const rpgState = {
  player: {
    name: 'Hero',
    thinking: 0,
    expression: 0,
    conviction: 0,
    maxHP: 100,
    currentHP: 100,
    buffs: {}
  },
  enemy: {
    name: 'Shadow',
    maxHP: 120,
    currentHP: 120,
    attack: 15,
    defense: 10
  },
  turn: 'player',
  battleActive: false,
  battleLog: []
};

export function initRPGFromCivState() {
  // Derive character stats from civilization state
  rpgState.player.thinking = state.K * params.rpgStatScale;
  rpgState.player.expression = state.X * params.rpgStatScale;
  rpgState.player.conviction = state.F * params.rpgStatScale;
  
  // Calculate max HP
  rpgState.player.maxHP = params.rpgBaseHP + Math.floor(state.H * params.rpgHPMultiplier);
  rpgState.player.currentHP = rpgState.player.maxHP;
  
  // Reset enemy
  rpgState.enemy.currentHP = rpgState.enemy.maxHP;
  
  // Clear buffs and log
  rpgState.player.buffs = {};
  rpgState.battleLog = [];
  rpgState.turn = 'player';
  rpgState.battleActive = true;
  
  addToBattleLog('Battle begins!');
}

export function addToBattleLog(message) {
  rpgState.battleLog.push(message);
  if (rpgState.battleLog.length > 10) {
    rpgState.battleLog.shift();
  }
}

export function checkBattleEnd() {
  if (rpgState.player.currentHP <= 0) {
    rpgState.battleActive = false;
    addToBattleLog('You have been defeated...');
    return 'defeat';
  }
  if (rpgState.enemy.currentHP <= 0) {
    rpgState.battleActive = false;
    addToBattleLog('Victory! The shadow dissipates.');
    return 'victory';
  }
  return null;
}
