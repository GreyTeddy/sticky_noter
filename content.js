window.createStickyNote = function (existingNote = '', id = null, location = { top: "10px", left: "50%" }, url = null, fontSize = '1em') {
  if (!url) {
    url = window.location.href.replace(/\#.*$/, '');
  }
  const stickyNote = document.createElement('div');
  stickyNote.className = 'sticky-note';
  stickyNote.dataset.id = id ? id : Date.now().toString(36) + Math.random().toString(36).substring(2);
  document.body.appendChild(stickyNote);
  const d = new Date();
  let focusOnNote = false;
  const date = `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()} ${d.toLocaleTimeString()}`;
  if (existingNote.length == 0) {
    focusOnNote = true;
    existingNote = date;
    chrome.storage.local.get('stickyNotes', function (result) {
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        chrome.storage.local.set({ stickyNotes: [...result.stickyNotes, { id: stickyNote.dataset.id, note: existingNote, location, url }] });
      }
      else {
        chrome.storage.local.set({ stickyNotes: [{ id: stickyNote.dataset.id, note: existingNote, location, url }] });
      }
    });
  }
  stickyNote.innerHTML = `
    <style>
      .sticky-note {
        position: fixed;
        top: ${location.top};
        left: ${location.left};
        max-top: 100vh;
        max-left: 100vw;
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
      .sticky-note__smaller_text {
        position: absolute;
        top: -15px;
        left: 20px;
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        font-size: 0.9em;
        color: black;
        margin: 0;
        padding: 0;
      }
      .sticky-note__bigger_text {
        position: absolute;
        top: -15px;
        left: 30px;
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        font-size: 0.9em;
        color: black;
        margin: 0;
        padding: 0;
      }
    </style>
    <div class="sticky-note__handle"></div>
    <button class="sticky-note__close">x</button>
    <button class="sticky-note__smaller_text">-</button>
    <button class="sticky-note__bigger_text">+</button>
    <div class="sticky-content">
      <textarea id="${stickyNote.dataset.id}" style="font-size: ${fontSize}">${existingNote}</textarea>
    </div>
  `;
  const button = stickyNote.querySelector('.sticky-note__close');
  const handle = stickyNote.querySelector('.sticky-note__handle');
  const smallerTextButton = stickyNote.querySelector('.sticky-note__smaller_text');
  const biggerTextButton = stickyNote.querySelector('.sticky-note__bigger_text');

  const textArea = stickyNote.querySelector('textarea');
  if (focusOnNote) {
    textArea.focus();
    textArea.setSelectionRange(0, textArea.value.length);
  }
  button.addEventListener('click', window.removeStickyNote);

  smallerTextButton.addEventListener('click', () => {
    const textArea = stickyNote.querySelector('textarea');
    textArea.style.fontSize = Number(textArea.style.fontSize.replace('em', '')) - 0.1 + 'em';
    chrome.storage.local.get('stickyNotes', function (result) {
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
        if (index > -1) {
          result.stickyNotes[index].fontSize = textArea.style.fontSize;
          chrome.storage.local.set({ stickyNotes: result.stickyNotes });
        }
      }
    });
  });

  biggerTextButton.addEventListener('click', () => {
    const textArea = stickyNote.querySelector('textarea');
    textArea.style.fontSize = Number(textArea.style.fontSize.replace('em', '')) + 0.1 + 'em';
    console.log(textArea.style.fontSize)
    chrome.storage.local.get('stickyNotes', function (result) {
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
        if (index > -1) {
          result.stickyNotes[index].fontSize = textArea.style.fontSize;
          chrome.storage.local.set({ stickyNotes: result.stickyNotes });
        }
      }
    });
  });

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
      chrome.storage.local.get('stickyNotes', function (result) {
        if (result.stickyNotes && result.stickyNotes.length > 0) {
          const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
          if (index > -1) {
            result.stickyNotes[index].location = { top: stickyNote.offsetTop + 'px', left: stickyNote.offsetLeft + 'px' };
            chrome.storage.local.set({ stickyNotes: result.stickyNotes });
          }
        }
      });
    }
  });
  document.addEventListener('mouseup', () => {
    handleMouseDown = false;
  });
  textArea.addEventListener('input', () => {
    chrome.storage.local.get('stickyNotes', function (result) {
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
        if (index > -1) {
          result.stickyNotes[index].note = textArea.value;
          chrome.storage.local.set({ stickyNotes: result.stickyNotes });
        }
      }
    });
  });
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
      const url = window.location.href.replace(/\#.*$/, '');
      result.stickyNotes.filter(note => note.url === url).forEach(note => {
        window.createStickyNote(note.note, note.id, note.location, note.url, note.fontSize);
      });
    }
  });
}
runOnLoad()