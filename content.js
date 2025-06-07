window.createStickyNote = function (existingNote = '') {
  const stickyNote = document.createElement('div');
  stickyNote.className = 'sticky-note';
  document.body.appendChild(stickyNote);
  const d = new Date();
  const date = `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()} ${d.toLocaleTimeString()}`;
  if (existingNote.length == 0) {
    existingNote = date;
  }
  stickyNote.innerHTML = `
    <style>
      .sticky-note {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        margin:0;
        padding:0;
        z-index: 100000;
      }
      .sticky-note textarea {
        background-color: rgba(255, 255, 0, 0.77);
        color: black;
      }
      .sticky-note__handle {
        cursor: move;
        position: absolute;
        top: -10px;
        left: 0;
        right: 0;
        height: 10px;
        background-color: rgba(255, 255, 0, 0.77);
      }
      .sticky-note__close {
        position: absolute;
        top: -15px;
        right: 0;
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        font-size: 0.9em;
        color: black;
      }
      .sticky-note .sticky-content > span {
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: 0.7em;
        color: rgba(255, 255, 0, 0.77);
      }
    </style>
    <div class="sticky-note__handle"></div>
    <button class="sticky-note__close">x</button>
    <div class="sticky-content">
      <textarea>${existingNote}</textarea>
    </div>
  `;
  const button = stickyNote.querySelector('.sticky-note__close');
  const handle = stickyNote.querySelector('.sticky-note__handle');
  button.addEventListener('click', window.removeStickyNote);
  let handleMouseDown = false;
  let startLeft = 0, startTop = 0, initialLeft = 0, initialTop = 0;
  handle.addEventListener('mousedown', (e) => {
    handleMouseDown = true;
    startLeft = e.clientX;
    startTop = e.clientY;
    initialLeft = stickyNote.offsetLeft;
    initialTop = stickyNote.offsetTop;
  });
  document.addEventListener('mousemove', (e) => {
    if (handleMouseDown) {
      const left = initialLeft + e.clientX - startLeft;
      const top = initialTop + e.clientY - startTop;
      stickyNote.style.left = `${left}px`;
      stickyNote.style.top = `${top}px`;
    }
  });
  document.addEventListener('mouseup', () => {
    handleMouseDown = false;
  });
}

window.removeStickyNote = function (event) {
  const button = event.target;
  const stickyNote = button.closest('.sticky-note');
  if (stickyNote) {
    stickyNote.remove();
  }
}