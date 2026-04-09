import { appState } from '../state.js';
import { canvasManager } from '../canvas.js';

export class FillTool {
  onStart(x, y) {
    const startX = Math.floor(x);
    const startY = Math.floor(y);
    
    if (startX < 0 || startX >= canvasManager.width || startY < 0 || startY >= canvasManager.height) return;
    
    const imageData = canvasManager.getImageData();
    const targetColor = this.getPixelColor(imageData, startX, startY);
    const fillColor = this.hexToRgba(appState.currentColor);
    
    if (this.colorsMatch(targetColor, fillColor)) return;
    
    this.floodFillSpan(imageData, startX, startY, targetColor, fillColor);
    
    canvasManager.ctx.putImageData(imageData, 0, 0);
    canvasManager.saveState();
  }
  
  onMove() {}
  onEnd() {}
  
  getPixelColor(imageData, x, y) {
    const idx = (y * imageData.width + x) * 4;
    return [
      imageData.data[idx],
      imageData.data[idx + 1],
      imageData.data[idx + 2],
      imageData.data[idx + 3]
    ];
  }
  
  setPixelColor(imageData, idx, color) {
    imageData.data[idx] = color[0];
    imageData.data[idx + 1] = color[1];
    imageData.data[idx + 2] = color[2];
    imageData.data[idx + 3] = color[3];
  }
  
  colorsMatch(c1, c2) {
    return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
  }
  
  hexToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  }
  
  // Span-based flood fill is much faster and reduces stack size effectively
  floodFillSpan(imageData, startX, startY, targetColor, fillColor) {
    const stack = [[startX, startY]];
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    const checkColor = (x, y) => {
      const idx = (y * width + x) * 4;
      return this.colorsMatch([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]], targetColor);
    };

    while (stack.length > 0) {
      let [x, y] = stack.pop();
      let lx = x;

      while (lx >= 0 && checkColor(lx, y)) {
        lx--;
      }
      lx++;

      let spanAbove = false;
      let spanBelow = false;

      while (lx < width && checkColor(lx, y)) {
        const idx = (y * width + lx) * 4;
        this.setPixelColor(imageData, idx, fillColor);

        if (y > 0) {
          if (!spanAbove && checkColor(lx, y - 1)) {
            stack.push([lx, y - 1]);
            spanAbove = true;
          } else if (spanAbove && !checkColor(lx, y - 1)) {
            spanAbove = false;
          }
        }

        if (y < height - 1) {
          if (!spanBelow && checkColor(lx, y + 1)) {
            stack.push([lx, y + 1]);
            spanBelow = true;
          } else if (spanBelow && !checkColor(lx, y + 1)) {
            spanBelow = false;
          }
        }
        lx++;
      }
    }
  }
}
