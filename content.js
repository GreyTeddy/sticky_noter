window.createStickyNote = function (existingNote = '') {
  const stickyNote = document.createElement('div');
  stickyNote.className = 'sticky-note';
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
  stickyNote.dataset.id = id;
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
      <textarea data-id="${id}">${existingNote}</textarea>
    </div>
  `;
  const button = stickyNote.querySelector('.sticky-note__close');
  const handle = stickyNote.querySelector('.sticky-note__handle');
  const textArea = stickyNote.querySelector('textarea');
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
  textArea.addEventListener('input', () => {
    chrome.storage.local.get('stickyNotes', function (result) {
      const existingNote = result.stickyNotes && result.stickyNotes.find(note => note.id === id);
      if (existingNote) {
        existingNote.note = textArea.value;
        chrome.storage.local.set({ stickyNotes: result.stickyNotes });
      }
      else if (textArea.value.length > 0) {
        if (result.stickyNotes && result.stickyNotes.length > 0) {
          chrome.storage.local.set({ stickyNotes: [...result.stickyNotes, { id: id, note: textArea.value }] });
        }
        else {
          chrome.storage.local.set({ stickyNotes: [{ id: id, note: textArea.value }] });
        }
      }
    });
  });
  return stickyNote
}

window.removeStickyNote = function (event) {
  const button = event.target;
  const stickyNote = button.closest('.sticky-note');
  if (stickyNote) {
    stickyNote.remove();
    chrome.storage.local.get('stickyNotes', function (result) {
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
        if (index > -1) {
          result.stickyNotes.splice(index, 1);
          chrome.storage.local.set({ stickyNotes: result.stickyNotes });
        }
      }
    });
  }
}

function runOnLoad() {
  chrome.storage.local.get('stickyNotes', function (result) {
    if (result.stickyNotes && result.stickyNotes.length > 0) {
      result.stickyNotes.forEach(note => {
        const stickyNote = window.createStickyNote(note.note);
        stickyNote.dataset.id = note.id;
        const textArea = stickyNote.querySelector('textarea');
        const id = note.id;
        textArea.addEventListener('input', () => {
          if (textArea.value.length > 0) {
            if (result.stickyNotes && result.stickyNotes.length > 0) {
              chrome.storage.local.set({ stickyNotes: [...result.stickyNotes, { id: id, note: textArea.value }] });
            }
            else {
              chrome.storage.local.set({ stickyNotes: [{ id: id, note: textArea.value }] });
            }
          }
        });
      });
    }
  });
}
runOnLoad()