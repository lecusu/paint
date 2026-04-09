import './style.css';
import { appState } from './state.js';
import { canvasManager } from './canvas.js';
import { toolManager } from './tools/ToolManager.js';
import { setupFileOps } from './fileOps.js';

function bootstrap() {
  canvasManager.init();
  toolManager.init();
  setupFileOps();
  
  const toolBtns = document.querySelectorAll('.tool-btn');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeToolObj = toolManager.getActive();
      if (appState.activeTool === 'SELECT' && activeToolObj && activeToolObj.commit) {
        activeToolObj.commit();
      }
      
      const nextTool = btn.dataset.tool;
      appState.setTool(nextTool);
    });
  });
  
  const colorPicker = document.getElementById('color-picker');
  colorPicker.addEventListener('input', (e) => {
    appState.setColor(e.target.value);
  });
  
  const strokeSize = document.getElementById('stroke-size');
  const strokeValue = document.getElementById('stroke-value');
  strokeSize.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    appState.setStrokeSize(val);
    strokeValue.textContent = val + 'px';
  });
  
  const btnUndo = document.getElementById('btn-undo');
  btnUndo.addEventListener('click', () => {
    canvasManager.undo();
  });
  
  const btnRedo = document.getElementById('btn-redo');
  btnRedo.addEventListener('click', () => {
    canvasManager.redo();
  });
  
  appState.subscribe(state => {
    toolBtns.forEach(btn => {
      if (btn.dataset.tool === state.activeTool) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    btnUndo.disabled = !state.canUndo();
    btnRedo.disabled = !state.canRedo();
  });
  
  appState.notify();
}

bootstrap();
