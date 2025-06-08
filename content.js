window.createStickyNote = function (note) {
  let focusOnNote = false;
  if (!note) {
    const d = new Date();
    note = {
      note: `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()} ${d.toLocaleTimeString()}`,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      top: "20px",
      left: "10px",
      url: window.location.href.replace(/\#.*$/, ''), // not storing # in url
      fontSize: "1em",
      width: "200px",
      height: "100px",
      pinnedAtSpecificPosition: false
    }
    focusOnNote = true;
    chrome.storage.local.get('stickyNotes', function (result) {
      console.log("added note", note)
      if (!result.stickyNotes || result.stickyNotes.length == 0) { result.stickyNotes = [] }
      result.stickyNotes.push(note);
      chrome.storage.local.set({ stickyNotes: result.stickyNotes });
    });
  }
  const stickyNote = document.createElement('div');
  stickyNote.className = 'sticky-note';
  stickyNote.innerHTML = `
    <style>
      .sticky-note {
        position: fixed;
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
        top: -13px;
        right: 5;
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        color: black;
        margin:0;
        padding:0;
      }
      .sticky-note__smaller_text {
        position: absolute;
        top: -13px;
        right: 20px;
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        color: black;
        margin:0;
        padding:0;
      }
      .sticky-note__bigger_text {
        position: absolute;
        top: -12px;
        right: 30px;
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        color: black;
        margin:0;
        padding:0;
      }
      .sticky-note__pin {
        position: absolute;
        top: -12px;
        right: 40px;
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        font-size: 0.8em;
        color: black;
        margin:0;
        padding:0;
        filter: grayscale(100%);
      }
      .sticky-note.pinned {
        position: absolute;
      }
      .sticky-note__pin:hover {
        filter: grayscale(0%);
      }
      .sticky-note.pinned .sticky-note__pin {
        filter: grayscale(0%);
      }
    </style>
    <div class="sticky-note__handle"></div>
    <button class="sticky-note__close">x</button>
    <button class="sticky-note__smaller_text">-</button>
    <button class="sticky-note__bigger_text">+</button>
    <button class="sticky-note__pin">📍</button>
    <div class="sticky-content">
      <textarea id="${note.id}">${note.note}</textarea>
    </div>
  `;
  const button = stickyNote.querySelector('.sticky-note__close');
  const handle = stickyNote.querySelector('.sticky-note__handle');
  const smallerTextButton = stickyNote.querySelector('.sticky-note__smaller_text');
  const biggerTextButton = stickyNote.querySelector('.sticky-note__bigger_text');
  const pinButton = stickyNote.querySelector('.sticky-note__pin');
  const textArea = stickyNote.querySelector('textarea');
  if (note.pinnedAtSpecificPosition) {
    stickyNote.classList.add('pinned');
  }
  stickyNote.dataset.id = note.id;
  stickyNote.style.top = note.top;
  stickyNote.style.left = note.left;
  textArea.style.fontSize = note.fontSize;
  textArea.style.fontFamily = 'Arial, sans-serif';
  textArea.style.width = note.width;
  textArea.style.height = note.height;

  // event listeners
  button.addEventListener('click', window.removeStickyNote);

  pinButton.addEventListener('click', () => {
    stickyNote.classList.toggle('pinned');
    chrome.storage.local.get('stickyNotes', function (result) {
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
        stickyNote.style.position = stickyNote.classList.contains('pinned') ? 'absolute' : 'fixed';
        if (index > -1) {
          result.stickyNotes[index].pinnedAtSpecificPosition = stickyNote.classList.contains('pinned');
          const rect = stickyNote.getBoundingClientRect();
          if (result.stickyNotes[index].pinnedAtSpecificPosition) {
            result.stickyNotes[index].top = rect.top + window.scrollY * 2 + 'px';
            result.stickyNotes[index].left = rect.left + window.scrollX * 2 + 'px';
          } else {
            // if the sticky note is close to being outside of the page when unpinned, bring it back inside
            result.stickyNotes[index].top = Math.min(((rect.top - window.scrollY) / window.innerHeight * 100), 85) + '%';
            result.stickyNotes[index].left = Math.min(((rect.left - window.scrollX) / window.innerWidth * 100), 85) + '%';
          }
          stickyNote.style.top = result.stickyNotes[index].top;
          stickyNote.style.left = result.stickyNotes[index].left;
          console.log(result.stickyNotes[index].top, result.stickyNotes[index].left)
          chrome.storage.local.set({ stickyNotes: result.stickyNotes });
          console.log("pinned note", result.stickyNotes.filter(e => e.url == window.location.href.replace(/\#.*$/, '')))
        }
      }
    });
  });

  smallerTextButton.addEventListener('click', () => {
    textArea.style.fontSize = Number(textArea.style.fontSize.replace('em', '')) - 0.1 + 'em';
    chrome.storage.local.get('stickyNotes', function (result) {
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
        if (index > -1) {
          result.stickyNotes[index].fontSize = textArea.style.fontSize;
          chrome.storage.local.set({ stickyNotes: result.stickyNotes });
          console.log("made note smaller", result.stickyNotes.filter(e => e.url == window.location.href.replace(/\#.*$/, '')))
        }
      }
    });
  });

  biggerTextButton.addEventListener('click', () => {
    const textArea = stickyNote.querySelector('textarea');
    textArea.style.fontSize = Number(textArea.style.fontSize.replace('em', '')) + 0.1 + 'em';
    chrome.storage.local.get('stickyNotes', function (result) {
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
        if (index > -1) {
          result.stickyNotes[index].fontSize = textArea.style.fontSize;
          chrome.storage.local.set({ stickyNotes: result.stickyNotes });
          console.log("made note bigger", result.stickyNotes.filter(e => e.url == window.location.href.replace(/\#.*$/, '')))
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
      if (stickyNote.classList.contains('pinned')) {
        stickyNote.style.left = `${e.clientX - startLeft + initialLeft}px`;
        stickyNote.style.top = `${e.clientY - startTop + initialTop}px`;
      } else {
        const left = (e.clientX - startLeft + initialLeft) / window.innerWidth * 100;
        const top = (e.clientY - startTop + initialTop) / window.innerHeight * 100;
        stickyNote.style.left = `${left}%`;
        stickyNote.style.top = `${top}%`;
      }
      console.log(stickyNote.style.left, stickyNote.style.top, stickyNote.classList.contains('pinned'));
      chrome.storage.local.get('stickyNotes', function (result) {
        if (result.stickyNotes && result.stickyNotes.length > 0) {
          const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
          if (index > -1) {
            result.stickyNotes[index].top = stickyNote.style.top;
            result.stickyNotes[index].left = stickyNote.style.left;
            chrome.storage.local.set({ stickyNotes: result.stickyNotes });
            console.log("moved note", result.stickyNotes.filter(e => e.url == window.location.href.replace(/\#.*$/, '')))
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
          console.log("updated note", result.stickyNotes.filter(e => e.url == window.location.href.replace(/\#.*$/, '')))
        }
      }
    });
  });
  // resize observer, which is applied after the note is rendered
  const resizeObserver = new ResizeObserver((entries) => {
    chrome.storage.local.get('stickyNotes', function (result) {
      if (entries[0].contentRect.width <= 0 || entries[0].contentRect.height <= 0) {
        // this prevents the observer from running when the note is hidden and readding the node
        // I do not like the whole observer implementation, but it seems to work so far.
        return;
      }
      if (result.stickyNotes && result.stickyNotes.length > 0) {
        const index = result.stickyNotes.findIndex(note => note.id === stickyNote.dataset.id);
        if (index > -1) {
          result.stickyNotes[index].width = textArea.style.width;
          result.stickyNotes[index].height = textArea.style.height;
          chrome.storage.local.set({ stickyNotes: result.stickyNotes });
          console.log("resized note", result.stickyNotes.filter(e => e.url == window.location.href.replace(/\#.*$/, '')))
        }
      }
    });
  });
  document.body.appendChild(stickyNote);

  // things done after note is loaded
  if (focusOnNote) {
    textArea.focus();
    textArea.setSelectionRange(0, textArea.value.length);
  }
  resizeObserver.observe(textArea);
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
          console.log("removed note", result.stickyNotes.filter(e => e.url == window.location.href.replace(/\#.*$/, '')))
        }
      }
    });
  }
}

function runOnLoad() {
  chrome.storage.local.get('stickyNotes', function (result) {
    if (result.stickyNotes && result.stickyNotes.length > 0) {
      const url = window.location.href.replace(/\#.*$/, '');
      result.stickyNotes.filter(note => note.url === url).forEach(note => window.createStickyNote(note));
      console.log("runOnLoad", result.stickyNotes.filter(e => e.url == window.location.href.replace(/\#.*$/, '')))
    }
  });
}
runOnLoad()