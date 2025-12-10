import { rpgState, addToBattleLog, checkBattleEnd } from './rpgState.js';

export function executePlayerMove(move) {
  if (!rpgState.battleActive) return;
  if (rpgState.turn !== 'player') return;
  
  // Execute the move
  move.execute(rpgState.player, rpgState.enemy);
  
  // Check if battle ended
  const result = checkBattleEnd();
  if (result) return result;
  
  // Switch to enemy turn
  rpgState.turn = 'enemy';
  
  // Enemy acts after a delay
  setTimeout(() => {
    executeEnemyTurn();
  }, 1000);
  
  return null;
}

export function executeEnemyTurn() {
  if (!rpgState.battleActive) return;
  if (rpgState.turn !== 'player') {
    // Enemy's turn
    enemyAI();
    
    // Check if battle ended
    const result = checkBattleEnd();
    if (result) return result;
    
    // Update buffs and debuffs
    updateBuffs();
    
    // Switch back to player turn
    rpgState.turn = 'player';
  }
  
  return null;
}

function enemyAI() {
  const enemy = rpgState.enemy;
  const player = rpgState.player;
  
  // Simple AI: choose between attack patterns
  const roll = Math.random();
  
  if (enemy.confused && enemy.confused > 0) {
    // Confused: reduced damage
    const damage = Math.floor(enemy.attack * 0.5);
    dealDamageToPlayer(damage);
    addToBattleLog(`The enemy stumbles in confusion, dealing ${damage} damage.`);
    enemy.confused--;
  } else if (roll < 0.3 && player.currentHP < player.maxHP * 0.4) {
    // Finishing blow attempt
    const damage = Math.floor(enemy.attack * 1.5);
    dealDamageToPlayer(damage);
    addToBattleLog(`The enemy senses weakness and strikes hard! ${damage} damage.`);
  } else if (roll < 0.7) {
    // Normal attack
    const damage = enemy.attack;
    dealDamageToPlayer(damage);
    addToBattleLog(`The enemy attacks for ${damage} damage.`);
  } else {
    // Defensive stance
    enemy.defense += 5;
    addToBattleLog('The enemy takes a defensive stance.');
  }
}

function dealDamageToPlayer(damage) {
  const player = rpgState.player;
  
  // Check for evasion
  if (player.buffs.evasion && player.buffs.evasion > 0) {
    addToBattleLog('You evade the attack!');
    return;
  }
  
  // Check for shield
  if (player.buffs.shield && player.buffs.shield > 0) {
    const blocked = Math.min(damage, player.buffs.shield);
    player.buffs.shield -= blocked;
    damage -= blocked;
    if (damage <= 0) {
      addToBattleLog('Your shield absorbs the blow!');
      return;
    }
    addToBattleLog(`Your shield blocks ${blocked} damage.`);
  }
  
  // Apply damage
  player.currentHP -= damage;
  player.currentHP = Math.max(player.currentHP, 0);
}

function updateBuffs() {
  const player = rpgState.player;
  
  // Decrease buff durations
  if (player.buffs.evasion) {
    player.buffs.evasion--;
    if (player.buffs.evasion <= 0) {
      delete player.buffs.evasion;
    }
  }
  
  if (player.buffs.inspired) {
    player.buffs.inspired--;
    if (player.buffs.inspired <= 0) {
      delete player.buffs.inspired;
    }
  }
  
  if (player.buffs.shield && player.buffs.shield <= 0) {
    delete player.buffs.shield;
  }
}
