
chrome.storage.local.get('stickyNotes', function (result) {
    console.log(result)
    if (result.stickyNotes && result.stickyNotes.length > 0) {
        const notesContainer = document.querySelector('#notes');
        const urls = result.stickyNotes.map(e=>e.url).filter((value, index, self) => self.indexOf(value) === index);
        urls.forEach(element => {
            const urlContainer = document.createElement('div');
            const removeUrlButton = document.createElement('button');
            removeUrlButton.textContent = '-';
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
            urlContainer.appendChild(ul);
            notesContainer.appendChild(urlContainer);
            result.stickyNotes.filter(note => note.url === element).forEach(note => {
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
                li.textContent = `${note.note}`;
                li.prepend(button);
                ul.appendChild(li);
            });
        });
    }
});