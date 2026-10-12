(function(){
"use strict";

/* ------------------------------------------------------------------ data */
var DATA = JSON.parse(document.getElementById('quiz-data').textContent);
var QUESTIONS = DATA.questions;
var BY_ID = {};
QUESTIONS.forEach(function(q){ BY_ID[q.n] = q; });
var LEVELS = ["Livello Base","Livello Intermedio","Livello Esperto"];
var PART_COLOR = {1:'green',2:'orange',3:'blue',4:'purple'};

/* ------------------------------------------------------------- storage */
var STORE_KEY = 'feniceos_quiz_progress_v1';
var SETTINGS_KEY = 'feniceos_quiz_settings_v1';
var progress = {};   // { "37": {answered:true, correct:true, chosen:"B"} }
var settings = { fontStep: 0, contrast: 'normal' };

function loadStorage(){
  try{
    var p = localStorage.getItem(STORE_KEY);
    if(p) progress = JSON.parse(p);
  }catch(e){ progress = {}; }
  try{
    var s = localStorage.getItem(SETTINGS_KEY);
    if(s) settings = Object.assign(settings, JSON.parse(s));
  }catch(e){ /* ignore: localStorage may be unavailable (private mode, file://) */ }
}
function saveProgress(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(progress)); }catch(e){}
}
function saveSettings(){
  try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }catch(e){}
}

