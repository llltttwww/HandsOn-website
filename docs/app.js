'use strict';

const familyNames = {core:'Core-50', composition:'Composition', generalization:'Asset & relation', deformable:'Deformable'};
const familyDescriptions = {core:'Core-50 · Demonstrations & evaluation', composition:'Transfer-16 · Skill composition', generalization:'Transfer-16 · Asset & relation transfer', deformable:'Transfer-16 · Deformable manipulation'};
let tasks = [], family = 'all', expanded = false;
const grid = document.querySelector('#task-grid');
const search = document.querySelector('#task-search');
const showMore = document.querySelector('#show-more');
const count = document.querySelector('#task-count');
const dialog = document.querySelector('#task-dialog');

function showTask(task) {
  document.querySelector('#dialog-image').src = task.image;
  document.querySelector('#dialog-image').alt = task.title + ' in HandsOn simulation';
  document.querySelector('#dialog-family').textContent = task.short + ' / ' + familyDescriptions[task.family];
  document.querySelector('#dialog-title').textContent = task.title;
  document.querySelector('#dialog-description').textContent = task.description;
  document.querySelector('#dialog-link').href = 'https://github.com/TsinghuaC3I/HandsOn/blob/main/configs/multi_task/' + task.id + '.yaml';
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });

function renderTasks() {
  const query = search.value.trim().toLowerCase();
  const matching = tasks.filter(task => (family === 'all' || task.family === family) && `${task.title} ${task.id} ${task.description}`.toLowerCase().includes(query));
  const visible = expanded ? matching : matching.slice(0, 12);
  grid.replaceChildren();
  visible.forEach(task => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'task-card';
    button.setAttribute('aria-label', 'View task: ' + task.title);
    // All interpolated strings are from the local, authored task catalog.
    button.innerHTML = `<div class="task-image"><img src="${task.image}" alt="${task.title} in simulation" width="854" height="480" loading="lazy"><span class="task-open" aria-hidden="true">↗</span></div><div class="task-meta ${task.family === 'core' ? '' : 'transfer'}"><span>${task.short}</span><span>${familyNames[task.family]}</span></div><h3>${task.title}</h3>`;
    button.addEventListener('click', () => showTask(task)); grid.append(button);
  });
  if (!matching.length) { const p = document.createElement('p'); p.className = 'empty-state'; p.textContent = 'No tasks match this search. Try a different name or suite.'; grid.append(p); }
  count.textContent = `Showing ${visible.length} of ${matching.length} ${matching.length === 1 ? 'task' : 'tasks'}`;
  showMore.hidden = matching.length <= 12;
  showMore.textContent = expanded ? 'Show fewer tasks ↑' : `Show all ${matching.length} tasks ↓`;
  showMore.setAttribute('aria-expanded', String(expanded));
}
document.querySelectorAll('[data-family]').forEach(button => button.addEventListener('click', () => {
  family = button.dataset.family; expanded = false;
  document.querySelectorAll('[data-family]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  renderTasks();
}));
search.addEventListener('input', () => { expanded = false; renderTasks(); });
showMore.addEventListener('click', () => { expanded = !expanded; renderTasks(); if (!expanded) document.querySelector('.task-toolbar').scrollIntoView({block:'start'}); });
fetch('assets/tasks.json').then(response => { if (!response.ok) throw new Error('Task catalog unavailable'); return response.json(); }).then(data => { tasks = data; renderTasks(); }).catch(() => { count.textContent = 'The gallery could not load. The complete task catalog is linked below.'; showMore.hidden = true; });

const core = [
  ['OpenWAM',29.1,40.8,23.8,22.1,11],['FastWAM',26.4,42.7,20.2,15.3,9],['π₀.₅',24.9,40.4,14.6,19.7,10],['DM0.5',21.4,37.7,10.0,16.7,9],
  ['LingBot-VLA',19.7,26.9,14.3,17.9,8],['HY-Embodied',18.9,27.1,13.3,16.4,8],['Motus',18.1,30.1,11.5,12.3,5],['Spatial Forcing',12.4,17.9,8.5,10.9,3],
  ['GPT-6 (move_eef)',5.2,7.6,1.1,7.3,1]
];
const transfer = [
  ['OpenWAM',0.4,12.9,14.8,12.5,10.2],['Motus',0.1,12.4,15.8,9.5,11.7],['π₀.₅',0.1,11.9,14.0,11.7,8.3],['FastWAM',0.0,11.8,12.5,11.3,11.3],
  ['DM0.5',0.9,11.2,9.2,14.4,8.8],['Spatial Forcing',0.1,10.3,12.7,7.9,10.5],['LingBot-VLA',0.0,9.3,13.3,4.2,11.3],['HY-Embodied',0.0,6.9,9.6,4.6,6.2]
];
function fillResults(data, target, integerLast = false) {
  const prompted = row => row[0].startsWith('GPT-6');
  const maxima = Array.from({length:5},(_, i) => Math.max(...data.filter(row => !prompted(row)).map(row => row[i+1])));
  target.innerHTML = data.map(row => `<tr${prompted(row) ? ' class="prompted-reference"' : ''}><th scope="row">${row[0]}</th>${row.slice(1).map((value,i) => `<td><span class="${i === 0 ? 'score-cell ' : ''}${!prompted(row) && value === maxima[i] ? 'best' : ''}">${integerLast && i === 4 ? value : value.toFixed(1)}</span></td>`).join('')}</tr>`).join('');
}
fillResults(core, document.querySelector('#core-results'), true);
fillResults(transfer, document.querySelector('#transfer-results'));
const tabs = [...document.querySelectorAll('[role=tab]')];
function selectTab(tab) { tabs.forEach(t => {const active = t === tab; t.setAttribute('aria-selected',String(active)); t.tabIndex = active ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !active;}); }
tabs.forEach(tab => {tab.addEventListener('click', () => selectTab(tab)); tab.addEventListener('keydown', event => {if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {event.preventDefault(); const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(tabs.indexOf(tab)+1)%tabs.length]; selectTab(next); next.focus();}});});

const motionToggle = document.querySelector('#motion-toggle');
let motion = false;
motionToggle.addEventListener('click', async () => {
  motion = !motion;
  const videos = [...document.querySelectorAll('.teaser-video')];
  if (motion) {
    const outcomes = await Promise.allSettled(videos.map(video => {const source = video.querySelector('source'); if (!source.src) {source.src = source.dataset.src;video.load();} return video.play();}));
    if (outcomes.every(result => result.status === 'rejected')) motion = false;
  }
  if (!motion) videos.forEach(video => video.pause());
  motionToggle.setAttribute('aria-pressed',String(motion));
  motionToggle.textContent = motion ? 'Pause demonstrations Ⅱ' : 'Play demonstrations ▷';
});

document.querySelector('#copy-citation').addEventListener('click', async () => {
  const text = document.querySelector('#bibtex').textContent;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {const field = document.createElement('textarea');field.value = text;field.style.position = 'fixed';field.style.opacity = '0';document.body.append(field);field.select();const copied = document.execCommand('copy');field.remove();if (!copied) throw new Error('Copy unavailable');}
    document.querySelector('#copy-status').textContent = 'BibTeX copied to clipboard.';
    document.querySelector('#copy-citation').textContent = 'Copied ✓';
  } catch {document.querySelector('#copy-status').textContent = 'Please select and copy the citation below.';}
});
