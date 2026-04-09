import { appState } from '../state.js';
import { canvasManager } from '../canvas.js';

export class MagnifierTool {
  onStart(x, y) {
    const newZoom = appState.zoomLevel === 1 ? 2 : 1;
    appState.setZoom(newZoom);
    canvasManager.applyZoom();
  }
  
  onMove() {}
  onEnd() {}
}