/* -------------------------------------------------------------- helpers */
function $(sel, root){ return (root||document).querySelector(sel); }
function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
function el(tag, attrs, children){
  var e = document.createElement(tag);
  attrs = attrs || {};
  for(var k in attrs){
    if(attrs[k] == null) continue; // salta null/undefined (es. disabled condizionale)
    if(k === 'class') e.className = attrs[k];
    else if(k === 'html') e.innerHTML = attrs[k];
    else if(k.indexOf('on') === 0 && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  (children||[]).forEach(function(c){
    if(c == null) return;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return e;
}
function questionsFor(chapterNum, level){
  return QUESTIONS.filter(function(q){ return q.chapter === chapterNum && q.section === level; })
                  .sort(function(a,b){ return a.n - b.n; });
}
function chapterScore(chapterNum, level){
  var qs = questionsFor(chapterNum, level);
  var answered = 0, correct = 0;
  qs.forEach(function(q){
    var st = progress[q.n];
    if(st && st.answered){ answered++; if(st.correct) correct++; }
  });
  return {total: qs.length, answered: answered, correct: correct};
}
function partScore(partNum){
  var chs = DATA.parts.filter(function(p){return p.num===partNum;})[0].chapters;
  var answered=0, correct=0, total=0;
  chs.forEach(function(ch){
    LEVELS.forEach(function(lv){
      var s = chapterScore(ch.num, lv);
      total += s.total; answered += s.answered; correct += s.correct;
    });
  });
  return {total:total, answered:answered, correct:correct};
}
function globalScore(){
  var answered=0, correct=0;
  QUESTIONS.forEach(function(q){
    var st = progress[q.n];
    if(st && st.answered){ answered++; if(st.correct) correct++; }
  });
  return {total: QUESTIONS.length, answered: answered, correct: correct};
}
function toast(msg){
  var t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._tm);
  toast._tm = setTimeout(function(){ t.classList.remove('show'); }, 2200);
}

/* ---------------------------------------------------------------- icons */
var ICONS = {
  home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  cross: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  shuffle: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>'
};
function phoenixSVG(size){
  size = size || 64;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 120 120" aria-hidden="true">' +
    '<circle cx="60" cy="60" r="58" fill="#f7cd8a"/>' +
    '<g fill="none" stroke="#c9812f" stroke-width="4" stroke-linecap="round">' +
    '<path d="M60 40 L20 30 M60 40 L18 45 M60 40 L20 60 M60 40 L22 75 M60 40 L28 88"/>' +
    '<path d="M60 40 L100 30 M60 40 L102 45 M60 40 L100 60 M60 40 L98 75 M60 40 L92 88"/>' +
    '</g>' +
    '<path d="M60 34 C50 34 44 44 44 56 C44 72 52 84 60 96 C68 84 76 72 76 56 C76 44 70 34 60 34 Z" fill="#e8973c"/>' +
    '<path d="M60 30 L54 22 L60 18 L66 22 Z" fill="#e8973c"/>' +
    '<circle cx="57" cy="30" r="1.6" fill="#1b3a4b"/>' +
    '</svg>';
}

/* ---------------------------------------------------------------- views */
var main = $('#main');
var state = { view:'home', chapter:null, level:null, list:[], idx:0, mode:'level', sessionScore:0 };

function render(){
  window.scrollTo(0,0);
  main.innerHTML = '';
  main.className = 'view';
  if(state.view === 'home') renderHome();
  else if(state.view === 'quiz') renderQuiz();
  else if(state.view === 'results') renderResults();
  updateA11yButtons();
}

function renderHome(){
  var g = globalScore();
  var hero = el('div',{class:'hero'},[
    (function(){ var d=document.createElement('div'); d.innerHTML=phoenixSVG(84); return d.firstChild; })(),
    el('h1',{},[ 'Il Grande Quiz ', el('span',{class:'accent',html:"dell'Informatica"}) ]),
    el('p',{}, [DATA.subtitle]),
    el('div',{class:'stats'},[
      el('div',{class:'stat-pill'}, [g.answered+"/"+g.total, el('span',{},[' risposte date'])]),
      el('div',{class:'stat-pill'}, [ (g.answered? Math.round(100*g.correct/g.answered):0)+"%", el('span',{},[' corrette finora'])])
    ])
  ]);
  main.appendChild(hero);

  var modeRow = el('div',{class:'mode-row'},[
    el('button',{class:'bigbtn', html: ICONS.shuffle+' Allenamento casuale (20 domande da tutto il libro)', onclick:startRandomQuiz}),
    el('button',{class:'bigbtn ghost ' + ( (g.answered>0) ? '' : 'hidden'), onclick:confirmReset}, ['Azzera i progressi salvati'])
  ]);
  main.appendChild(modeRow);

  DATA.parts.forEach(function(part){
    var color = PART_COLOR[part.num];
    var ps = partScore(part.num);
    var block = el('div',{class:'part-block'});
    var head = el('div',{class:'part-head', style:'background:var(--'+color+')'},[
      el('div',{class:'roman'},[part.roman]),
      el('div',{},[
        el('h2',{},[part.title]),
        el('p',{},[part.desc])
      ]),
      el('div',{class:'part-progress'},[
        el('b',{},[ps.answered+'/'+ps.total]),
        'risposte'
      ])
    ]);
    block.appendChild(head);
    part.chapters.forEach(function(ch){
      var row = el('div',{class:'chapter-row'});
      row.appendChild(el('h3',{},['Capitolo '+ch.num+' — '+ch.title]));
      var lrow = el('div',{class:'level-row'});
      LEVELS.forEach(function(lv){
        var s = chapterScore(ch.num, lv);
        var cls = 'level-btn';
        var scoreTxt = s.total+' domande';
        if(s.answered>0){
          scoreTxt = s.correct+'/'+s.answered+' corrette ('+s.answered+'/'+s.total+' fatte)';
          cls += (s.answered>=s.total) ? ' done' : ' inprogress';
        }
        lrow.appendChild(el('button',{class:cls, onclick:(function(chn,lvv){ return function(){ startChapterQuiz(chn,lvv); }; })(ch.num, lv)},[
          el('span',{class:'lname'},[lv.replace('Livello ','')]),
          el('span',{class:'lscore'},[scoreTxt])
        ]));
      });
      row.appendChild(lrow);
      block.appendChild(row);
    });
    main.appendChild(block);
  });

  main.appendChild(el('footer',{},[
    "Il Grande Quiz dell'Informatica — un progetto FeniceOS di " + DATA.author + ". Versione interattiva offline, nessuna connessione richiesta."
  ]));
}

function startChapterQuiz(chapterNum, level){
  var list = questionsFor(chapterNum, level);
  state.view='quiz'; state.mode='level'; state.chapter=chapterNum; state.level=level;
  state.list = list.map(function(q){return q.n;}); state.idx = 0; state.sessionScore = 0;
  render();
}
function startRandomQuiz(){
  var pool = QUESTIONS.map(function(q){return q.n;});
  for(var i=pool.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
  state.view='quiz'; state.mode='random'; state.chapter=null; state.level=null;
  state.list = pool.slice(0,20); state.idx=0; state.sessionScore=0;
  render();
}
function confirmReset(){
  if(window.confirm('Vuoi davvero cancellare tutti i progressi e i punteggi salvati su questo dispositivo?')){
    progress = {}; saveProgress(); toast('Progressi azzerati.'); render();
  }
}

function renderQuiz(){
  var qn = state.list[state.idx];
  var q = BY_ID[qn];
  var chTitle = state.mode==='random' ? 'Allenamento casuale' : ('Capitolo '+q.chapter+' — '+q.chapter_title);
  var sub = state.mode==='random' ? ('Domanda casuale D'+q.n) : (q.section);

  var header = el('div',{id:'quizHeader'},[
    el('button',{class:'backbtn', onclick:function(){ state.view='home'; render(); }},['← Indice']),
    el('div',{class:'qtitle'},[chTitle, el('small',{},[sub])]),
    el('div',{id:'scoreLive'},[ 'Punteggio sessione: '+state.sessionScore+'/'+state.idx ])
  ]);
  main.appendChild(header);

  var pct = Math.round(100*state.idx/state.list.length);
  main.appendChild(el('div',{class:'progressbar'},[ el('div',{style:'width:'+pct+'%'}) ]));

  var card = el('div',{class:'qcard'});
  card.appendChild(el('div',{class:'qnum-badge'},['D'+q.n]));
  if(q.type==='open') card.appendChild(el('span',{class:'qtag'},['domanda aperta']));
  card.appendChild(el('div',{class:'qstem', html:q.stem}));

  var st = progress[q.n];
  var answered = !!(st && st.answered);

  if(q.type === 'mc'){
    var opts = el('div',{class:'opts'});
    var letters = ['A','B','C','D'];
    letters.forEach(function(L, i){
      var btn = el('button',{class:'optbtn', disabled: answered ? 'disabled': null},[
        el('span',{class:'optlet'},[L+')']),
        el('span',{html:q.options[i]})
      ]);
      if(answered){
        if(L === q.correct) btn.classList.add('correct');
        else if(st.chosen === L) btn.classList.add('wrong');
        else btn.classList.add('dim');
      }
      btn.addEventListener('click', function(){ answerQuestion(q, L); });
      opts.appendChild(btn);
    });
    card.appendChild(opts);
  } else if(q.type === 'vf'){
    var row = el('div',{class:'vfrow'});
    ['Vero','Falso'].forEach(function(L){
      var btn = el('button',{class:'optbtn', disabled: answered ? 'disabled': null},[L]);
      if(answered){
        if(L === q.correct) btn.classList.add('correct');
        else if(st.chosen === L) btn.classList.add('wrong');
        else btn.classList.add('dim');
      }
      btn.addEventListener('click', function(LL){ return function(){ answerQuestion(q, LL); }; }(L));
      row.appendChild(btn);
    });
    card.appendChild(row);
  } else if(!answered){
    // domanda aperta: nessuna scelta multipla, si mostra direttamente lo spunto di risposta
    var showBtn = el('button',{class:'bigbtn secondary', style:'margin-top:.4rem;'},['Mostra la traccia di risposta']);
    showBtn.addEventListener('click', function(){ answerQuestion(q, 'OPEN'); });
    card.appendChild(showBtn);
  }

  if(answered){
    var isCorrect = st.correct;
    var fb = el('div',{class:'feedback '+(isCorrect?'ok':'bad')},[
      el('div',{class:'ficon', html: isCorrect?ICONS.check:ICONS.cross}),
      el('div',{},[
        el('b',{},[isCorrect ? 'Esatto!' : (q.type==='open' ? 'Traccia di risposta' : 'Non esatto')]),
        el('div',{html:q.explain})
      ])
    ]);
    card.appendChild(fb);
  }

  main.appendChild(card);

  var actions = el('div',{class:'qactions'},[
    el('button',{class:'navbtn prev', disabled: state.idx===0?'disabled':null, onclick:function(){ state.idx--; render(); }},['← Precedente']),
    el('button',{class:'navbtn', disabled: answered? null : 'disabled', onclick:nextQuestion},[
      state.idx === state.list.length-1 ? 'Vedi risultati →' : 'Prossima domanda →'
    ])
  ]);
  main.appendChild(actions);
}
function answerQuestion(q, chosen){
  var correct;
  if(q.type === 'open') correct = true;
  else correct = (chosen === q.correct);
  var already = progress[q.n] && progress[q.n].answered;
  progress[q.n] = {answered:true, correct:correct, chosen:chosen};
  saveProgress();
  if(!already && correct) state.sessionScore++;
  render();
}
function nextQuestion(){
  if(state.idx < state.list.length-1){ state.idx++; render(); }
  else { state.view='results'; render(); }
}

function renderResults(){
  var total = state.list.length;
  var correct = 0;
  var wrongList = [];
  state.list.forEach(function(qn){
    var st = progress[qn];
    if(st && st.correct) correct++;
    else wrongList.push(qn);
  });
  var pct = total? Math.round(100*correct/total) : 0;
  var title = state.mode==='random' ? 'Allenamento casuale completato' :
              ('Capitolo '+state.chapter+' — '+state.level+' completato');

  main.appendChild(el('div',{class:'results-hero'},[
    el('h1',{},[title]),
    el('div',{class:'score-circle'},[
      el('b',{},[correct+'/'+total]),
      el('span',{},[pct+'% corrette'])
    ]),
    el('p',{},[ pct>=80 ? 'Ottimo lavoro! Padronanza solida su questo argomento.' :
                 pct>=50 ? 'Buon punteggio: ripassando i punti mancati migliorerai ancora.' :
                 'Continua a esercitarti: ogni domanda ripassata è un passo avanti.' ])
  ]));

  var actions = el('div',{class:'mode-row'});
  var homeBtn = el('button',{class:'bigbtn'},[]); homeBtn.innerHTML = ICONS.home+' Torna all’indice'; homeBtn.addEventListener('click', function(){ state.view='home'; render(); });
  actions.appendChild(homeBtn);
  if(state.mode==='level'){
    var retryBtn = el('button',{class:'bigbtn secondary'},['Rifai questo livello']);
    retryBtn.addEventListener('click', function(){ startChapterQuiz(state.chapter, state.level); });
    actions.appendChild(retryBtn);
  }
  if(wrongList.length){
    var reviewBtn = el('button',{class:'bigbtn ghost'},['Rivedi solo le '+wrongList.length+' domande sbagliate']);
    reviewBtn.addEventListener('click', function(){
      state.list = wrongList; state.idx = 0; state.view='quiz'; render();
    });
    actions.appendChild(reviewBtn);
  }
  main.appendChild(actions);

  if(wrongList.length){
    var reviewWrap = el('div',{},[ el('h2',{style:'margin:1.6rem 0 .8rem 0; font-size:1.1rem;'},['Domande da ripassare']) ]);
    wrongList.forEach(function(qn){
      var q = BY_ID[qn];
      reviewWrap.appendChild(el('div',{class:'review-item wrong'},[
        el('div',{class:'rq'},['D'+q.n+'. '+stripTags(q.stem)]),
        el('div',{class:'ra', html:q.explain})
      ]));
    });
    main.appendChild(reviewWrap);
  }
}
function stripTags(html){
  var d = document.createElement('div'); d.innerHTML = html; return d.textContent || d.innerText || '';
}

/* ----------------------------------------------------------- a11y bar */
function applyFontScale(){
  var base = 19 + settings.fontStep * 2;
  base = Math.max(15, Math.min(31, base));
  document.documentElement.style.setProperty('--fs', base+'px');
}
function applyContrast(){
  document.documentElement.setAttribute('data-contrast', settings.contrast);
}
function updateA11yButtons(){
  var hc = $('#btnContrast');
  if(hc) hc.setAttribute('aria-pressed', settings.contrast==='high' ? 'true':'false');
}
function initA11y(){
  $('#btnFontMinus').addEventListener('click', function(){ settings.fontStep = Math.max(-2, settings.fontStep-1); applyFontScale(); saveSettings(); });
  $('#btnFontPlus').addEventListener('click', function(){ settings.fontStep = Math.min(6, settings.fontStep+1); applyFontScale(); saveSettings(); });
  $('#btnContrast').addEventListener('click', function(){ settings.contrast = settings.contrast==='high' ? 'normal':'high'; applyContrast(); saveSettings(); updateA11yButtons(); });
  $('#brandHome').addEventListener('click', function(){ state.view='home'; render(); });
  applyFontScale(); applyContrast();
}

/* --------------------------------------------------------------- init */
function init(){
  loadStorage();
  initA11y();
  render();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
