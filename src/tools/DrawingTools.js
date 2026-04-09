import { appState } from '../state.js';
import { canvasManager } from '../canvas.js';

export class PenTool {
  onStart(x, y) {
    const ctx = canvasManager.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = appState.currentColor;
    ctx.lineWidth = appState.strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  onMove(x, y) {
    const ctx = canvasManager.ctx;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  onEnd(x, y) {
    canvasManager.ctx.closePath();
    canvasManager.saveState();
  }
}

export class PencilTool {
  onStart(x, y) {
    this.drawScatter(x, y);
  }

  onMove(x, y) {
    this.drawScatter(x, y);
  }

  onEnd(x, y) {
    canvasManager.saveState();
  }

  drawScatter(x, y) {
    const ctx = canvasManager.ctx;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = appState.currentColor;
    
    const radius = appState.strokeSize;
    const density = Math.max(10, radius * 2);
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const offsetX = x + Math.cos(angle) * r;
      const offsetY = y + Math.sin(angle) * r;
      
      ctx.globalAlpha = Math.random() * 0.5 + 0.1;
      ctx.fillRect(offsetX, offsetY, 1, 1);
    }
    
    ctx.globalAlpha = 1.0;
  }
}

export class EraserTool {
  onStart(x, y) {
    const ctx = canvasManager.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#ffffff'; // Paint solid white to match our white canvas background
    ctx.lineWidth = appState.strokeSize * 2; // Erasers are usually thicker
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  onMove(x, y) {
    const ctx = canvasManager.ctx;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  onEnd(x, y) {
    canvasManager.ctx.closePath();
    canvasManager.saveState();
  }
}
