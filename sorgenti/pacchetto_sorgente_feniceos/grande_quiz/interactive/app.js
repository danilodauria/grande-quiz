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
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 240 240" aria-hidden="true">' +
    '<defs><radialGradient id="fnxsole" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4cf"/><stop offset=".45" stop-color="#fbd98a" stop-opacity=".85"/><stop offset=".75" stop-color="#f2a340" stop-opacity=".28"/><stop offset="1" stop-color="#f2a340" stop-opacity="0"/></radialGradient><linearGradient id="fnxpPrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f2207"/><stop offset=".45" stop-color="#d8501a"/><stop offset=".8" stop-color="#f29a33"/><stop offset="1" stop-color="#ffd76a"/></linearGradient><linearGradient id="fnxpSec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a52c0a"/><stop offset=".5" stop-color="#e8702a"/><stop offset="1" stop-color="#fbc254"/></linearGradient><linearGradient id="fnxpCop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2410c"/><stop offset=".6" stop-color="#f08a32"/><stop offset="1" stop-color="#fde09a"/></linearGradient><linearGradient id="fnxcorpo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b648"/><stop offset=".45" stop-color="#e8702a"/><stop offset="1" stop-color="#a6300a"/></linearGradient><radialGradient id="fnxpetto" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#ffe7a3"/><stop offset=".6" stop-color="#f6a640" stop-opacity=".6"/><stop offset="1" stop-color="#e8702a" stop-opacity="0"/></radialGradient><linearGradient id="fnxfiamma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8501a"/><stop offset=".5" stop-color="#f29a33"/><stop offset=".85" stop-color="#ffd76a" stop-opacity=".8"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></linearGradient><linearGradient id="fnxbecco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#c98a1c"/></linearGradient><filter id="fnxbagliore" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter></defs><circle cx="120" cy="112" r="100" fill="url(#fnxsole)"/><path d="M104.8 138.0 C100.9 162.0 -10.2 182.0 31.6 218.0 C15.8 186.0 127.3 166.0 120.2 138.0Z" fill="url(#fnxfiamma)" opacity="0.95"/><path d="M119.8 138.0 C112.7 162.0 228.2 182.0 208.4 218.0 C237.4 186.0 139.1 166.0 135.2 138.0Z" fill="url(#fnxfiamma)" opacity="0.91"/><path d="M107.1 138.0 C102.9 166.8 34.2 190.8 66.0 234.0 C58.8 195.6 131.7 171.6 123.9 138.0Z" fill="url(#fnxfiamma)" opacity="0.87"/><path d="M116.1 138.0 C108.3 166.8 181.8 190.8 174.0 234.0 C195.6 195.6 137.1 171.6 132.9 138.0Z" fill="url(#fnxfiamma)" opacity="0.83"/><path d="M110.5 138.0 C106.4 170.4 78.4 197.4 98.2 246.0 C98.4 202.8 132.8 175.8 126.0 138.0Z" fill="url(#fnxfiamma)" opacity="0.79"/><path d="M114.0 138.0 C107.2 170.4 139.6 197.4 141.8 246.0 C154.8 202.8 133.6 175.8 129.4 138.0Z" fill="url(#fnxfiamma)" opacity="0.75"/><path d="M113.7 138.0 C109.2 165.6 111.0 188.6 120.0 230.0 C125.4 193.2 130.8 170.2 126.3 138.0Z" fill="url(#fnxfiamma)" opacity="0.71"/><g transform="translate(76.0 82.0) rotate(190.0)" opacity="1"><path d="M0 0 C8.0 15.4 17.1 40.2 5.9 61.8 C5.9 43.3 -8.0 18.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.1 Q4.9 30.9 5.9 59.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(75.4 82.4) rotate(182.2)" opacity="1"><path d="M0 0 C8.0 16.3 17.6 42.4 6.3 65.2 C6.4 45.6 -8.0 19.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.3 Q5.2 32.6 6.3 62.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(74.8 82.8) rotate(174.4)" opacity="1"><path d="M0 0 C8.0 17.1 18.2 44.6 6.6 68.6 C7.0 48.0 -8.0 20.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.4 Q5.5 34.3 6.6 65.9" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(74.2 83.2) rotate(166.6)" opacity="1"><path d="M0 0 C8.0 18.0 18.7 46.8 6.9 72.0 C7.5 50.4 -8.0 21.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.6 Q5.8 36.0 6.9 69.1" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(73.6 83.6) rotate(158.8)" opacity="1"><path d="M0 0 C8.0 17.1 18.2 44.6 6.6 68.6 C7.0 48.0 -8.0 20.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.4 Q5.5 34.3 6.6 65.9" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(73.0 84.0) rotate(151.0)" opacity="1"><path d="M0 0 C8.0 16.3 17.6 42.4 6.3 65.2 C6.4 45.6 -8.0 19.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.3 Q5.2 32.6 6.3 62.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(72.4 84.4) rotate(143.2)" opacity="1"><path d="M0 0 C8.0 15.4 17.1 40.2 5.9 61.8 C5.9 43.3 -8.0 18.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.1 Q4.9 30.9 5.9 59.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(71.8 84.8) rotate(135.4)" opacity="1"><path d="M0 0 C8.0 14.6 16.5 38.0 5.6 58.4 C5.3 40.9 -8.0 17.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 2.9 Q4.7 29.2 5.6 56.1" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(71.2 85.2) rotate(127.6)" opacity="1"><path d="M0 0 C8.0 13.8 16.0 35.8 5.3 55.0 C4.8 38.5 -8.0 16.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 2.8 Q4.4 27.5 5.3 52.8" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(70.6 85.6) rotate(119.8)" opacity="1"><path d="M0 0 C8.0 12.9 15.5 33.5 5.0 51.6 C4.3 36.1 -8.0 15.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 2.6 Q4.1 25.8 5.0 49.5" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(70.0 86.0) rotate(112.0)" opacity="1"><path d="M0 0 C8.0 12.1 14.9 31.3 4.6 48.2 C3.7 33.7 -8.0 14.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 2.4 Q3.9 24.1 4.6 46.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(106.0 94.0) rotate(85.0)" opacity="1"><path d="M0 0 C8.0 13.0 14.5 33.8 4.4 52.0 C3.3 36.4 -8.0 15.6 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.6 Q3.6 26.0 4.4 49.9" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(101.7 91.1) rotate(92.1)" opacity="1"><path d="M0 0 C8.0 12.7 14.3 33.1 4.3 50.9 C3.1 35.6 -8.0 15.3 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.5 Q3.6 25.4 4.3 48.8" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(97.4 88.3) rotate(99.3)" opacity="1"><path d="M0 0 C8.0 12.4 14.2 32.3 4.2 49.7 C3.0 34.8 -8.0 14.9 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.5 Q3.5 24.9 4.2 47.7" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(93.1 85.4) rotate(106.4)" opacity="1"><path d="M0 0 C8.0 12.1 14.0 31.6 4.1 48.6 C2.8 34.0 -8.0 14.6 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.4 Q3.4 24.3 4.1 46.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(88.9 82.6) rotate(113.6)" opacity="1"><path d="M0 0 C8.0 11.9 13.8 30.8 4.0 47.4 C2.6 33.2 -8.0 14.2 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.4 Q3.3 23.7 4.0 45.5" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(84.6 79.7) rotate(120.7)" opacity="1"><path d="M0 0 C8.0 11.6 13.7 30.1 3.9 46.3 C2.5 32.4 -8.0 13.9 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.3 Q3.2 23.1 3.9 44.4" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(80.3 76.9) rotate(127.9)" opacity="1"><path d="M0 0 C8.0 11.3 13.5 29.3 3.8 45.1 C2.3 31.6 -8.0 13.5 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.3 Q3.2 22.6 3.8 43.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(76.0 74.0) rotate(135.0)" opacity="1"><path d="M0 0 C8.0 11.0 13.4 28.6 3.7 44.0 C2.2 30.8 -8.0 13.2 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.2 Q3.1 22.0 3.7 42.2" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(110.0 90.0) rotate(85.0)" opacity="1"><path d="M0 0 C7.0 6.0 8.7 15.6 1.4 24.0 C-1.1 16.8 -7.0 7.2 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.2 Q1.2 12.0 1.4 23.0" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(106.2 87.6) rotate(89.4)" opacity="1"><path d="M0 0 C7.0 5.9 8.7 15.3 1.4 23.6 C-1.1 16.5 -7.0 7.1 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.2 Q1.2 11.8 1.4 22.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(102.4 85.1) rotate(93.9)" opacity="1"><path d="M0 0 C7.0 5.8 8.6 15.0 1.4 23.1 C-1.2 16.2 -7.0 6.9 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.2 Q1.2 11.6 1.4 22.2" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(98.7 82.7) rotate(98.3)" opacity="1"><path d="M0 0 C7.0 5.7 8.6 14.7 1.4 22.7 C-1.2 15.9 -7.0 6.8 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q1.1 11.3 1.4 21.8" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(94.9 80.2) rotate(102.8)" opacity="1"><path d="M0 0 C7.0 5.6 8.5 14.4 1.3 22.2 C-1.3 15.6 -7.0 6.7 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q1.1 11.1 1.3 21.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(91.1 77.8) rotate(107.2)" opacity="1"><path d="M0 0 C7.0 5.4 8.5 14.2 1.3 21.8 C-1.3 15.2 -7.0 6.5 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q1.1 10.9 1.3 20.9" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(87.3 75.3) rotate(111.7)" opacity="1"><path d="M0 0 C7.0 5.3 8.4 13.9 1.3 21.3 C-1.4 14.9 -7.0 6.4 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q1.1 10.7 1.3 20.5" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(83.6 72.9) rotate(116.1)" opacity="1"><path d="M0 0 C7.0 5.2 8.4 13.6 1.3 20.9 C-1.4 14.6 -7.0 6.3 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.0 Q1.0 10.4 1.3 20.1" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(79.8 70.4) rotate(120.6)" opacity="1"><path d="M0 0 C7.0 5.1 8.3 13.3 1.2 20.4 C-1.5 14.3 -7.0 6.1 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.0 Q1.0 10.2 1.2 19.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(76.0 68.0) rotate(125.0)" opacity="1"><path d="M0 0 C7.0 5.0 8.3 13.0 1.2 20.0 C-1.5 14.0 -7.0 6.0 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.0 Q1.0 10.0 1.2 19.2" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(164.0 82.0) rotate(-190.0)" opacity="1"><path d="M0 0 C8.0 15.4 -2.7 40.2 -5.9 61.8 C-13.9 43.3 -8.0 18.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.1 Q-4.9 30.9 -5.9 59.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(164.6 82.4) rotate(-182.2)" opacity="1"><path d="M0 0 C8.0 16.3 -3.2 42.4 -6.3 65.2 C-14.4 45.6 -8.0 19.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.3 Q-5.2 32.6 -6.3 62.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(165.2 82.8) rotate(-174.4)" opacity="1"><path d="M0 0 C8.0 17.1 -3.8 44.6 -6.6 68.6 C-15.0 48.0 -8.0 20.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.4 Q-5.5 34.3 -6.6 65.9" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(165.8 83.2) rotate(-166.6)" opacity="1"><path d="M0 0 C8.0 18.0 -4.3 46.8 -6.9 72.0 C-15.5 50.4 -8.0 21.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.6 Q-5.8 36.0 -6.9 69.1" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(166.4 83.6) rotate(-158.8)" opacity="1"><path d="M0 0 C8.0 17.1 -3.8 44.6 -6.6 68.6 C-15.0 48.0 -8.0 20.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.4 Q-5.5 34.3 -6.6 65.9" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(167.0 84.0) rotate(-151.0)" opacity="1"><path d="M0 0 C8.0 16.3 -3.2 42.4 -6.3 65.2 C-14.4 45.6 -8.0 19.6 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.3 Q-5.2 32.6 -6.3 62.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(167.6 84.4) rotate(-143.2)" opacity="1"><path d="M0 0 C8.0 15.4 -2.7 40.2 -5.9 61.8 C-13.9 43.3 -8.0 18.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 3.1 Q-4.9 30.9 -5.9 59.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(168.2 84.8) rotate(-135.4)" opacity="1"><path d="M0 0 C8.0 14.6 -2.1 38.0 -5.6 58.4 C-13.3 40.9 -8.0 17.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 2.9 Q-4.7 29.2 -5.6 56.1" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(168.8 85.2) rotate(-127.6)" opacity="1"><path d="M0 0 C8.0 13.8 -1.6 35.8 -5.3 55.0 C-12.8 38.5 -8.0 16.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 2.8 Q-4.4 27.5 -5.3 52.8" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(169.4 85.6) rotate(-119.8)" opacity="1"><path d="M0 0 C8.0 12.9 -1.1 33.5 -5.0 51.6 C-12.3 36.1 -8.0 15.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 2.6 Q-4.1 25.8 -5.0 49.5" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(170.0 86.0) rotate(-112.0)" opacity="1"><path d="M0 0 C8.0 12.1 -0.5 31.3 -4.6 48.2 C-11.7 33.7 -8.0 14.5 0 0Z" fill="url(#fnxpPrim)"/><path d="M0 2.4 Q-3.9 24.1 -4.6 46.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(134.0 94.0) rotate(-85.0)" opacity="1"><path d="M0 0 C8.0 13.0 -0.1 33.8 -4.4 52.0 C-11.3 36.4 -8.0 15.6 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.6 Q-3.6 26.0 -4.4 49.9" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(138.3 91.1) rotate(-92.1)" opacity="1"><path d="M0 0 C8.0 12.7 0.1 33.1 -4.3 50.9 C-11.1 35.6 -8.0 15.3 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.5 Q-3.6 25.4 -4.3 48.8" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(142.6 88.3) rotate(-99.3)" opacity="1"><path d="M0 0 C8.0 12.4 0.2 32.3 -4.2 49.7 C-11.0 34.8 -8.0 14.9 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.5 Q-3.5 24.9 -4.2 47.7" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(146.9 85.4) rotate(-106.4)" opacity="1"><path d="M0 0 C8.0 12.1 0.4 31.6 -4.1 48.6 C-10.8 34.0 -8.0 14.6 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.4 Q-3.4 24.3 -4.1 46.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(151.1 82.6) rotate(-113.6)" opacity="1"><path d="M0 0 C8.0 11.9 0.6 30.8 -4.0 47.4 C-10.6 33.2 -8.0 14.2 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.4 Q-3.3 23.7 -4.0 45.5" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(155.4 79.7) rotate(-120.7)" opacity="1"><path d="M0 0 C8.0 11.6 0.7 30.1 -3.9 46.3 C-10.5 32.4 -8.0 13.9 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.3 Q-3.2 23.1 -3.9 44.4" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(159.7 76.9) rotate(-127.9)" opacity="1"><path d="M0 0 C8.0 11.3 0.9 29.3 -3.8 45.1 C-10.3 31.6 -8.0 13.5 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.3 Q-3.2 22.6 -3.8 43.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(164.0 74.0) rotate(-135.0)" opacity="1"><path d="M0 0 C8.0 11.0 1.0 28.6 -3.7 44.0 C-10.2 30.8 -8.0 13.2 0 0Z" fill="url(#fnxpSec)"/><path d="M0 2.2 Q-3.1 22.0 -3.7 42.2" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(130.0 90.0) rotate(-85.0)" opacity="1"><path d="M0 0 C7.0 6.0 3.9 15.6 -1.4 24.0 C-5.9 16.8 -7.0 7.2 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.2 Q-1.2 12.0 -1.4 23.0" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(133.8 87.6) rotate(-89.4)" opacity="1"><path d="M0 0 C7.0 5.9 3.9 15.3 -1.4 23.6 C-5.9 16.5 -7.0 7.1 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.2 Q-1.2 11.8 -1.4 22.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(137.6 85.1) rotate(-93.9)" opacity="1"><path d="M0 0 C7.0 5.8 4.0 15.0 -1.4 23.1 C-5.8 16.2 -7.0 6.9 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.2 Q-1.2 11.6 -1.4 22.2" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(141.3 82.7) rotate(-98.3)" opacity="1"><path d="M0 0 C7.0 5.7 4.0 14.7 -1.4 22.7 C-5.8 15.9 -7.0 6.8 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q-1.1 11.3 -1.4 21.8" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(145.1 80.2) rotate(-102.8)" opacity="1"><path d="M0 0 C7.0 5.6 4.1 14.4 -1.3 22.2 C-5.7 15.6 -7.0 6.7 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q-1.1 11.1 -1.3 21.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(148.9 77.8) rotate(-107.2)" opacity="1"><path d="M0 0 C7.0 5.4 4.1 14.2 -1.3 21.8 C-5.7 15.2 -7.0 6.5 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q-1.1 10.9 -1.3 20.9" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(152.7 75.3) rotate(-111.7)" opacity="1"><path d="M0 0 C7.0 5.3 4.2 13.9 -1.3 21.3 C-5.6 14.9 -7.0 6.4 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q-1.1 10.7 -1.3 20.5" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(156.4 72.9) rotate(-116.1)" opacity="1"><path d="M0 0 C7.0 5.2 4.2 13.6 -1.3 20.9 C-5.6 14.6 -7.0 6.3 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.0 Q-1.0 10.4 -1.3 20.1" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(160.2 70.4) rotate(-120.6)" opacity="1"><path d="M0 0 C7.0 5.1 4.3 13.3 -1.2 20.4 C-5.5 14.3 -7.0 6.1 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.0 Q-1.0 10.2 -1.2 19.6" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(164.0 68.0) rotate(-125.0)" opacity="1"><path d="M0 0 C7.0 5.0 4.3 13.0 -1.2 20.0 C-5.5 14.0 -7.0 6.0 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.0 Q-1.0 10.0 -1.2 19.2" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><path d="M120 62 C135 62 140 80 137 100 C134 122 130 138 120 150 C110 138 106 122 103 100 C100 80 105 62 120 62Z" fill="url(#fnxcorpo)"/><ellipse cx="120" cy="100" rx="13" ry="28" fill="url(#fnxpetto)"/><path d="M108.0 84.0 Q112.0 90.0 116.0 84.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M116.0 84.0 Q120.0 90.0 124.0 84.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M124.0 84.0 Q128.0 90.0 132.0 84.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M112.0 93.0 Q116.0 99.0 120.0 93.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M120.0 93.0 Q124.0 99.0 128.0 93.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M108.0 102.0 Q112.0 108.0 116.0 102.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M116.0 102.0 Q120.0 108.0 124.0 102.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M124.0 102.0 Q128.0 108.0 132.0 102.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M112.0 111.0 Q116.0 117.0 120.0 111.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M120.0 111.0 Q124.0 117.0 128.0 111.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M108.0 120.0 Q112.0 126.0 116.0 120.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M116.0 120.0 Q120.0 126.0 124.0 120.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M124.0 120.0 Q128.0 126.0 132.0 120.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M112.0 129.0 Q116.0 135.0 120.0 129.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M120.0 129.0 Q124.0 135.0 128.0 129.0" fill="none" stroke="#b8400c" stroke-opacity=".45" stroke-width=".9"/><path d="M111 72 C110 58 114 44 122 40 C130 37 135 44 133 52 C131 60 129 66 129 74Z" fill="url(#fnxcorpo)"/><g transform="translate(119.0 42.0) rotate(-215.0)" opacity="1"><path d="M0 0 C4.2 6.5 -4.0 16.9 -4.7 26.0 C-9.9 18.2 -4.2 7.8 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.3 Q-3.9 13.0 -4.7 25.0" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(122.0 40.0) rotate(-200.0)" opacity="1"><path d="M0 0 C4.2 7.5 -5.2 19.5 -5.4 30.0 C-11.1 21.0 -4.2 9.0 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.5 Q-4.5 15.0 -5.4 28.8" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(125.0 40.0) rotate(-185.0)" opacity="1"><path d="M0 0 C4.2 5.5 -2.8 14.3 -4.0 22.0 C-8.7 15.4 -4.2 6.6 0 0Z" fill="url(#fnxpCop)"/><path d="M0 1.1 Q-3.3 11.0 -4.0 21.1" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><g transform="translate(116.0 45.0) rotate(-230.0)" opacity="1"><path d="M0 0 C4.2 4.5 -1.6 11.7 -3.2 18.0 C-7.5 12.6 -4.2 5.4 0 0Z" fill="url(#fnxpCop)"/><path d="M0 0.9 Q-2.7 9.0 -3.2 17.3" fill="none" stroke="#7a1e05" stroke-opacity=".35" stroke-width=".7"/></g><path d="M131 46 C138 45 143 48 144 53 C141 51 137 51 133 52Z" fill="url(#fnxbecco)"/><path d="M133 52 C137 52 140 53 141 54.5 C138 55 135 55 132 54Z" fill="#b5761a"/><circle cx="127" cy="46" r="2.6" fill="#14232e"/><circle cx="127.8" cy="45.2" r=".9" fill="#fff4cf"/><path d="M123 44 Q127 41.5 131 43.5" fill="none" stroke="#7a1e05" stroke-width=".9" stroke-opacity=".6"/><circle cx="95.3" cy="162.4" r="1.4" fill="#ffd76a" opacity="0.39"/><circle cx="125.0" cy="180.0" r="0.7" fill="#ffd76a" opacity="0.63"/><circle cx="55.2" cy="185.6" r="0.7" fill="#ffd76a" opacity="0.40"/><circle cx="109.4" cy="217.8" r="0.7" fill="#ffd76a" opacity="0.47"/><circle cx="137.8" cy="227.7" r="1.3" fill="#ffd76a" opacity="0.57"/><circle cx="186.7" cy="153.8" r="1.6" fill="#ffd76a" opacity="0.51"/><circle cx="70.2" cy="159.7" r="1.0" fill="#ffd76a" opacity="0.80"/><circle cx="75.3" cy="197.7" r="1.4" fill="#ffd76a" opacity="0.55"/><circle cx="126.7" cy="155.1" r="0.7" fill="#ffd76a" opacity="0.46"/><circle cx="145.3" cy="185.1" r="1.0" fill="#ffd76a" opacity="0.67"/><circle cx="113.4" cy="174.6" r="1.6" fill="#ffd76a" opacity="0.73"/><circle cx="84.2" cy="197.1" r="1.2" fill="#ffd76a" opacity="0.83"/><circle cx="152.1" cy="173.6" r="1.8" fill="#ffd76a" opacity="0.41"/><circle cx="108.5" cy="212.1" r="0.8" fill="#ffd76a" opacity="0.62"/><circle cx="55.5" cy="204.8" r="1.5" fill="#ffd76a" opacity="0.67"/><circle cx="172.6" cy="175.7" r="1.4" fill="#ffd76a" opacity="0.68"/><circle cx="131.2" cy="187.4" r="1.6" fill="#ffd76a" opacity="0.87"/><circle cx="116.4" cy="204.5" r="0.7" fill="#ffd76a" opacity="0.74"/><circle cx="140.6" cy="231.4" r="1.6" fill="#ffd76a" opacity="0.51"/><circle cx="104.0" cy="204.8" r="0.6" fill="#ffd76a" opacity="0.60"/><circle cx="73.5" cy="159.6" r="0.7" fill="#ffd76a" opacity="0.77"/><circle cx="68.1" cy="170.3" r="1.1" fill="#ffd76a" opacity="0.83"/>' +
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
