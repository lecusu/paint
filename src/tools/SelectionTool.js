import { appState } from '../state.js';
import { canvasManager } from '../canvas.js';

export class SelectionTool {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    
    // State machine: 'idle', 'drawing', 'selected', 'dragging'
    this.mode = 'idle';
    this.rect = null; // {x, y, w, h}
    this.selectionData = null; // ImageData
    
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    
    this.dashOffset = 0;
    this.animationFrame = null;
    this.tempCanvas = null;
    
    this.animate = this.animate.bind(this);
  }

  onStart(x, y) {
    if (this.mode === 'selected') {
      if (this.isInsideRect(x, y, this.rect)) {
        this.mode = 'dragging';
        this.dragOffsetX = x - this.rect.x;
        this.dragOffsetY = y - this.rect.y;
        
        // Blank out the original area since we're dragging it
        const ctx = canvasManager.ctx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        
        return;
      } else {
        this.commit();
      }
    }
    
    this.mode = 'drawing';
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;
    
    if (!this.animationFrame) {
      this.animate();
    }
  }

  onMove(x, y) {
    if (this.mode === 'drawing') {
      this.currentX = x;
      this.currentY = y;
    } else if (this.mode === 'dragging') {
      this.rect.x = x - this.dragOffsetX;
      this.rect.y = y - this.dragOffsetY;
    }
  }

  onEnd() {
    if (this.mode === 'drawing') {
      this.mode = 'selected';
      this.rect = {
        x: Math.min(this.startX, this.currentX),
        y: Math.min(this.startY, this.currentY),
        w: Math.abs(this.currentX - this.startX),
        h: Math.abs(this.currentY - this.startY)
      };
      
      if (this.rect.w < 2 || this.rect.h < 2) {
        this.reset();
        return;
      }
      
      this.selectionData = canvasManager.ctx.getImageData(
        this.rect.x, this.rect.y, this.rect.w, this.rect.h
      );
    } else if (this.mode === 'dragging') {
      this.mode = 'selected';
    }
  }

  commit() {
    if (this.mode === 'selected' && this.selectionData) {
      canvasManager.ctx.putImageData(this.selectionData, this.rect.x, this.rect.y);
      canvasManager.saveState();
    }
    this.reset();
  }
  
  reset() {
    this.mode = 'idle';
    this.rect = null;
    this.selectionData = null;
    canvasManager.clearOverlay();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  isInsideRect(x, y, rect) {
    if (!rect) return false;
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  animate() {
    if (appState.activeTool !== 'SELECT' && this.mode !== 'idle') {
      this.commit();
      return;
    }
    
    canvasManager.clearOverlay();
    const ctx = canvasManager.overlayCtx;
    
    if (this.mode === 'drawing') {
      this.drawAnts(ctx, 
        Math.min(this.startX, this.currentX), Math.min(this.startY, this.currentY), 
        Math.abs(this.currentX - this.startX), Math.abs(this.currentY - this.startY)
      );
    } else if (this.mode === 'selected' || this.mode === 'dragging') {
      if (this.selectionData) {
        this.drawSelectionImage(ctx);
      }
      this.drawAnts(ctx, this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    this.dashOffset--;
    if (this.mode !== 'idle') {
      this.animationFrame = requestAnimationFrame(this.animate);
    }
  }
  
  drawSelectionImage(ctx) {
    if (!this.tempCanvas || this.tempCanvas.width !== this.rect.w || this.tempCanvas.height !== this.rect.h) {
      this.tempCanvas = document.createElement('canvas');
      this.tempCanvas.width = this.rect.w;
      this.tempCanvas.height = this.rect.h;
    }
    const tempCtx = this.tempCanvas.getContext('2d');
    tempCtx.putImageData(this.selectionData, 0, 0);
    
    ctx.drawImage(this.tempCanvas, this.rect.x, this.rect.y);
  }

  drawAnts(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = this.dashOffset;
    ctx.stroke();
    
    ctx.strokeStyle = '#fff';
    ctx.lineDashOffset = this.dashOffset + 5;
    ctx.stroke();
    ctx.restore();
  }
}
