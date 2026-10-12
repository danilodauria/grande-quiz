(function(){
"use strict";

/* ---------------------------------------------------------- data ---------------------------------------------------------- */
var SLIDES_DATA = JSON.parse(document.getElementById('slides-data').textContent);
var QUIZ_DATA = JSON.parse(document.getElementById('quiz-data').textContent);

var COLORS = { green:'#3f7a4f', warm:'#d9752f', blue:'#2f6b8f', purple:'#7a4f9e', gold:'#c78a2e', terracotta:'#b5533c' };
var TEAM_COLOR_CYCLE = ['warm','blue','green','purple','terracotta','gold'];
var LEVELS = ['Livello Base','Livello Intermedio','Livello Esperto'];

/* ---------------------------------------------------------- safe storage ---------------------------------------------------------- */
function storeGet(key, fallback){
  try{ var v = localStorage.getItem(key); return v===null ? fallback : JSON.parse(v); }
  catch(e){ return fallback; }
}
function storeSet(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){ /* offline / private mode: ignore */ }
}

/* ---------------------------------------------------------- small helpers ---------------------------------------------------------- */
function $(sel){ return document.querySelector(sel); }
function el(tag, attrs, children){
  var n = document.createElement(tag);
  attrs = attrs || {};
  for(var k in attrs){
    if(attrs[k] == null) continue;
    if(k === 'class') n.className = attrs[k];
    else if(k === 'html') n.innerHTML = attrs[k];
    else if(k === 'text') n.textContent = attrs[k];
    else if(k.indexOf('on') === 0 && typeof attrs[k] === 'function') n.addEventListener(k.slice(2), attrs[k]);
    else n.setAttribute(k, attrs[k]);
  }
  (children||[]).forEach(function(c){ if(c) n.appendChild(c); });
  return n;
}
function shuffle(arr){
  var a = arr.slice();
  for(var i=a.length-1;i>0;i--){
    var j = Math.floor(Math.random()*(i+1));
    var tmp=a[i]; a[i]=a[j]; a[j]=tmp;
  }
  return a;
}

var PHOENIX_SVG = '__PHOENIX_SVG__';

/* ============================================================ THEME / A11Y ============================================================ */
var a11y = storeGet('feniceos-pres-a11y', {theme:'light', contrast:'normal'});
function applyA11y(){
  document.body.parentElement.setAttribute('data-theme', a11y.theme);
  if(a11y.contrast === 'high') document.body.parentElement.setAttribute('data-contrast','high');
  else document.body.parentElement.removeAttribute('data-contrast');
}
applyA11y();
$('#btnTheme').addEventListener('click', function(){
  a11y.theme = (a11y.theme === 'dark') ? 'light' : 'dark';
  storeSet('feniceos-pres-a11y', a11y); applyA11y();
});
$('#btnContrast').addEventListener('click', function(){
  a11y.contrast = (a11y.contrast === 'high') ? 'normal' : 'high';
  storeSet('feniceos-pres-a11y', a11y); applyA11y();
});
$('#btnFullscreen').addEventListener('click', function(){ toggleFullscreen(); });
function toggleFullscreen(){
  try{
    if(!document.fullscreenElement){ document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
    else{ document.exitFullscreen && document.exitFullscreen(); }
  }catch(e){ /* fullscreen not supported: ignore */ }
}

/* ============================================================ SCREEN ROUTER ============================================================ */
var screens = ['menu','slides','quizsetup','quizplay','quizresults'];
function showScreen(name){
  screens.forEach(function(s){
    var node = $('#screen-'+s);
    if(node) node.classList.toggle('hidden', s!==name);
  });
  $('#tocOverlay').classList.add('hidden');
  window.scrollTo(0,0);
}

/* ============================================================ SLIDE DECK ============================================================ */
var deck = [];
(function buildDeck(){
  deck.push({type:'cover'});
  deck.push({type:'agenda'});
  SLIDES_DATA.parts.forEach(function(part){
    deck.push({type:'part', part:part});
    part.chapters.forEach(function(num){
      var ch = SLIDES_DATA.chapters.filter(function(c){ return c.num===num; })[0];
      if(ch) deck.push({type:'chapter', ch:ch});
    });
  });
  deck.push({type:'transition'});
})();
var slideIdx = 0;

function partColorHex(letter){ return COLORS[letter] || COLORS.warm; }

function renderSlide(i){
  if(i<0) i=0; if(i>=deck.length) i=deck.length-1;
  slideIdx = i;
  var s = deck[i];
  var stage = $('#slideStage');
  stage.innerHTML = '';
  var node;

  if(s.type === 'cover'){
    node = el('div',{class:'slide cover'},[
      el('div',{class:'menu-phoenix', html: PHOENIX_SVG}),
      el('h1',{text: SLIDES_DATA.meta.title}),
      el('div',{class:'sub', text: SLIDES_DATA.meta.subtitle}),
      el('div',{class:'auth', text: 'A cura di ' + SLIDES_DATA.meta.author})
    ]);
  } else if(s.type === 'agenda'){
    var ul = el('ul',{class:'agenda-list'});
    SLIDES_DATA.parts.forEach(function(part){
      var hex = partColorHex(part.color);
      ul.appendChild(el('li',{},[
        el('span',{class:'agenda-roman', style:'background:'+hex, text: part.roman}),
        el('span',{text: part.title})
      ]));
    });
    node = el('div',{class:'slide'},[
      el('h1',{class:'slide-title', text:'Percorso della lezione'}),
      ul
    ]);
  } else if(s.type === 'part'){
    var hex = partColorHex(s.part.color);
    var chlist = el('div',{class:'part-chapterlist'});
    s.part.chapters.forEach(function(num){
      var ch = SLIDES_DATA.chapters.filter(function(c){ return c.num===num; })[0];
      if(ch) chlist.appendChild(el('span',{text:'Cap. '+num+' — '+ch.title}));
    });
    node = el('div',{class:'slide part'},[
      el('div',{class:'part-roman-big', style:'background:'+hex, text:s.part.roman}),
      el('h1',{text: 'Parte '+s.part.roman+' — '+s.part.title}),
      chlist
    ]);
  } else if(s.type === 'chapter'){
    var ch = s.ch; var hex = partColorHex(ch.color);
    var ul2 = el('ul',{class:'slide-bullets'});
    ch.bullets.forEach(function(b){ ul2.appendChild(el('li',{text:b})); });
    node = el('div',{class:'slide', style:'--accent:'+hex},[
      el('span',{class:'slide-eyebrow', style:'background:'+hex, text:'Capitolo '+ch.num}),
      el('h1',{class:'slide-title', text: ch.title}),
      ul2,
      el('div',{class:'slide-callout', text: ch.callout})
    ]);
  } else if(s.type === 'transition'){
    node = el('div',{class:'slide transition'},[
      el('h1',{text:'Ora mettiamoci alla prova'}),
      el('p',{text:'264 domande, quattro parti, tre livelli di difficoltà: passiamo alla modalità Quiz a Squadre per coinvolgere tutta l\'aula.'}),
      el('button',{onclick:function(){ showScreen('quizsetup'); }, text:'Vai al Quiz a Squadre →'})
    ]);
  }
  stage.appendChild(node);

  $('#progressLabel').textContent = (i+1)+'/'+deck.length;
  $('#progressFill').style.width = (((i+1)/deck.length)*100).toFixed(1)+'%';
  $('#btnPrev').disabled = (i===0);
  $('#btnNext').disabled = (i===deck.length-1);
}

function slideNext(){ if(slideIdx < deck.length-1) renderSlide(slideIdx+1); }
function slidePrev(){ if(slideIdx > 0) renderSlide(slideIdx-1); }

$('#btnNext').addEventListener('click', slideNext);
$('#btnPrev').addEventListener('click', slidePrev);
$('#zoneLeft').addEventListener('click', slidePrev);
$('#zoneRight').addEventListener('click', slideNext);
$('#btnGoSlides').addEventListener('click', function(){ showScreen('slides'); renderSlide(slideIdx); });
$('#btnMenuFromSlides').addEventListener('click', function(){ showScreen('menu'); });

/* --- table of contents drawer --- */
function buildToc(){
  var list = $('#tocList'); list.innerHTML = '';
  deck.forEach(function(s, i){
    var label, hex = COLORS.warm;
    if(s.type==='cover') label = 'Copertina';
    else if(s.type==='agenda') label = 'Percorso della lezione';
    else if(s.type==='part'){ label = 'Parte '+s.part.roman+' — '+s.part.title; hex = partColorHex(s.part.color); }
    else if(s.type==='chapter'){ label = 'Cap. '+s.ch.num+' — '+s.ch.title; hex = partColorHex(s.ch.color); }
    else if(s.type==='transition') label = 'Verso il quiz';
    list.appendChild(el('div',{class:'toc-item', onclick:function(){ renderSlide(i); $('#tocOverlay').classList.add('hidden'); }},[
      el('span',{class:'dot', style:'background:'+hex}),
      el('span',{text:label})
    ]));
  });
}
$('#btnToc').addEventListener('click', function(){ buildToc(); $('#tocOverlay').classList.remove('hidden'); });
$('#tocClose').addEventListener('click', function(){ $('#tocOverlay').classList.add('hidden'); });
$('#tocOverlay').addEventListener('click', function(e){ if(e.target.id==='tocOverlay') $('#tocOverlay').classList.add('hidden'); });

/* ============================================================ QUIZ SETUP ============================================================ */
var savedTeams = storeGet('feniceos-pres-teams', {count:2, names:['Squadra 1','Squadra 2']});
var teamCount = Math.min(6, Math.max(2, savedTeams.count||2));
var teamNames = savedTeams.names && savedTeams.names.length ? savedTeams.names.slice() : ['Squadra 1','Squadra 2'];
while(teamNames.length < 6) teamNames.push('Squadra '+(teamNames.length+1));

var filterPart = 'tutte';     // 'tutte' | 'I' | 'II' | 'III' | 'IV'
var filterLevel = 'tutti';    // 'tutti' | one of LEVELS
var filterCount = 20;         // number of questions, or 'tutte'

function renderTeamRows(){
  var wrap = $('#teamRows'); wrap.innerHTML = '';
  for(var i=0;i<teamCount;i++){
    (function(i){
      var hex = COLORS[TEAM_COLOR_CYCLE[i % TEAM_COLOR_CYCLE.length]];
      var input = el('input',{type:'text', value: teamNames[i], maxlength:'24'});
      input.addEventListener('input', function(){ teamNames[i] = input.value || ('Squadra '+(i+1)); });
      wrap.appendChild(el('div',{class:'team-row'},[
        el('span',{class:'swatch', style:'background:'+hex}),
        input
      ]));
    })(i);
  }
  $('#teamCountLabel').textContent = teamCount + (teamCount===1 ? ' squadra' : ' squadre');
}
$('#teamMinus').addEventListener('click', function(){ if(teamCount>2){ teamCount--; renderTeamRows(); } });
$('#teamPlus').addEventListener('click', function(){ if(teamCount<6){ teamCount++; renderTeamRows(); } });
renderTeamRows();

function renderChips(containerSel, options, current, onPick){
  var wrap = $(containerSel); wrap.innerHTML = '';
  options.forEach(function(opt){
    var btn = el('button',{class:'chip'+(opt.value===current?' active':''), text: opt.label, type:'button'});
    btn.addEventListener('click', function(){ onPick(opt.value); });
    wrap.appendChild(btn);
  });
}
function refreshSetupChips(){
  renderChips('#partChips', [
    {value:'tutte', label:'Tutte le parti ('+QUIZ_DATA.questions.length+')'}
  ].concat(QUIZ_DATA.parts.map(function(p){ return {value:p.roman, label:'Parte '+p.roman+' — '+p.title}; })),
  filterPart, function(v){ filterPart=v; refreshSetupChips(); });

  renderChips('#levelChips', [{value:'tutti', label:'Tutti i livelli'}].concat(LEVELS.map(function(l){
    return {value:l, label:l.replace('Livello ','')};
  })), filterLevel, function(v){ filterLevel=v; refreshSetupChips(); });

  var pool = filteredPool();
  var countOptions = [10,20,30].filter(function(n){ return n < pool.length; })
    .map(function(n){ return {value:n, label:String(n)}; });
  countOptions.push({value:'tutte', label:'Tutte ('+pool.length+')'});
  if(filterCount !== 'tutte' && filterCount >= pool.length) filterCount = 'tutte';
  renderChips('#countChips', countOptions, filterCount, function(v){ filterCount=v; refreshSetupChips(); });
}

function filteredPool(){
  return QUIZ_DATA.questions.filter(function(q){
    if(filterLevel !== 'tutti' && q.section !== filterLevel) return false;
    if(filterPart !== 'tutte'){
      var part = QUIZ_DATA.parts.filter(function(p){
        return p.chapters.some(function(c){ return c.num===q.chapter; });
      })[0];
      if(!part || part.roman !== filterPart) return false;
    }
    return true;
  });
}
refreshSetupChips();

$('#btnMenuFromSetup').addEventListener('click', function(){ showScreen('menu'); });
$('#btnGoQuiz').addEventListener('click', function(){ showScreen('quizsetup'); });

/* ============================================================ QUIZ PLAY ============================================================ */
var teams = [];         // [{name, score, color}]
var queue = [];         // question queue for this session
var qIndex = 0;
var revealed = false;

function partRomanOf(q){
  var part = QUIZ_DATA.parts.filter(function(p){ return p.chapters.some(function(c){ return c.num===q.chapter; }); })[0];
  return part ? part.roman : '';
}

$('#btnStartQuiz').addEventListener('click', function(){
  teams = [];
  for(var i=0;i<teamCount;i++){
    teams.push({ name: teamNames[i] || ('Squadra '+(i+1)), score:0, color: COLORS[TEAM_COLOR_CYCLE[i % TEAM_COLOR_CYCLE.length]] });
  }
  storeSet('feniceos-pres-teams', {count:teamCount, names:teamNames.slice(0,teamCount)});

  var pool = shuffle(filteredPool());
  var n = (filterCount === 'tutte') ? pool.length : Math.min(filterCount, pool.length);
  queue = pool.slice(0, n);
  qIndex = 0;
  if(queue.length === 0){
    alert('Nessuna domanda disponibile con questi filtri: allarga la selezione.');
    return;
  }
  showScreen('quizplay');
  renderScoreboard();
  renderQuestion();
});

function renderScoreboard(){
  var bar = $('#scoreboard'); bar.innerHTML = '';
  teams.forEach(function(t, idx){
    var scoreSpan = el('span',{class:'score', text:String(t.score), style:'color:'+t.color});
    var plus = el('button',{class:'plus', text:'+', title:'Assegna punto a '+t.name});
    var minus = el('button',{class:'minus', text:'−', title:'Togli punto a '+t.name});
    plus.addEventListener('click', function(){ t.score++; scoreSpan.textContent = t.score; });
    minus.addEventListener('click', function(){ t.score=Math.max(0,t.score-1); scoreSpan.textContent = t.score; });
    bar.appendChild(el('div',{class:'team-pill', style:'border-color:'+t.color},[
      el('span',{class:'name', text: t.name, style:'color:'+t.color}),
      scoreSpan, plus, minus
    ]));
  });
}

function renderQuestion(){
  revealed = false;
  var q = queue[qIndex];
  var hex = partColorHex({I:'green',II:'warm',III:'blue',IV:'purple'}[partRomanOf(q)] || 'warm');
  $('#quizTag').textContent = 'Cap. '+q.chapter+' · '+q.section;
  $('#quizTag').style.background = hex;
  $('#quizCounter').textContent = 'Domanda '+(qIndex+1)+' di '+queue.length;
  $('#qstem').textContent = q.stem.replace(/<[^>]+>/g,'');
  $('#qexplain').classList.add('hidden');
  $('#qexplain').textContent = '';

  var opts = $('#qoptions'); opts.innerHTML = '';
  if(q.type === 'mc'){
    var grid = el('div',{class:'opts-grid'});
    var letters = ['A','B','C','D'];
    q.options.forEach(function(optText, i){
      var letter = letters[i];
      var row = el('div',{class:'opt', 'data-letter':letter},[
        el('span',{class:'optlet', text:letter}),
        el('span',{text: optText.replace(/<[^>]+>/g,'')}),
        el('span',{class:'check'})
      ]);
      grid.appendChild(row);
    });
    opts.appendChild(grid);
  } else {
    var vfgrid = el('div',{class:'vf-grid'});
    ['Vero','Falso'].forEach(function(label){
      vfgrid.appendChild(el('div',{class:'vfbtn', 'data-letter':label},[
        el('span',{text:label}), el('span',{class:'check'})
      ]));
    });
    opts.appendChild(vfgrid);
  }

  $('#btnReveal').classList.remove('hidden');
  $('#btnNextQ').classList.add('hidden');
}

function revealAnswer(){
  if(revealed) return;
  revealed = true;
  var q = queue[qIndex];
  var correct = q.correct;
  var nodes = document.querySelectorAll('#qoptions .opt, #qoptions .vfbtn');
  nodes.forEach(function(n){
    var letter = n.getAttribute('data-letter');
    var isCorrect = (q.type==='mc') ? (letter===correct) : (letter===correct);
    if(isCorrect){ n.classList.add('correct'); n.querySelector('.check').textContent = '✓'; }
    else{ n.classList.add('wrong-dim'); }
  });
  if(q.explain){
    var ex = $('#qexplain');
    ex.textContent = q.explain.replace(/<[^>]+>/g,'');
    ex.classList.remove('hidden');
  }
  $('#btnReveal').classList.add('hidden');
  $('#btnNextQ').classList.remove('hidden');
}

function nextQuestion(){
  if(qIndex < queue.length-1){ qIndex++; renderQuestion(); }
  else{ showResults(); }
}

$('#btnReveal').addEventListener('click', revealAnswer);
$('#btnNextQ').addEventListener('click', nextQuestion);
$('#btnMenuFromQuiz').addEventListener('click', function(){ showScreen('menu'); });

/* ============================================================ RESULTS ============================================================ */
function showResults(){
  showScreen('quizresults');
  var sorted = teams.slice().sort(function(a,b){ return b.score-a.score; });
  var max = Math.max(1, sorted[0] ? sorted[0].score : 1);
  var pod = $('#podium'); pod.innerHTML = '';
  sorted.forEach(function(t, i){
    var h = 60 + Math.round((t.score/max)*160);
    pod.appendChild(el('div',{class:'podium-col'},[
      el('div',{class:'podium-bar', style:'height:'+h+'px; background:'+t.color, text: (i===0?'🏆 ':'') + '#'+(i+1)}),
      el('div',{class:'podium-name', text: t.name}),
      el('div',{class:'podium-score', text: t.score + (t.score===1?' punto':' punti')})
    ]));
  });
}
$('#btnReplay').addEventListener('click', function(){ showScreen('quizsetup'); refreshSetupChips(); });
$('#btnResultsMenu').addEventListener('click', function(){ showScreen('menu'); });

/* ============================================================ KEYBOARD SHORTCUTS ============================================================ */
document.addEventListener('keydown', function(e){
  var slidesVisible = !$('#screen-slides').classList.contains('hidden');
  var quizVisible = !$('#screen-quizplay').classList.contains('hidden');
  if(e.key === 'Escape'){
    if(!$('#tocOverlay').classList.contains('hidden')){ $('#tocOverlay').classList.add('hidden'); return; }
    showScreen('menu'); return;
  }
  if(e.key === 'f' || e.key === 'F'){ toggleFullscreen(); return; }
  if(slidesVisible){
    if(e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); slideNext(); }
    else if(e.key === 'ArrowLeft'){ slidePrev(); }
    else if(e.key === 'Home'){ renderSlide(0); }
    else if(e.key === 'End'){ renderSlide(deck.length-1); }
  }
  if(quizVisible){
    if(e.key === ' ' || e.key === 'Enter'){
      e.preventDefault();
      if(!revealed) revealAnswer(); else nextQuestion();
    } else if(/^[1-6]$/.test(e.key)){
      var idx = parseInt(e.key,10)-1;
      if(teams[idx]){ teams[idx].score++; renderScoreboard(); }
    }
  }
});

/* ============================================================ INIT ============================================================ */
$('#kbdHint').innerHTML = '<kbd>&larr;</kbd> <kbd>&rarr;</kbd> naviga &nbsp; <kbd>Spazio</kbd> avanti/rivela &nbsp; <kbd>1-6</kbd> punto squadra &nbsp; <kbd>F</kbd> schermo intero &nbsp; <kbd>Esc</kbd> menu';
showScreen('menu');

})();
