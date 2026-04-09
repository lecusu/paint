import { appState } from './state.js';

class CanvasManager {
  constructor() {
    this.mainCanvas = document.getElementById('main-canvas');
    this.overlayCanvas = document.getElementById('overlay-canvas');
    this.wrapper = document.getElementById('canvas-wrapper');
    
    this.ctx = this.mainCanvas.getContext('2d', { willReadFrequently: true });
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    
    this.width = this.mainCanvas.width;
    this.height = this.mainCanvas.height;
  }

  init() {
    // Fill main canvas with white to avoid transparent png by default,
    // though the spec might require transparency. We'll stick to a white baseline.
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Save initial state
    this.saveState();
  }

  clearMainCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  clearOverlay() {
    this.overlayCtx.clearRect(0, 0, this.width, this.height);
  }

  saveState() {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    appState.pushUndo(imageData);
  }

  undo() {
    if (!appState.canUndo()) return;
    
    const currentState = this.ctx.getImageData(0, 0, this.width, this.height);
    appState.redoStack.push(currentState);
    
    const previousState = appState.undoStack.pop();
    this.ctx.putImageData(previousState, 0, 0);
    appState.notify();
  }

  redo() {
    if (!appState.canRedo()) return;
    
    const currentState = this.ctx.getImageData(0, 0, this.width, this.height);
    this.pushUndoSilent(currentState);
    
    const nextState = appState.redoStack.pop();
    this.ctx.putImageData(nextState, 0, 0);
    appState.notify();
  }
  
  // Helper to push to undo stack without clearing redo stack
  pushUndoSilent(imageData) {
    appState.undoStack.push(imageData);
    if (appState.undoStack.length > 20) {
      appState.undoStack.shift();
    }
  }

  applyZoom() {
    this.wrapper.style.transform = `scale(${appState.zoomLevel})`;
    
    // Handle scrolling if magnified
    if (appState.zoomLevel > 1) {
      const container = document.getElementById('canvas-container');
      // Give enough padding/scroll space
      container.style.overflow = 'auto';
    }
  }
  
  getCoordinates(e) {
    const rect = this.wrapper.getBoundingClientRect();
    // Use the actual unscaled width/height of the rect vs canvas width
    const scaleX = this.mainCanvas.width / rect.width;
    const scaleY = this.mainCanvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }
  
  // Gets a fresh snapshot of current Image Data
  getImageData() {
    return this.ctx.getImageData(0, 0, this.width, this.height);
  }
}

export const canvasManager = new CanvasManager();
