export const TOOLS = {
  PEN: 'PEN',
  PENCIL: 'PENCIL',
  FILL: 'FILL',
  ERASER: 'ERASER',
  SELECT: 'SELECT',
  MAGNIFIER: 'MAGNIFIER'
};

class State {
  constructor() {
    this.activeTool = TOOLS.PEN;
    this.currentColor = '#000000';
    this.strokeSize = 5;
    this.isDrawing = false;
    
    // Stacks hold ImageData objects
    this.undoStack = [];
    this.redoStack = [];
    
    // For selection tools
    this.selectionBuffer = null;
    this.selectionRect = null;
    
    // Zoom factor for Magnifier
    this.zoomLevel = 1;
    
    // To trigger updates if necessary
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(l => l(this));
  }

  setTool(tool) {
    this.activeTool = tool;
    this.notify();
  }

  setColor(color) {
    this.currentColor = color;
    this.notify();
  }

  setStrokeSize(size) {
    this.strokeSize = size;
    this.notify();
  }

  setDrawing(drawing) {
    this.isDrawing = drawing;
    this.notify();
  }

  setZoom(zoom) {
    this.zoomLevel = zoom;
    this.notify();
  }

  pushUndo(imageData) {
    if (this.undoStack.length >= 20) {
      this.undoStack.shift(); // Max 20 states
    }
    this.undoStack.push(imageData);
    this.redoStack = []; // Clear redo stack on new action
    this.notify();
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }
}

export const appState = new State();
