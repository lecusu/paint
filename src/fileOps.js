import { canvasManager } from './canvas.js';
import { appState } from './state.js';

export function setupFileOps() {
  const btnSave = document.getElementById('btn-save');
  const btnLoad = document.getElementById('btn-load');
  const fileInput = document.getElementById('file-load');

  btnSave.addEventListener('click', () => {
    const dataURL = canvasManager.mainCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'paint-image.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  btnLoad.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        canvasManager.clearMainCanvas();
        canvasManager.ctx.drawImage(img, 0, 0, canvasManager.width, canvasManager.height);

        const imageData = canvasManager.ctx.getImageData(0, 0, canvasManager.width, canvasManager.height);

        appState.undoStack = [];
        appState.redoStack = [];
        appState.pushUndo(imageData);

        if (appState.zoomLevel !== 1) {
          appState.setZoom(1);
          canvasManager.applyZoom();
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });
}
