const $ = (id) => document.getElementById(id);
const KEY = 'leonida-ledger-v1';
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stageNames = ['Story first', 'Before the finale', 'Explore & collect', 'Activities & counts', 'Platinum cleanup'];
const stageNotes = ['Follow the story and character strands. No chapter placement is inferred beyond the description.', 'Pause before the finale and review unfinished opportunities. Keep a separate save if the game allows it.', 'Sweep up the collection and exploration objectives as the world opens up.', 'Work through activities, cumulative targets, and specific actions. Track attempts separately where required.', 'Resolve the cryptic objectives, check 100% completion, and earn the remaining 54 for platinum.'];
let trophies = [], earned = new Set(), counts = {}, kind = 'all', shield = false;
let activeDetail = null, lastFocus = null;
const params = new URLSearchParams(location.search);
const sortLabel = document.createElement('label');
sortLabel.innerHTML = 'Sort<select id="sort" aria-label="Sort trophies"><option value="list">List order</option><option value="grade">Grade</option><option value="stage">Stage</option><option value="name">Name</option></select>';
document.querySelector('.toolbar').insertBefore(sortLabel, document.querySelector('.missable-toggle'));
sortLabel.querySelector('select').addEventListener('change', render);
function message(text) { $('message').textContent = text; }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify({version:1, earned:[...earned], counts, shield})); }
  catch { message('Browser storage is unavailable. Export your progress to keep it.'); }
}
function validate(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.earned) || !data.counts || typeof data.counts !== 'object' || Array.isArray(data.counts) || typeof data.shield !== 'boolean') throw Error('Unsupported backup format.');
  const ids = new Set(trophies.map(t => t.id));
  if (data.earned.some(id => !Number.isInteger(id) || !ids.has(id))) throw Error('Backup contains an unknown trophy.');
  const clean = {};
  for (const [id, value] of Object.entries(data.counts)) {
    const t = trophies.find(t => String(t.id) === id);
    if (!t?.count || !Number.isInteger(value) || value < 0 || value > t.count) throw Error('Backup contains an invalid counter.');
    clean[id] = value;
  }
  return {earned: new Set(data.earned), counts:clean, shield:data.shield};
}
function hidden(t) { return shield && t.kind === 'story' && !earned.has(t.id); }
function name(t) { return hidden(t) ? 'Hidden trophy' : t.name; }
function description(t) { return hidden(t) ? 'Story details protected by your spoiler shield.' : t.description; }
function chip(t) { return '<span class="grade-chip ' + t.grade + '" title="' + t.grade + '" aria-label="' + t.grade + ' trophy">◇</span>'; }
function counter(t) {
  if (!t.count || hidden(t)) return '';
  return '<div class="counter"><button data-count="' + t.id + '" data-step="-1" aria-label="Decrease progress for ' + escape(name(t)) + '">−</button><output aria-label="Progress">' + (counts[t.id] || 0).toLocaleString() + ' / ' + t.count.toLocaleString() + '</output><button data-count="' + t.id + '" data-step="1" aria-label="Increase progress for ' + escape(name(t)) + '">+</button></div>';
}
function render() {
  $('shield').checked = shield;
  $('shield-state').textContent = shield ? 'ON' : 'OFF';
  $('percent').innerHTML = Math.round(earned.size / trophies.length * 100) + '<span>%</span>';
  $('earned-total').textContent = earned.size + ' / ' + trophies.length + ' earned';
  $('progress').value = earned.size;
  $('grade-counts').innerHTML = ['platinum','gold','silver','bronze'].map(g => '<div class="' + g + '">◇ ' + trophies.filter(t => t.grade === g && earned.has(t.id)).length + '/' + trophies.filter(t => t.grade === g).length + '<small>' + g + '</small></div>').join('');
  const query = $('search').value.trim().toLowerCase();
  const visible = trophies.filter(t => (kind === 'all' || (kind === 'missable' ? t.missable : kind === t.kind)) && (!$('missable').checked || t.missable) && ($('grade').value === 'all' || t.grade === $('grade').value) && ($('status').value === 'all' || earned.has(t.id) === ($('status').value === 'earned')) && (name(t) + ' ' + description(t)).toLowerCase().includes(query));
  const gradeOrder = {platinum:0, gold:1, silver:2, bronze:3};
  visible.sort((a,b) => {
    if ($('sort').value === 'grade') return gradeOrder[a.grade] - gradeOrder[b.grade] || a.id - b.id;
    if ($('sort').value === 'stage') return a.stage - b.stage || a.id - b.id;
    if ($('sort').value === 'name') return name(a).localeCompare(name(b)) || a.id - b.id;
    return a.id - b.id;
  });
  $('results').textContent = visible.length + ' / 55 trophies';
  $('rows').innerHTML = visible.length ? visible.map(t => '<article class="trophy-row ' + (earned.has(t.id) ? 'earned' : '') + '"><input type="checkbox" data-earned="' + t.id + '" aria-label="Mark ' + escape(name(t)) + ' earned" ' + (earned.has(t.id) ? 'checked' : '') + '>' + chip(t) + '<button class="trophy-open" data-detail="' + t.id + '"><span class="trophy-name">' + escape(name(t)) + '</span><span class="trophy-description">' + escape(description(t)) + '</span></button>' + counter(t) + (t.missable ? '<span class="missable-flag">MISSABLE</span>' : '') + '<span class="kind-tag">' + t.kind + '</span></article>').join('') : '<div class="empty"><p class="eyebrow">NO ENTRIES IN THIS VIEW</p><h3>' + (kind === 'missable' || $('missable').checked ? 'No missables established by the descriptions.' : kind === 'online' ? 'No online requirements stated.' : 'No trophies match these filters.') + '</h3><p>' + (kind === 'missable' || $('missable').checked ? 'This is not a guarantee of a missable-free platinum. One-time windows and replay rules remain unconfirmed. Review stage 2 of the roadmap before the finale.' : 'Try another category or clear your filters to return to the full ledger.') + '</p><button id="clear-filters">Clear filters</button></div>';
  $('stages').innerHTML = stageNames.map((title,i) => {
    const list = trophies.filter(t => t.stage === i+1);
    return '<article class="stage"><span class="stage-number">' + String(i+1).padStart(2,'0') + '</span><div><h3>' + title + '</h3><p>' + stageNotes[i] + '</p>' + (i===1 ? '<p class="warning">Missability unconfirmed · No supplied description establishes a one-time window.</p>' : '') + '<div class="stage-items">' + list.map(t => '<button data-detail="' + t.id + '">' + (earned.has(t.id) ? '✓ ' : '') + escape(name(t)) + (t.missable ? ' · MISSABLE' : '') + '</button>').join('') + '</div></div></article>';
  }).join('');
}
function openDetail(id, preserveFocus = false) {
  const t = trophies.find(t => t.id === id); if (!t) return;
  if (!preserveFocus) lastFocus = document.activeElement;
  activeDetail = id;
  $('detail-content').innerHTML = '<div class="detail-inner"><div class="detail-top"><span class="eyebrow">FIELD NOTES / ' + String(t.id).padStart(2,'0') + '</span><button id="close-detail" aria-label="Close trophy details">×</button></div>' + chip(t) + '<h2 id="detail-title">' + escape(name(t)) + '</h2><p class="description">' + escape(description(t)) + '</p><p class="detail-label">THE GUIDE</p><p class="guide-text">' + escape(hidden(t) ? 'Your spoiler shield is protecting this story entry. Turn it off in the ledger to read the full description and guide.' : t.guide) + '</p><p class="pre-release">Pre-release · Exact mechanics remain unconfirmed</p>' + (t.missable && !hidden(t) ? '<p class="warning">MISSABLE: ' + escape(t.missableNote) + '</p>' : '') + '<div class="detail-stage">STAGE ' + t.stage + ' / ' + stageNames[t.stage-1] + '</div><p class="detail-label">SOURCE REFERENCES</p><p class="source-names">' + t.sources.map(escape).join(' · ') + '</p><p class="source-names">Reference labels from the supplied list; not independently verified. See Sources & method.</p>' + counter(t) + '<label class="detail-earned"><input type="checkbox" data-earned="' + t.id + '" ' + (earned.has(t.id) ? 'checked' : '') + '> Mark as earned</label></div>';
  if (!$('detail').open) $('detail').showModal();
}
function setView(view) {
  if (!['checklist','roadmap','sources'].includes(view)) view='checklist';
  document.body.dataset.view = view;
  document.querySelectorAll('.view').forEach(el => { el.hidden = el.id !== view; });
  document.querySelectorAll('[data-view]').forEach(el => { el.classList.toggle('active',el.dataset.view===view); el.setAttribute('aria-current',el.dataset.view===view?'page':'false'); });
}
function resetFilters() {
  kind='all'; $('search').value=''; $('grade').value='all'; $('status').value='all'; $('missable').checked=false;
  document.querySelectorAll('[data-kind]').forEach(el => { el.classList.toggle('active',el.dataset.kind==='all'); el.setAttribute('aria-pressed',String(el.dataset.kind==='all')); }); render();
}
document.addEventListener('click', e => {
  const button=e.target.closest('button'); if (!button) return;
  if (button.dataset.detail) openDetail(Number(button.dataset.detail));
  if (button.dataset.view) setView(button.dataset.view);
  if (button.dataset.kind) {
    kind=button.dataset.kind;
    document.querySelectorAll('[data-kind]').forEach(el => { el.classList.toggle('active',el===button); el.setAttribute('aria-pressed',String(el===button)); }); render();
  }
  if (button.dataset.count) {
    const id=Number(button.dataset.count), t=trophies.find(t=>t.id===id);
    counts[id]=Math.max(0,Math.min(t.count,(counts[id]||0)+Number(button.dataset.step))); save(); render();
    if ($('detail').open) openDetail(activeDetail,true);
    const scope=$('detail').open ? $('detail') : $('rows');
    scope.querySelector('[data-count="' + id + '"][data-step="' + button.dataset.step + '"]')?.focus();
  }
  if (button.id==='clear-filters') resetFilters();
  if (button.id==='close-detail') $('detail').close();
});
document.addEventListener('change', e => {
  if (e.target.dataset.earned) {
    const id=Number(e.target.dataset.earned);
    e.target.checked ? earned.add(id) : earned.delete(id);
    save(); render();
    if ($('detail').open) { openDetail(activeDetail,true); $('detail').querySelector('[data-earned]')?.focus(); }
    else $('rows').querySelector('[data-earned="' + id + '"]')?.focus();
  }
});
$('detail').addEventListener('close',()=>{ activeDetail=null; lastFocus?.focus(); });
$('detail').addEventListener('click',e=>{if(e.target===$('detail')) $('detail').close();});
$('shield').addEventListener('change',()=>{shield=$('shield').checked;save();render();});
['grade','status','missable'].forEach(id=>$(id).addEventListener('change',render));
$('search').addEventListener('input',render);
$('export').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,earned:[...earned],counts,shield},null,2)],{type:'application/json'}));
  const a=document.createElement('a'); a.href=url;a.download='leonida-ledger-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Progress exported. Keep this file as your backup.');
});
$('import').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try {
    if(file.size>1000000)throw Error('Backup is too large.');
    const data=validate(JSON.parse(await file.text()));
    earned=data.earned;counts=data.counts;shield=data.shield;save();render();message('Progress imported. Your ledger is up to date.');
  } catch(error) {message('Import failed: '+error.message+' Your progress was not changed.');}
  e.target.value='';
});
try {
  const response=await fetch('data/trophies.json');if(!response.ok)throw Error('Trophy data could not be loaded.');
  trophies=(await response.json()).trophies;
  try {
    const saved=localStorage.getItem(KEY);
    if(saved){const data=validate(JSON.parse(saved));earned=data.earned;counts=data.counts;shield=data.shield;}
    else {const legacy=JSON.parse(localStorage.getItem('gta6-trophy-checklist')||'[]');if(Array.isArray(legacy))earned=new Set(trophies.filter(t=>legacy.includes(t.name)).map(t=>t.id));}
  } catch {message('Saved progress could not be read. You can restore an exported backup.');}
  if(params.get('filter')==='missable')$('missable').checked=true;
  render();setView(params.get('view')||'checklist');
  if(params.has('detail'))openDetail(Number(params.get('detail')));
} catch(error) {message(error.message+' Serve the app with node serve.ts and reload.');}
