
chrome.storage.local.get('stickyNotes', function (result) {
    if (result.stickyNotes && result.stickyNotes.length > 0) {
        const notesContainer = document.querySelector('#notes');
        const urls = result.stickyNotes.map(e => e.url).filter((value, index, self) => self.indexOf(value) === index);
        urls.forEach(element => {
            const urlContainer = document.createElement('div');
            const removeUrlButton = document.createElement('button');
            removeUrlButton.textContent = '-';
            const editButton = document.createElement('button');
            editButton.textContent = '..';
            // the edit button will make the a tag into an input
            editButton.addEventListener('click', (e) => {
                const a = e.target.parentNode.querySelector('a');
                const input = document.createElement('input');
                input.value = a.href;
                a.parentNode.replaceChild(input, a);
                input.focus();
                // make the input back into the anchor after it looses focus
                input.addEventListener('blur', (e) => {
                    const input = e.target;
                    const a = document.createElement('a');
                    a.textContent = input.value;
                    a.href = input.value;
                    chrome.storage.local.set({ stickyNotes: result.stickyNotes.map(note => note.url === element ? { ...note, url: input.value } : note) });
                    input.parentNode.replaceChild(a, input);
                });
            });
            removeUrlButton.addEventListener('click', (e) => {
                chrome.storage.local.get('stickyNotes', function (result) {
                    chrome.storage.local.set({ stickyNotes: result.stickyNotes.filter(note => note.url !== e.target.parentNode.querySelector('a').href) });
                    location.reload();
                });
            });
            urlContainer.appendChild(removeUrlButton);
            const a = document.createElement('a');
            a.textContent = element;
            a.href = element;
            urlContainer.appendChild(a);
            const ul = document.createElement('ul');
            ul.style.listStyleType = 'none';
            urlContainer.appendChild(editButton);
            urlContainer.appendChild(ul);
            notesContainer.appendChild(urlContainer);
            result.stickyNotes.filter(note => note.url === element).forEach(note => {
                const noteSpan = document.createElement('span');
                noteSpan.id = note.id;
                noteSpan.textContent = note.note;
                const editNoteButton = document.createElement('button');
                editNoteButton.textContent = '..';
                editNoteButton.addEventListener('click', (e) => {
                    const button_text = e.target.parentNode.querySelector('span').textContent;
                    const textarea = document.createElement('textarea');
                    textarea.style.width = '100%';
                    textarea.value = button_text;
                    e.target.parentNode.replaceChild(textarea, e.target.parentNode.querySelector('span'));
                    textarea.focus();
                    textarea.addEventListener('blur', (e) => {
                        const textarea = e.target;
                        const span = document.createElement('span');
                        span.textContent = textarea.value;
                        span.id = textarea.id;
                        textarea.parentNode.replaceChild(span, textarea);
                        chrome.storage.local.set({ stickyNotes: result.stickyNotes.map(note => note.id === noteSpan.id ? { ...note, note: span.textContent } : note) });
                    });
                });
                const button = document.createElement('button');
                button.textContent = '-';
                button.addEventListener('click', (e) => {
                    chrome.storage.local.get('stickyNotes', function (result) {
                        chrome.storage.local.set({ stickyNotes: result.stickyNotes.filter(note => note.id !== e.target.closest('li').id) });
                        location.reload();
                    });
                });
                const li = document.createElement('li');
                li.id = note.id;
                li.prepend(button);
                li.append(noteSpan);
                li.append(editNoteButton);
                ul.appendChild(li);
            });
        });
    }
});