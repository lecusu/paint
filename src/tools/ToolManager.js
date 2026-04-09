import { appState, TOOLS } from '../state.js';
import { canvasManager } from '../canvas.js';
import { PenTool, PencilTool, EraserTool } from './DrawingTools.js';
import { FillTool } from './FillTool.js';
import { SelectionTool } from './SelectionTool.js';
import { MagnifierTool } from './MagnifierTool.js';

class ToolManager {
  constructor() {
    this.tools = null;
  }
  
  init() {
    this.tools = {
      [TOOLS.PEN]: new PenTool(),
      [TOOLS.PENCIL]: new PencilTool(),
      [TOOLS.ERASER]: new EraserTool(),
      [TOOLS.FILL]: new FillTool(),
      [TOOLS.SELECT]: new SelectionTool(),
      [TOOLS.MAGNIFIER]: new MagnifierTool()
    };
    
    this.bindEvents();
  }

  bindEvents() {
    const wrapper = canvasManager.wrapper;
    
    wrapper.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('pointerup', this.onPointerUp.bind(this));
  }

  getActive() {
    return this.tools[appState.activeTool];
  }

  onPointerDown(e) {
    if (e.button !== 0) return; // Only left click
    appState.setDrawing(true);
    const coords = canvasManager.getCoordinates(e);
    
    const activeTool = this.getActive();
    if (activeTool && activeTool.onStart) {
      activeTool.onStart(coords.x, coords.y, e);
    }
  }

  onPointerMove(e) {
    if (!appState.isDrawing) return;
    const coords = canvasManager.getCoordinates(e);
    
    const activeTool = this.getActive();
    if (activeTool && activeTool.onMove) {
      activeTool.onMove(coords.x, coords.y, e);
    }
  }

  onPointerUp(e) {
    if (!appState.isDrawing) return;
    appState.setDrawing(false);
    const coords = canvasManager.getCoordinates(e);
    
    const activeTool = this.getActive();
    if (activeTool && activeTool.onEnd) {
      activeTool.onEnd(coords.x, coords.y, e);
    }
  }
}

export const toolManager = new ToolManager();
