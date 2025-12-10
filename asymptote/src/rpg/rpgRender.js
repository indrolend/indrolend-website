import { rpgState } from './rpgState.js';

let canvas, ctx;

export function initRPGRender(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
}

export function renderRPG() {
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw player
  drawCharacter(rpgState.player, 150, 300, '#0f0');
  
  // Draw enemy
  drawCharacter(rpgState.enemy, 650, 300, '#f00');
  
  // Draw battle log
  drawBattleLog();
}

function drawCharacter(character, x, y, color) {
  // Draw character box
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 60, y - 100, 120, 150);
  
  // Draw name
  ctx.font = '16px Courier New';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(character.name || 'Character', x, y - 110);
  
  // Draw HP bar
  const hpPercent = character.currentHP / character.maxHP;
  const barWidth = 100;
  const barHeight = 15;
  
  // HP bar background
  ctx.strokeStyle = color;
  ctx.strokeRect(x - 50, y - 80, barWidth, barHeight);
  
  // HP bar fill
  ctx.fillStyle = hpPercent > 0.5 ? '#0f0' : hpPercent > 0.25 ? '#ff0' : '#f00';
  ctx.fillRect(x - 50, y - 80, barWidth * hpPercent, barHeight);
  
  // HP text
  ctx.fillStyle = color;
  ctx.font = '12px Courier New';
  ctx.fillText(`${character.currentHP}/${character.maxHP}`, x, y - 60);
  
  // Draw stats (for player)
  if (character.thinking !== undefined) {
    ctx.font = '10px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`Thinking: ${Math.floor(character.thinking)}`, x - 50, y - 40);
    ctx.fillText(`Expression: ${Math.floor(character.expression)}`, x - 50, y - 28);
    ctx.fillText(`Conviction: ${Math.floor(character.conviction)}`, x - 50, y - 16);
  }
  
  // Draw buffs
  if (character.buffs) {
    let buffY = y + 10;
    Object.entries(character.buffs).forEach(([buff, value]) => {
      ctx.font = '10px Courier New';
      ctx.fillStyle = '#ff0';
      ctx.textAlign = 'center';
      ctx.fillText(`${buff}: ${value}`, x, buffY);
      buffY += 12;
    });
  }
  
  // Draw simple character representation
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 20, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 30);
  ctx.stroke();
  
  // Arms
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 10);
  ctx.lineTo(x + 20, y + 10);
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x - 15, y + 50);
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x + 15, y + 50);
  ctx.stroke();
}

function drawBattleLog() {
  ctx.font = '12px Courier New';
  ctx.fillStyle = '#0f0';
  ctx.textAlign = 'left';
  
  const startY = 500;
  const lineHeight = 15;
  
  // Draw title
  ctx.fillText('Battle Log:', 20, startY - 10);
  
  // Draw last few messages
  const recentLogs = rpgState.battleLog.slice(-8);
  recentLogs.forEach((log, i) => {
    ctx.fillText(log, 20, startY + i * lineHeight);
  });
  
  // Draw turn indicator
  ctx.font = '14px Courier New';
  ctx.fillStyle = rpgState.turn === 'player' ? '#0f0' : '#f00';
  ctx.textAlign = 'center';
  ctx.fillText(`${rpgState.turn === 'player' ? 'Your' : 'Enemy'} Turn`, canvas.width / 2, 50);
}
