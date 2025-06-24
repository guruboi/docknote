const minBtn = document.getElementById('min-btn');
const closeBtn = document.getElementById('close-btn');
const noteArea = document.getElementById('note');
const noteList = document.getElementById('note-list');
const addNoteBtn = document.getElementById('add-note');
const titleDisplay = document.getElementById('current-note-title');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const sidebar = document.querySelector('.sidebar');
const exportBtn = document.getElementById('export-btn');
const deleteSelectedBtn = document.getElementById('delete-selected');

let notes = JSON.parse(localStorage.getItem('dock-notes') || '{}');
let currentNoteId = null;
let selectedNotes = new Set();

function saveNotes() {
  localStorage.setItem('dock-notes', JSON.stringify(notes));
}

function createNote() {
  const id = `note-${Date.now()}`;
  notes[id] = {
    title: 'Untitled',
    content: '',
    updated: Date.now()
  };
  currentNoteId = id;
  saveNotes();
  selectNote(id);
  renderNoteList();
}

function deleteNote(id) {
  delete notes[id];
  if (id === currentNoteId) {
    const remaining = Object.keys(notes);
    currentNoteId = remaining.length ? remaining[0] : null;
    if (currentNoteId) selectNote(currentNoteId);
    else createNote();
  }
  saveNotes();
  renderNoteList();
}

function deleteSelectedNotes() {
  selectedNotes.forEach((id) => {
    delete notes[id];
    if (id === currentNoteId) currentNoteId = null;
  });
  selectedNotes.clear();
  const remaining = Object.keys(notes);
  currentNoteId = remaining.length ? remaining[0] : null;
  if (currentNoteId) selectNote(currentNoteId);
  else createNote();
  saveNotes();
  renderNoteList();
}

function renameNote(id) {
  const input = document.createElement('input');
  input.value = notes[id].title || 'Untitled';
  input.className = 'rename-input';
  input.onblur = () => {
    notes[id].title = input.value.trim() || 'Untitled';
    notes[id].updated = Date.now();
    saveNotes();
    if (id === currentNoteId) titleDisplay.textContent = notes[id].title;
    renderNoteList();
  };
  input.onkeydown = (e) => {
    if (e.key === 'Enter') input.blur();
  };
  return input;
}

function selectNote(id) {
  if (!notes[id]) return;
  currentNoteId = id;
  noteArea.innerHTML = notes[id].content;
  titleDisplay.textContent = notes[id].title;
  notes[id].updated = Date.now();
  saveNotes();
  renderNoteList();
}

function renderNoteList() {
  const sortedNotes = Object.entries(notes)
    .filter(([_, note]) => note.title && typeof note.content === 'string')
    .sort((a, b) => b[1].updated - a[1].updated);

  noteList.innerHTML = '';

  sortedNotes.forEach(([id, note]) => {
    const li = document.createElement('li');
    li.className = id === currentNoteId ? 'note-item active' : 'note-item';
    li.onclick = () => selectNote(id);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedNotes.has(id);
    checkbox.onclick = (e) => {
      e.stopPropagation();
      if (e.target.checked) selectedNotes.add(id);
      else selectedNotes.delete(id);
      deleteSelectedBtn.style.display = selectedNotes.size > 0 ? 'block' : 'none';
    };

    const span = document.createElement('span');
    span.className = 'note-title';
    span.textContent = note.title;

    const renameBtn = document.createElement('button');
    renameBtn.innerText = '✏️';
    renameBtn.title = 'Rename';
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      const input = renameNote(id);
      li.innerHTML = '';
      li.appendChild(input);
      input.focus();
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = '🗑';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteNote(id);
    };

    const actions = document.createElement('div');
    actions.className = 'note-actions';
    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);
    noteList.appendChild(li);
  });

  deleteSelectedBtn.style.display = selectedNotes.size > 0 ? 'block' : 'none';
}

noteArea.addEventListener('input', () => {
  if (currentNoteId) {
    notes[currentNoteId].content = noteArea.innerHTML;
    notes[currentNoteId].updated = Date.now();
    saveNotes();
    renderNoteList();
  }
});

addNoteBtn.onclick = () => createNote();

toggleSidebarBtn.onclick = () => {
  sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
};

minBtn.onclick = () => window.electronAPI.minimize();
closeBtn.onclick = () => window.electronAPI.close();
deleteSelectedBtn.onclick = () => deleteSelectedNotes();

exportBtn.onclick = () => {
  if (!currentNoteId) return;
  const content = notes[currentNoteId].content.replace(/<[^>]*>/g, '');
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${notes[currentNoteId].title || 'note'}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
};

window.addEventListener('paste', (event) => {
  const items = event.clipboardData.items;
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100%';
        img.style.marginTop = '1rem';
        noteArea.appendChild(img);
        if (currentNoteId) {
          notes[currentNoteId].content = noteArea.innerHTML;
          notes[currentNoteId].updated = Date.now();
          saveNotes();
          renderNoteList();
        }
      };
      reader.readAsDataURL(file);
      event.preventDefault();
    }
  }
});

// Initial Load
const recentNote = Object.entries(notes)
  .sort((a, b) => b[1].updated - a[1].updated)[0];
if (recentNote) {
  currentNoteId = recentNote[0];
  selectNote(currentNoteId);
} else {
  createNote();
}
renderNoteList();
