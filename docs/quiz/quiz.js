/* =============================================================================
   IL GRANDE QUIZ DELL'INFORMATICA — il quiz con il timer
   Tre modalità: «Quiz a tempo» (una domanda alla volta), «Scheda risposte» (tutte insieme),
   «Schermo domande» (da proiettare, senza rispondere).
   Le soluzioni NON sono in questa pagina: le risposte si esportano in un file .json
   e le corregge solo chi conduce, nell'area riservata (password + Google Authenticator).
   Ideazione e cura: Danilo D'Auria · Codice MIT · Contenuti CC BY-NC-SA 4.0
   ============================================================================= */
(function () {
  "use strict";
  var GQ = window.GQ, $ = GQ.$, $$ = GQ.$$, esc = GQ.esc, ic = GQ.icona;
  var QUIZ = window.GQ_QUIZ || {};

  /* ---------- limiti del timer (minimo e massimo consentiti) ---------- */
  var T = { MIN: 10, MAX: 300, PASSO: 5, BASE: 60, PRESET: [20, 30, 45, 60, 90, 120, 180, 300],
            SCHEDA_MIN: 5, SCHEDA_MAX: 240, SCHEDA_BASE: 60, AVVISO: 10, ALLARME: 5 };
  GQ.TIMER = T;

  var KI = "gq.impostazioni", KS = "gq.sessione";
  var BASE_IMP = { quiz: "grande", modo: "tempo", ambito: "tutte", capitoli: [], livelli: [], quante: 0, ordine: "sequenza",
    timer: true, secondi: T.BASE, scadenza: "avanti", indietro: false, pausa: true, suono: true,
    schedaTimer: false, schedaMinuti: T.SCHEDA_BASE, testoScheda: true, schermoAuto: false, schermoSecondi: 30,
    info: { nome: "", data: "", centro: "", gruppo: "", livello: "", note: "" } };
  var imp = unisci(BASE_IMP, GQ.leggi(KI, {}));
  var ses = GQ.leggi(KS, null);
  var app = $("#app");
  var timerId = null, passo = 0;

  function unisci(a, b) { var o = JSON.parse(JSON.stringify(a)), k; for (k in b) if (b.hasOwnProperty(k) && o.hasOwnProperty(k)) o[k] = b[k]; o.info = JSON.parse(JSON.stringify(unisciInfo(a.info, b.info))); return o; }
  function unisciInfo(a, b) { var o = {}, k; for (k in a) o[k] = (b && b[k] != null) ? b[k] : a[k]; return o; }
  function salvaImp() { GQ.salva(KI, imp); }
  function salvaSes() { if (ses) GQ.salva(KS, ses); }
  function Q() { return QUIZ[(ses && ses.quiz) || imp.quiz]; }
  function domanda(n) { var d = Q().domande; for (var i = 0; i < d.length; i++) if (d[i].n === n) return d[i]; return null; }
  function capitolo(num) {
    var p = Q().parti, i, j;
    for (i = 0; i < p.length; i++) for (j = 0; j < p[i].capitoli.length; j++) if (p[i].capitoli[j].num === num) return { parte: p[i], cap: p[i].capitoli[j] };
    return { parte: { roman: "", titolo: "", colore: "#1b3a4b" }, cap: { num: num, titolo: "" } };
  }
  function colLivello(l) { return /base/i.test(l) ? "verde" : /intermedio/i.test(l) ? "oro" : /esperto|avanzato/i.test(l) ? "arancio" : "viola"; }

  /* =========================================================================
     LA MASCHERA DI AVVIO (passo dopo passo)
     ========================================================================= */
  var PASSI = [["Quiz", "libro"], ["Modalità", "schermo"], ["Domande", "regola"], ["Tempo", "timer"], ["Partecipante", "utente"], ["Pronti", "gioca"]];

  function maschera() {
    fermaTimer();
    if (imp.modo === "schermo" && passo === 4) passo = 5;
    var stepper = PASSI.map(function (p, i) {
      var stato = i < passo ? "fatto" : i === passo ? "ora" : "";
      return '<li class="' + stato + '"><button type="button" data-passo="' + i + '"' + (i > passo ? " disabled" : "") + ">" +
        '<span class="n">' + (i < passo ? ic("ok") : i + 1) + '</span><span class="l">' + p[0] + "</span></button></li>";
    }).join("");
    app.innerHTML = '<section class="avvio contenitore">' +
      '<div class="avvio-testa"><span class="occhiello">Preparazione della prova</span><h1>Prepariamo il quiz</h1>' +
      "<p>Sei passi semplici: scegliete il quiz, come rispondere, quali domande e quanto tempo dare a ciascuna. Le scelte restano memorizzate per la prossima volta.</p></div>" +
      (ses && !ses.finita ? riprendiHtml() : "") +
      '<ol class="stepper" aria-label="Passi della preparazione">' + stepper + "</ol>" +
      '<div class="scheda passo-corpo" id="corpo">' + corpoPasso() + "</div>" +
      '<div class="passo-azioni">' + (passo > 0 ? '<button class="bt bt-chiaro" data-az="indietro">' + ic("indietro") + "Indietro</button>" : "<span></span>") +
      (passo < 5 ? '<button class="bt bt-primario bt-grande" data-az="avanti">Avanti ' + ic("avanti") + "</button>"
        : '<button class="bt bt-primario bt-grande" data-az="inizia">' + ic("gioca") + (imp.modo === "schermo" ? "Apri lo schermo domande" : "Inizia la prova") + "</button>") +
      "</div></section>";
    collegaPasso();
  }
  function riprendiHtml() {
    var q = QUIZ[ses.quiz], fatte = Object.keys(ses.risposte || {}).length;
    return '<div class="riprendi scheda">' + ic("info") + "<div><b>C'è una prova in corso</b> — " + esc(ses.info.nome || "senza nome") + ", " + esc(q ? q.titolo : "") +
      ": " + fatte + " risposte su " + ses.elenco.length + '.</div><div class="riprendi-az"><button class="bt bt-primario bt-piccolo" data-az="riprendi">Riprendi</button>' +
      '<button class="bt bt-chiaro bt-piccolo" data-az="abbandona">Chiudi la prova</button></div></div>';
  }

  function corpoPasso() {
    var q = QUIZ[imp.quiz];
    switch (passo) {
      case 0:
        return "<h2>Quale quiz?</h2><div class='scelte'>" + ["grande", "manuale"].map(function (id) {
          var d = QUIZ[id]; if (!d) return "";
          var desc = id === "grande" ? "264 domande in 4 parti e 12 capitoli, su tre livelli: Base, Intermedio, Esperto. Scelta multipla e Vero/Falso."
            : "66 domande della Parte V del manuale «FeniceOS — Tecnologia Gentile per Tutte le Età»: scelta multipla, Vero/Falso, abbinamenti e domande aperte.";
          return scelta("quiz", id, id === "grande" ? "trofeo" : "libro", d.titolo, desc, d.totale + " domande");
        }).join("") + "</div>";
      case 1:
        return "<h2>Come si risponde?</h2><div class='scelte'>" +
          scelta("modo", "tempo", "timer", "Quiz a tempo", "Una domanda alla volta, a schermo intero, con il conto alla rovescia per ogni domanda. È la prova vera e propria.", "Consigliato") +
          scelta("modo", "scheda", "scheda", "Scheda risposte", "Tutte le domande in un unico foglio da spuntare, come la scheda di carta. Si può dare un tempo complessivo.", "Come su carta") +
          scelta("modo", "schermo", "schermo", "Schermo domande", "Per chi conduce: mostra le domande grandi, da proiettare in aula. Le risposte si segnano sulla scheda.", "Da proiettare") + "</div>";
      case 2:
        return passoDomande(q);
      case 3:
        return passoTempo();
      case 4:
        return passoPartecipante();
      default:
        return passoRiepilogo(q);
    }
  }
  function scelta(nome, val, icona, titolo, testo, chip) {
    var on = imp[nome] === val;
    return '<button type="button" class="scelta' + (on ? " scelta-on" : "") + '" data-scelta="' + nome + '" data-val="' + val + '" aria-pressed="' + on + '">' +
      '<span class="scelta-ico">' + ic(icona) + '</span><span class="scelta-t">' + esc(titolo) + '</span><span class="scelta-d">' + esc(testo) + "</span>" +
      (chip ? '<span class="chip ' + (on ? "arancio" : "") + '">' + esc(chip) + "</span>" : "") + '<span class="scelta-spunta">' + ic("ok") + "</span></button>";
  }

  function passoDomande(q) {
    var caps = q.parti.map(function (p) {
      return '<fieldset class="gruppo-cap"><legend style="--c:' + p.colore + '">Parte ' + esc(p.roman) + " · " + esc(p.titolo) + "</legend>" +
        p.capitoli.map(function (c) {
          var n = q.domande.filter(function (d) { return d.cap === c.num; }).length;
          return '<label class="spunta"><input type="checkbox" data-cap="' + c.num + '"' + (imp.capitoli.indexOf(c.num) >= 0 ? " checked" : "") + "><span>Cap. " + c.num + " — " + esc(c.titolo) +
            ' <small>(' + n + ")</small></span></label>";
        }).join("") + "</fieldset>";
    }).join("");
    var livs = q.livelli.map(function (l) {
      var n = q.domande.filter(function (d) { return d.livello === l; }).length;
      return '<label class="spunta"><input type="checkbox" data-liv="' + esc(l) + '"' + (imp.livelli.indexOf(l) >= 0 ? " checked" : "") + '><span><span class="chip ' + colLivello(l) + '">' + esc(l) + "</span> <small>(" + n + ")</small></span></label>";
    }).join("");
    var disp = elencoDomande(false).length;
    return "<h2>Quali domande?</h2>" +
      '<div class="segmenti" role="radiogroup" aria-label="Ambito">' + seg("ambito", "tutte", "Tutte") + seg("ambito", "capitoli", "Per capitolo") + seg("ambito", "livelli", "Per livello") + "</div>" +
      (imp.ambito === "capitoli" ? '<div class="caps">' + caps + "</div>" : "") +
      (imp.ambito === "livelli" ? '<div class="livs">' + livs + "</div>" : "") +
      '<div class="riga-quante"><div><span class="etichetta">Quante domande</span><div class="segmenti">' + seg("quantiTutte", "si", "Tutte quelle scelte (" + disp + ")", imp.quante ? "no" : "si") +
      seg("quantiTutte", "no", "Solo alcune, a caso", imp.quante ? "no" : "si") + "</div></div>" +
      (imp.quante ? '<label class="campo cursore"><span>Numero di domande: <b id="vquante">' + Math.min(imp.quante, disp) + "</b> su " + disp + '</span><input type="range" id="quante" min="' + Math.min(5, disp) +
        '" max="' + disp + '" step="1" value="' + Math.min(imp.quante, disp) + '"></label>' : "") + "</div>" +
      '<div><span class="etichetta">Ordine</span><div class="segmenti">' + seg("ordine", "sequenza", "Nell'ordine del libro") + seg("ordine", "mescolato", "Mescolate") + "</div></div>" +
      '<p class="nota" id="nota-dom">' + ic("info") + " Domande scelte: <b>" + elencoDomande(true).length + "</b>.</p>";
  }
  function seg(nome, val, testo, attuale) {
    var on = (attuale != null ? attuale : imp[nome]) === val;
    return '<button type="button" class="seg' + (on ? " seg-on" : "") + '" data-seg="' + nome + '" data-val="' + esc(val) + '" aria-pressed="' + on + '">' + esc(testo) + "</button>";
  }

  function passoTempo() {
    if (imp.modo === "scheda") {
      return "<h2>Tempo per la scheda</h2><label class='interruttore'><input type='checkbox' id='schedaTimer'" + (imp.schedaTimer ? " checked" : "") + "> Dare un tempo complessivo</label>" +
        (imp.schedaTimer ? cursore("schedaMinuti", "Minuti per tutta la scheda", T.SCHEDA_MIN, T.SCHEDA_MAX, 5, imp.schedaMinuti, " min") +
          "<p class='nota'>" + ic("info") + " Allo scadere la scheda si chiude da sola e si passa al riepilogo per esportare le risposte.</p>" : "") +
        "<label class='interruttore'><input type='checkbox' id='testoScheda'" + (imp.testoScheda ? " checked" : "") + "> Mostrare il testo delle domande nella scheda</label>" +
        "<p class='nota'>" + ic("info") + " Senza testo, la scheda è identica a quella di carta: le domande si leggono sul libro o sullo Schermo domande.</p>";
    }
    if (imp.modo === "schermo") {
      return "<h2>Tempo sullo schermo</h2><label class='interruttore'><input type='checkbox' id='schermoAuto'" + (imp.schermoAuto ? " checked" : "") + "> Passare da solo alla domanda successiva</label>" +
        (imp.schermoAuto ? cursore("schermoSecondi", "Secondi per ogni domanda", T.MIN, T.MAX, T.PASSO, imp.schermoSecondi, " s") : "") +
        "<p class='nota'>" + ic("info") + " Si può sempre fermare, ripartire e spostarsi con le frecce della tastiera.</p>";
    }
    return "<h2>Il timer di ogni domanda</h2>" +
      "<label class='interruttore'><input type='checkbox' id='timer'" + (imp.timer ? " checked" : "") + "> Usare il timer</label>" +
      (imp.timer ? cursore("secondi", "Secondi per ogni domanda", T.MIN, T.MAX, T.PASSO, imp.secondi, " s") +
        '<div class="preset">' + T.PRESET.map(function (s) { return '<button type="button" class="seg' + (imp.secondi === s ? " seg-on" : "") + '" data-preset="' + s + '">' + etiSec(s) + "</button>"; }).join("") + "</div>" +
        "<p class='nota'>" + ic("info") + " Minimo consentito " + T.MIN + " secondi, massimo " + etiSec(T.MAX) + ". Il tempo stimato per tutta la prova è di circa <b id='stima'>" +
        GQ.durata(imp.secondi * elencoDomande(true).length) + "</b>.</p>" +
        "<span class='etichetta blocco'>Quando il tempo finisce</span><div class='segmenti'>" + seg("scadenza", "avanti", "Si passa alla domanda dopo") + seg("scadenza", "avvisa", "Solo un avviso") + "</div>" +
        "<div class='opzioni-tempo'><label class='interruttore'><input type='checkbox' id='suono'" + (imp.suono ? " checked" : "") + "> Suono negli ultimi " + T.ALLARME + " secondi</label>" +
        "<label class='interruttore'><input type='checkbox' id='pausa'" + (imp.pausa ? " checked" : "") + "> Permettere la pausa</label></div>" : "") +
      "<label class='interruttore'><input type='checkbox' id='indietro'" + (imp.indietro ? " checked" : "") + "> Permettere di tornare alle domande precedenti</label>";
  }
  function etiSec(s) { return s < 60 ? s + " s" : (s % 60 ? Math.floor(s / 60) + " min " + (s % 60) + " s" : s / 60 + " min"); }
  function cursore(id, testo, min, max, step, val, suf) {
    return '<label class="campo cursore"><span>' + testo + ': <b id="v' + id + '">' + (suf === " s" ? etiSec(val) : val + suf) + '</b></span><input type="range" id="' + id + '" min="' + min + '" max="' + max +
      '" step="' + step + '" value="' + val + '" data-suf="' + suf + '"><span class="estremi"><span>' + (suf === " s" ? etiSec(min) : min + suf) + "</span><span>" + (suf === " s" ? etiSec(max) : max + suf) + "</span></span></label>";
  }

  function passoPartecipante() {
    var i = imp.info;
    if (!i.data) i.data = GQ.oggi();
    return "<h2>Chi risponde?</h2><p>Questi dati finiscono nel file delle risposte, così chi corregge sa di chi è la prova.</p><div class='griglia-2'>" +
      campo("nome", "Nome e cognome *", i.nome, "text", "autocomplete='name'") + campo("data", "Data", i.data, "date") +
      campo("centro", "Centro, scuola o associazione", i.centro, "text") + campo("gruppo", "Gruppo o classe", i.gruppo, "text") +
      '<label class="campo"><span>Livello del percorso seguito</span><select data-info="livello">' + ["", "Base", "Intermedio", "Esperto", "Misto / non specificato"].map(function (l) {
        return "<option" + (i.livello === l ? " selected" : "") + ' value="' + l + '">' + (l || "— scegliete —") + "</option>"; }).join("") + "</select></label>" +
      '<label class="campo" style="grid-column:1/-1"><span>Note</span><textarea data-info="note" rows="2">' + esc(i.note) + "</textarea></label></div>";
  }
  function campo(k, t, v, tipo, extra) {
    return '<label class="campo"><span>' + t + '</span><input type="' + tipo + '" data-info="' + k + '" value="' + esc(v) + '" ' + (extra || "") + "></label>";
  }

  function passoRiepilogo(q) {
    var n = elencoDomande(true).length, righe = [];
    righe.push(["Quiz", q.titolo]);
    righe.push(["Modalità", { tempo: "Quiz a tempo, una domanda alla volta", scheda: "Scheda risposte", schermo: "Schermo domande da proiettare" }[imp.modo]]);
    righe.push(["Domande", n + (imp.ordine === "mescolato" ? ", in ordine mescolato" : ", nell'ordine del libro")]);
    if (imp.modo === "tempo") righe.push(["Timer", imp.timer ? etiSec(imp.secondi) + " per domanda (circa " + GQ.durata(imp.secondi * n) + " in tutto)" : "nessun limite di tempo"]);
    if (imp.modo === "scheda") righe.push(["Tempo", imp.schedaTimer ? imp.schedaMinuti + " minuti per tutta la scheda" : "nessun limite di tempo"]);
    if (imp.modo === "schermo") righe.push(["Avanzamento", imp.schermoAuto ? "automatico ogni " + etiSec(imp.schermoSecondi) : "a mano"]);
    if (imp.modo !== "schermo") righe.push(["Partecipante", (imp.info.nome || "—") + (imp.info.centro ? " · " + imp.info.centro : "")]);
    return "<h2>Tutto pronto</h2><dl class='riepilogo'>" + righe.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl>" +
      (imp.modo === "tempo" ? "<div class='regole'>" + ic("timer") + "<div><b>Come funziona.</b> Leggete la domanda, toccate la risposta e premete <b>Avanti</b>. " +
        (imp.timer ? "Il cerchio in alto a destra mostra i secondi che restano; negli ultimi " + T.AVVISO + " diventa arancione, poi rosso. " : "") +
        "Alla fine esportate il file delle risposte e consegnatelo a chi corregge.</div></div>" : "");
  }

  function collegaPasso() {
    $$("[data-passo]").forEach(function (b) { b.onclick = function () { passo = +b.getAttribute("data-passo"); maschera(); }; });
    $$("[data-scelta]").forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-scelta"), v = b.getAttribute("data-val");
        if (k === "quiz" && imp.quiz !== v) { imp.capitoli = []; imp.livelli = []; imp.quante = 0; }
        imp[k] = v; salvaImp(); maschera();
      };
    });
    $$("[data-seg]").forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-seg"), v = b.getAttribute("data-val");
        if (k === "quantiTutte") imp.quante = v === "si" ? 0 : Math.min(20, elencoDomande(false).length);
        else imp[k] = v;
        salvaImp(); maschera();
      };
    });
    $$("[data-cap]").forEach(function (c) { c.onchange = function () { imp.capitoli = $$("[data-cap]").filter(function (x) { return x.checked; }).map(function (x) { return +x.getAttribute("data-cap"); }); salvaImp(); maschera(); }; });
    $$("[data-liv]").forEach(function (c) { c.onchange = function () { imp.livelli = $$("[data-liv]").filter(function (x) { return x.checked; }).map(function (x) { return x.getAttribute("data-liv"); }); salvaImp(); maschera(); }; });
    $$("input[type=range]").forEach(function (r) {
      r.oninput = function () {
        var v = +r.value, suf = r.getAttribute("data-suf");
        if (r.id === "quante") imp.quante = v; else imp[r.id] = v;
        var e = $("#v" + r.id); if (e) e.textContent = suf === " s" ? etiSec(v) : suf ? v + suf : v;
        var st = $("#stima"); if (st) st.textContent = GQ.durata(imp.secondi * elencoDomande(true).length);
        $$("[data-preset]").forEach(function (p) { p.classList.toggle("seg-on", +p.getAttribute("data-preset") === imp.secondi); });
        var nd = $("#nota-dom b"); if (nd) nd.textContent = elencoDomande(true).length;
        salvaImp();
      };
    });
    $$("[data-preset]").forEach(function (p) { p.onclick = function () { imp.secondi = +p.getAttribute("data-preset"); salvaImp(); maschera(); }; });
    ["timer", "indietro", "pausa", "suono", "schedaTimer", "testoScheda", "schermoAuto"].forEach(function (id) {
      var c = document.getElementById(id); if (c) c.onchange = function () { imp[id] = c.checked; salvaImp(); maschera(); };
    });
    $$("[data-info]").forEach(function (c) { c.oninput = c.onchange = function () { imp.info[c.getAttribute("data-info")] = c.value; salvaImp(); }; });
    var az = function (a, f) { var b = $('[data-az="' + a + '"]'); if (b) b.onclick = f; };
    az("indietro", function () { passo = Math.max(0, passo - 1); if (imp.modo === "schermo" && passo === 4) passo = 3; maschera(); });
    az("avanti", function () {
      if (passo === 2 && !elencoDomande(true).length) { GQ.avviso("Scegliete almeno un capitolo o un livello.", "errore"); return; }
      if (passo === 4 && !String(imp.info.nome).trim()) { GQ.avviso("Scrivete il nome di chi risponde.", "errore"); var n = $('[data-info="nome"]'); if (n) n.focus(); return; }
      passo++; maschera(); window.scrollTo(0, 0);
    });
    az("inizia", inizia);
    az("riprendi", function () { riprendi(); });
    az("abbandona", function () {
      GQ.conferma("Chiudere la prova in corso?", "Le risposte non esportate andranno perse.", "Chiudi la prova", function () { ses = null; GQ.togli(KS); maschera(); }, true);
    });
  }

  function elencoDomande(conQuante) {
    var q = QUIZ[imp.quiz], el = q.domande.filter(function (d) {
      if (imp.ambito === "capitoli") return imp.capitoli.indexOf(d.cap) >= 0;
      if (imp.ambito === "livelli") return imp.livelli.indexOf(d.livello) >= 0;
      return true;
    }).map(function (d) { return d.n; });
    if (conQuante && imp.quante && imp.quante < el.length) el = el.slice(0, imp.quante);
    return el;
  }
  function mescola(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* =========================================================================
     AVVIO, RIPRESA, TIMER
     ========================================================================= */
  function inizia() {
    var el = elencoDomande(false);
    if (imp.quante && imp.quante < el.length) el = mescola(el.slice()).slice(0, imp.quante).sort(function (a, b) { return a - b; });
    if (imp.ordine === "mescolato") el = mescola(el.slice());
    if (!el.length) { GQ.avviso("Nessuna domanda scelta.", "errore"); return; }
    ses = { quiz: imp.quiz, modo: imp.modo, elenco: el, indice: 0, risposte: {}, tempi: {}, scadute: [], viste: {},
      imp: JSON.parse(JSON.stringify(imp)), info: JSON.parse(JSON.stringify(imp.info)), iniziato: new Date().toISOString(), finita: false, esportata: false,
      rimasti: null, schedaFine: imp.modo === "scheda" && imp.schedaTimer ? Date.now() + imp.schedaMinuti * 60000 : null, pausa: false };
    salvaSes();
    if (imp.modo === "tempo") GQ.schermoIntero && document.documentElement.requestFullscreen && GQ.schermoIntero();
    vai();
  }
  function riprendi() { vai(); }
  function vai() {
    if (!ses) return maschera();
    if (ses.finita) return fine();
    if (ses.modo === "scheda") return scheda();
    return mostraDomanda();
  }

  function fermaTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  var audio = null;
  function bip(freq, dur) {
    if (!ses || !ses.imp.suono) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = freq || 880; o.type = "sine"; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(.0001, audio.currentTime); g.gain.exponentialRampToValueAtTime(.18, audio.currentTime + .02);
      g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + (dur || .15));
      o.start(); o.stop(audio.currentTime + (dur || .15) + .02);
    } catch (e) { /* audio non disponibile */ }
  }

  /* =========================================================================
     UNA DOMANDA ALLA VOLTA (quiz a tempo e schermo domande)
     ========================================================================= */
  var inizioDomanda = 0;
  function mostraDomanda() {
    fermaTimer();
    var lettura = ses.modo === "schermo", n = ses.elenco[ses.indice], d = domanda(n), q = Q(), c = capitolo(d.cap);
    var tot = ses.elenco.length, fatte = Object.keys(ses.risposte).length;
    var conTimer = lettura ? ses.imp.schermoAuto : ses.imp.timer, durata = lettura ? ses.imp.schermoSecondi : ses.imp.secondi;
    if (conTimer && (ses.rimasti == null || ses.rimastiPer !== n)) { ses.rimasti = durata; ses.rimastiPer = n; }
    ses.viste[n] = true;
    salvaSes();
    app.innerHTML = '<section class="gioco' + (lettura ? " lettura" : "") + '">' +
      '<div class="gioco-testa"><div class="contenitore gioco-testa-dentro">' +
      '<div class="avanzamento"><div class="av-testo"><b>Domanda ' + (ses.indice + 1) + " di " + tot + "</b>" +
      (lettura ? "" : '<span class="av-fatte">' + fatte + " risposte date</span>") + "</div>" +
      '<div class="av-barra"><span style="width:' + Math.round((ses.indice + 1) / tot * 100) + '%"></span></div>' +
      '<div class="av-cap"><span class="pallino" style="background:' + c.parte.colore + '"></span>Parte ' + esc(c.parte.roman) + " · Cap. " + d.cap + " — " + esc(c.cap.titolo) + "</div></div>" +
      (conTimer ? anello(ses.rimasti, durata) : "") + "</div></div>" +
      '<div class="contenitore"><article class="domanda scheda" aria-live="polite">' +
      '<div class="dom-testa"><span class="dom-n">D' + n + '</span><span class="chip ' + colLivello(d.livello) + '">' + esc(d.livello) + "</span>" +
      (d.sezione ? '<span class="chip">' + esc(d.sezione) + "</span>" : "") + (d.tipo === "aperta" ? '<span class="chip viola">Domanda aperta</span>' : "") +
      (d.tipo === "abbina" ? '<span class="chip blu">Abbinamento</span>' : "") + "</div>" +
      '<h2 class="dom-testo">' + d.testo + "</h2>" + rispostaHtml(d, ses.risposte[n], lettura, "") + "</article>" +
      '<div class="gioco-azioni no-stampa">' + azioniDomanda(lettura, conTimer) + "</div>" +
      (lettura ? "" : '<p class="tasti">' + ic("info") + " Con la tastiera: " + (d.tipo === "mc" ? "A, B, C, D per scegliere · " : d.tipo === "vf" ? "V o F per scegliere · " : "") + "Invio per andare avanti" + (ses.imp.indietro ? " · ← per tornare indietro" : "") + ".</p>") +
      "</div></section>" + (ses.pausa ? pausaHtml() : "");
    collegaDomanda(d, lettura);
    inizioDomanda = Date.now();
    if (conTimer && !ses.pausa) avviaTimer(durata, lettura);
    var t = $(".dom-testo"); if (t && !ses.pausa) t.focus && t.setAttribute("tabindex", "-1");
  }
  function azioniDomanda(lettura, conTimer) {
    var ultima = ses.indice === ses.elenco.length - 1, b = [];
    if (lettura) {
      b.push('<button class="bt bt-chiaro" data-az="prec"' + (ses.indice === 0 ? " disabled" : "") + ">" + ic("indietro") + "Precedente</button>");
      if (conTimer) b.push('<button class="bt bt-scuro" data-az="pausa">' + ic(ses.pausa ? "gioca" : "pausa") + (ses.pausa ? "Riparti" : "Ferma il tempo") + "</button>");
      b.push('<button class="bt bt-chiaro" data-az="indice">' + ic("menu") + "Indice</button>");
      b.push('<button class="bt bt-primario" data-az="succ"' + (ultima ? " disabled" : "") + ">Successiva" + ic("avanti") + "</button>");
      return '<div class="az-sx">' + b.slice(0, -1).join("") + '</div><div class="az-dx">' + b[b.length - 1] + '<button class="bt bt-chiaro" data-az="esci">' + ic("chiudi") + "Chiudi</button></div>";
    }
    var sx = [];
    if (ses.imp.indietro) sx.push('<button class="bt bt-chiaro" data-az="prec"' + (ses.indice === 0 ? " disabled" : "") + ">" + ic("indietro") + "Indietro</button>");
    if (conTimer && ses.imp.pausa) sx.push('<button class="bt bt-chiaro" data-az="pausa">' + ic("pausa") + "Pausa</button>");
    sx.push('<button class="bt bt-chiaro" data-az="termina">' + ic("chiudi") + "Termina</button>");
    var risp = ses.risposte[ses.elenco[ses.indice]] != null;
    return '<div class="az-sx">' + sx.join("") + '</div><div class="az-dx"><button class="bt bt-primario bt-grande" data-az="succ">' +
      (ultima ? ic("ok") + "Concludi" : (risp ? "Avanti" : "Salta") + ic("avanti")) + "</button></div>";
  }
  function anello(rimasti, durata) {
    var r = 30, circ = 2 * Math.PI * r, f = Math.max(0, rimasti) / durata;
    var cls = rimasti <= T.ALLARME ? "allarme" : rimasti <= T.AVVISO ? "avviso" : "";
    return '<div class="anello ' + cls + '" role="timer" aria-label="Tempo rimasto"><svg viewBox="0 0 72 72"><circle class="an-fondo" cx="36" cy="36" r="' + r + '"/>' +
      '<circle class="an-arco" cx="36" cy="36" r="' + r + '" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + (circ * (1 - f)).toFixed(1) + '"/></svg>' +
      '<span class="an-num">' + Math.max(0, Math.ceil(rimasti)) + '</span><span class="an-s">sec</span></div>';
  }
  function aggiornaAnello(durata) {
    var a = $(".anello"); if (!a) return;
    var r = 30, circ = 2 * Math.PI * r, rim = Math.max(0, ses.rimasti);
    a.querySelector(".an-arco").setAttribute("stroke-dashoffset", (circ * (1 - rim / durata)).toFixed(1));
    a.querySelector(".an-num").textContent = Math.ceil(rim);
    a.classList.toggle("avviso", rim <= T.AVVISO && rim > T.ALLARME);
    a.classList.toggle("allarme", rim <= T.ALLARME);
  }
  function avviaTimer(durata, lettura) {
    var ultimo = Date.now(), ultimoSec = Math.ceil(ses.rimasti);
    timerId = setInterval(function () {
      var ora = Date.now(); ses.rimasti -= (ora - ultimo) / 1000; ultimo = ora;
      var sec = Math.ceil(ses.rimasti);
      if (sec !== ultimoSec) { ultimoSec = sec; salvaSes(); if (!lettura && sec <= T.ALLARME && sec > 0) bip(sec === 1 ? 990 : 760, .12); }
      aggiornaAnello(durata);
      if (ses.rimasti <= 0) {
        fermaTimer();
        var n = ses.elenco[ses.indice];
        if (lettura) { if (ses.indice < ses.elenco.length - 1) { ses.indice++; ses.rimasti = null; mostraDomanda(); } return; }
        if (ses.scadute.indexOf(n) < 0) ses.scadute.push(n);
        registraTempo(); salvaSes(); bip(440, .45);
        if (ses.imp.scadenza === "avanti") {
          scadutoVelo(function () { succ(true); });
        } else { GQ.avviso("Tempo scaduto per la domanda D" + n + ": rispondete e andate avanti.", "errore"); var a = $(".anello"); if (a) a.classList.add("finito"); }
      }
    }, 200);
  }
  function scadutoVelo(cb) {
    var v = document.createElement("div"); v.className = "scaduto"; v.innerHTML = '<div>' + ic("timer") + "<b>Tempo scaduto</b><span>Si passa alla domanda successiva</span></div>";
    document.body.appendChild(v); setTimeout(function () { if (v.parentNode) v.parentNode.removeChild(v); cb(); }, 1400);
  }
  function registraTempo() {
    var n = ses.elenco[ses.indice];
    if (!inizioDomanda) return;
    ses.tempi[n] = Math.round(((ses.tempi[n] || 0) + (Date.now() - inizioDomanda) / 1000) * 10) / 10;
    inizioDomanda = Date.now();
  }
  function pausaHtml() {
    return '<div class="velo pausa-velo"><div class="finestra" role="dialog" aria-modal="true"><h3>' + ic("pausa") + " In pausa</h3><p>Il tempo è fermo e la domanda è nascosta. Quando siete pronti, riprendete.</p>" +
      '<div class="azioni"><button class="bt bt-primario bt-grande" data-az="riprendi-pausa">' + ic("gioca") + "Riprendi</button></div></div></div>";
  }
  function succ(daTimer) {
    if (!daTimer) registraTempo();
    if (ses.indice < ses.elenco.length - 1) { ses.indice++; ses.rimasti = null; salvaSes(); mostraDomanda(); window.scrollTo(0, 0); }
    else concludi();
  }
  function prec() { registraTempo(); if (ses.indice > 0) { ses.indice--; ses.rimasti = null; salvaSes(); mostraDomanda(); } }
  function concludi() {
    fermaTimer();
    if (ses.modo !== "scheda") registraTempo();
    ses.finita = true; ses.finito = new Date().toISOString(); salvaSes();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    fine();
  }

  function rispostaHtml(d, val, lettura, pref) {
    var dis = lettura ? " disabled" : "", nome = pref + "q" + d.n;
    if (d.tipo === "mc") {
      return '<div class="opzioni' + (pref ? " compatte" : "") + '" role="radiogroup" aria-label="Risposte">' + d.opzioni.map(function (o, i) {
        var l = "ABCD"[i], on = val === l;
        return '<button type="button" class="opzione' + (on ? " scelta-fatta" : "") + '" role="radio" aria-checked="' + on + '" data-n="' + d.n + '" data-v="' + l + '"' + dis + '><span class="lettera">' + l +
          "</span><span class=\"o-testo\">" + (pref && !ses.imp.testoScheda ? "" : o) + "</span></button>";
      }).join("") + "</div>";
    }
    if (d.tipo === "vf") {
      return '<div class="opzioni vf' + (pref ? " compatte" : "") + '" role="radiogroup" aria-label="Vero o falso">' + ["Vero", "Falso"].map(function (v) {
        var on = val === v;
        return '<button type="button" class="opzione' + (on ? " scelta-fatta" : "") + '" role="radio" aria-checked="' + on + '" data-n="' + d.n + '" data-v="' + v + '"' + dis + '><span class="lettera">' + v.charAt(0) +
          '</span><span class="o-testo">' + v + "</span></button>";
      }).join("") + "</div>";
    }
    if (d.tipo === "abbina") {
      val = val || {};
      return '<div class="abbina"><ol class="abb-sig" type="a">' + "abcd".split("").map(function (k) { return '<li><b>' + k + ")</b> " + d.significati[k] + "</li>"; }).join("") + "</ol>" +
        '<div class="abb-righe">' + d.voci.map(function (v, i) {
          var num = String(i + 1);
          return '<div class="abb-riga"><span class="abb-voce"><b>' + num + ")</b> " + v + '</span><span class="abb-scelte" role="radiogroup" aria-label="' + esc(v.replace(/<[^>]+>/g, "")) + '">' +
            "abcd".split("").map(function (k) {
              var on = val[num] === k;
              return '<button type="button" class="abb-b' + (on ? " scelta-fatta" : "") + '" role="radio" aria-checked="' + on + '" data-n="' + d.n + '" data-voce="' + num + '" data-v="' + k + '"' + dis + ">" + k + "</button>";
            }).join("") + "</span></div>";
        }).join("") + "</div></div>";
    }
    return '<label class="aperta"><span class="sr">Risposta</span><textarea data-n="' + d.n + '" rows="' + (pref ? 2 : 5) + '" placeholder="' + (lettura ? "Domanda aperta: se ne parla insieme" : "Scrivete qui la vostra risposta…") + '" name="' + nome + '"' + dis + ">" + esc(typeof val === "string" ? val : "") + "</textarea></label>";
  }

  function scegli(n, v, voce) {
    var d = domanda(n);
    if (d.tipo === "abbina") {
      var o = ses.risposte[n] && typeof ses.risposte[n] === "object" ? ses.risposte[n] : {};
      if (o[voce] === v) delete o[voce]; else o[voce] = v;
      if (Object.keys(o).length) ses.risposte[n] = o; else delete ses.risposte[n];
    } else if (d.tipo === "aperta") {
      if (String(v).trim()) ses.risposte[n] = v; else delete ses.risposte[n];
    } else ses.risposte[n] = v;
    salvaSes();
  }
  function aggiornaScelte(cont, n) {
    var d = domanda(n), val = ses.risposte[n];
    $$('[data-n="' + n + '"]', cont).forEach(function (b) {
      if (b.tagName === "TEXTAREA") return;
      var on = d.tipo === "abbina" ? !!(val && val[b.getAttribute("data-voce")] === b.getAttribute("data-v")) : val === b.getAttribute("data-v");
      b.classList.toggle("scelta-fatta", on); b.setAttribute("aria-checked", on);
    });
  }

  function collegaDomanda(d, lettura) {
    var art = $(".domanda");
    if (!lettura) {
      art.addEventListener("click", function (e) {
        var b = e.target.closest("[data-v]"); if (!b) return;
        scegli(d.n, b.getAttribute("data-v"), b.getAttribute("data-voce")); aggiornaScelte(art, d.n); aggiornaPrimario();
      });
      var ta = $("textarea", art); if (ta) ta.addEventListener("input", function () { scegli(d.n, ta.value); aggiornaPrimario(); });
    }
    $$("[data-az]").forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute("data-az");
        if (a === "succ") succ(); else if (a === "prec") prec();
        else if (a === "pausa") { if (lettura) { ses.pausa = !ses.pausa; salvaSes(); mostraDomanda(); } else { registraTempo(); ses.pausa = true; salvaSes(); mostraDomanda(); } }
        else if (a === "riprendi-pausa") { ses.pausa = false; salvaSes(); mostraDomanda(); }
        else if (a === "termina") GQ.conferma("Terminare la prova adesso?", "Le domande senza risposta resteranno vuote. Potrete comunque esportare le risposte date.", "Termina", concludi);
        else if (a === "indice") indice();
        else if (a === "esci") { fermaTimer(); ses = null; GQ.togli(KS); passo = 5; maschera(); }
      };
    });
  }
  function aggiornaPrimario() {
    var b = $('[data-az="succ"]'); if (!b || ses.modo === "schermo") return;
    var ultima = ses.indice === ses.elenco.length - 1, risp = ses.risposte[ses.elenco[ses.indice]] != null;
    b.innerHTML = ultima ? ic("ok") + "Concludi" : (risp ? "Avanti" : "Salta") + ic("avanti");
    var f = $(".av-fatte"); if (f) f.textContent = Object.keys(ses.risposte).length + " risposte date";
  }
  function indice() {
    var q = Q(), v = document.createElement("div");
    v.className = "velo";
    v.innerHTML = '<div class="finestra larga" role="dialog" aria-modal="true" aria-label="Indice"><h3>' + ic("menu") + ' Vai a una domanda</h3><form class="vai"><label class="campo"><span>Numero della domanda</span>' +
      '<input type="number" min="1" max="' + ses.elenco.length + '" value="' + (ses.indice + 1) + '"></label><button class="bt bt-primario">Vai</button></form>' +
      q.parti.map(function (p) {
        return '<div class="ind-parte" style="--c:' + p.colore + '">Parte ' + p.roman + " · " + esc(p.titolo) + "</div>" + p.capitoli.map(function (c) {
          var pos = -1; for (var i = 0; i < ses.elenco.length; i++) if (domanda(ses.elenco[i]).cap === c.num) { pos = i; break; }
          return pos < 0 ? "" : '<button class="ind-cap" data-pos="' + pos + '">Cap. ' + c.num + " — " + esc(c.titolo) + "</button>";
        }).join("");
      }).join("") + '<div class="azioni"><button class="bt bt-chiaro" data-chiudi>Chiudi</button></div></div>';
    document.body.appendChild(v);
    function chiudi() { if (v.parentNode) v.parentNode.removeChild(v); }
    v.onclick = function (e) {
      if (e.target === v || e.target.closest("[data-chiudi]")) chiudi();
      var c = e.target.closest("[data-pos]"); if (c) { chiudi(); ses.indice = +c.getAttribute("data-pos"); ses.rimasti = null; mostraDomanda(); }
    };
    v.querySelector("form").onsubmit = function (e) { e.preventDefault(); var x = +v.querySelector("input").value; if (x >= 1 && x <= ses.elenco.length) { chiudi(); ses.indice = x - 1; ses.rimasti = null; mostraDomanda(); } };
  }

  document.addEventListener("keydown", function (e) {
    if (!ses || ses.finita || ses.modo === "scheda" || ses.pausa || $(".velo")) return;
    var t = e.target.tagName; if (t === "TEXTAREA" || t === "INPUT" || t === "SELECT") return;
    var k = e.key.toUpperCase(), n = ses.elenco[ses.indice], d = domanda(n);
    if (ses.modo === "schermo") {
      if (e.key === "ArrowRight" && ses.indice < ses.elenco.length - 1) { ses.indice++; ses.rimasti = null; mostraDomanda(); }
      if (e.key === "ArrowLeft" && ses.indice > 0) { ses.indice--; ses.rimasti = null; mostraDomanda(); }
      return;
    }
    if (d.tipo === "mc" && "ABCD".indexOf(k) >= 0 && k.length === 1) { scegli(n, k); aggiornaScelte($(".domanda"), n); aggiornaPrimario(); }
    else if (d.tipo === "mc" && "1234".indexOf(k) >= 0 && k.length === 1) { scegli(n, "ABCD"[+k - 1]); aggiornaScelte($(".domanda"), n); aggiornaPrimario(); }
    else if (d.tipo === "vf" && (k === "V" || k === "F")) { scegli(n, k === "V" ? "Vero" : "Falso"); aggiornaScelte($(".domanda"), n); aggiornaPrimario(); }
    else if (e.key === "Enter") { e.preventDefault(); succ(); }
    else if (e.key === "ArrowLeft" && ses.imp.indietro) prec();
  });

  /* =========================================================================
     SCHEDA RISPOSTE (tutte le domande insieme)
     ========================================================================= */
  function scheda() {
    fermaTimer();
    var q = Q(), set = {}, html = [];
    ses.elenco.forEach(function (n) { set[n] = true; });
    q.parti.forEach(function (p) {
      var caps = p.capitoli.map(function (c) {
        var ds = q.domande.filter(function (d) { return d.cap === c.num && set[d.n]; });
        if (!ds.length) return "";
        if (ses.imp.ordine === "mescolato") ds.sort(function (a, b) { return ses.elenco.indexOf(a.n) - ses.elenco.indexOf(b.n); });
        var gruppi = {}, ord = [];
        ds.forEach(function (d) { var k = d.sezione || d.livello; if (!gruppi[k]) { gruppi[k] = []; ord.push(k); } gruppi[k].push(d); });
        return '<section class="sch-cap"><h3><span class="sch-num" style="background:' + p.colore + '">' + c.num + "</span>" + esc(c.titolo) + "</h3>" + ord.map(function (k) {
          return '<div class="sch-liv"><span class="chip ' + colLivello(k) + '">' + esc(k) + "</span>" + gruppi[k].map(function (d) {
            return '<div class="sch-riga" id="r' + d.n + '"><span class="dom-n piccolo">D' + d.n + '</span><div class="sch-corpo">' + (ses.imp.testoScheda ? '<div class="sch-testo">' + d.testo + "</div>" : "") +
              rispostaHtml(d, ses.risposte[d.n], false, "s") + "</div></div>";
          }).join("") + "</div>";
        }).join("") + "</section>";
      }).join("");
      if (caps) html.push('<div class="sch-parte" style="--c:' + p.colore + '"><span>' + p.roman + "</span>" + esc(p.titolo) + "</div>" + caps);
    });
    app.innerHTML = '<section class="scheda-risposte"><div class="gioco-testa"><div class="contenitore gioco-testa-dentro">' +
      '<div class="avanzamento"><div class="av-testo"><b>Scheda risposte</b> · ' + esc(ses.info.nome) + ' <span class="av-fatte" id="sch-conta"></span></div>' +
      '<div class="av-barra"><span id="sch-barra"></span></div><div class="av-cap">' + esc(q.titolo) + "</div></div>" +
      (ses.schedaFine ? '<div class="orologio" id="orologio">' + ic("timer") + "<b></b></div>" : "") +
      '<button class="bt bt-primario" data-az="concludi">' + ic("ok") + "Ho finito</button></div></div>" +
      '<div class="stretto">' + html.join("") + '<div class="sch-fine"><button class="bt bt-primario bt-grande" data-az="concludi">' + ic("ok") + "Ho finito: vai al riepilogo</button></div></div></section>";
    var cont = $(".scheda-risposte");
    cont.addEventListener("click", function (e) {
      var b = e.target.closest("[data-v]"); if (!b) return;
      var n = +b.getAttribute("data-n"); scegli(n, b.getAttribute("data-v"), b.getAttribute("data-voce")); aggiornaScelte(cont, n); contaScheda();
    });
    $$("textarea", cont).forEach(function (t) { t.addEventListener("input", function () { scegli(+t.getAttribute("data-n"), t.value); contaScheda(); }); });
    $$('[data-az="concludi"]').forEach(function (b) { b.onclick = function () {
      var mancano = ses.elenco.length - Object.keys(ses.risposte).length;
      if (mancano) GQ.conferma("Consegnare la scheda?", "Mancano ancora <b>" + mancano + "</b> risposte. Potete tornare a completarle oppure consegnare così.", "Consegna", concludi);
      else concludi();
    }; });
    contaScheda();
    if (ses.schedaFine) {
      var orologio = function () {
        var r = Math.round((ses.schedaFine - Date.now()) / 1000), o = $("#orologio");
        if (!o) return fermaTimer();
        o.querySelector("b").textContent = r > 0 ? Math.floor(r / 60) + ":" + ("0" + r % 60).slice(-2) : "0:00";
        o.classList.toggle("avviso", r <= 300); o.classList.toggle("allarme", r <= 60);
        if (r <= 0) { fermaTimer(); bip(440, .5); ses.scadute = ses.elenco.filter(function (n) { return ses.risposte[n] == null; }); GQ.avviso("Tempo scaduto: la scheda è stata consegnata.", "errore"); concludi(); }
      };
      orologio(); timerId = setInterval(orologio, 500);
    }
  }
  function contaScheda() {
    var f = Object.keys(ses.risposte).length, t = ses.elenco.length;
    var c = $("#sch-conta"); if (c) c.textContent = f + " / " + t + " risposte";
    var b = $("#sch-barra"); if (b) b.style.width = Math.round(f / t * 100) + "%";
  }

  /* =========================================================================
     FINE: riepilogo ed esportazione
     ========================================================================= */
  function fine() {
    fermaTimer();
    var q = Q(), tot = ses.elenco.length, date = ses.elenco.filter(function (n) { return ses.risposte[n] != null; }).length;
    var durata = (new Date(ses.finito || Date.now()) - new Date(ses.iniziato)) / 1000;
    var tempiTot = 0; Object.keys(ses.tempi).forEach(function (k) { tempiTot += ses.tempi[k]; });
    var righe = ses.elenco.map(function (n) {
      var d = domanda(n), v = ses.risposte[n];
      return "<tr><td><b>D" + n + "</b></td><td>" + (v == null ? '<span class="vuota">—</span>' : esc(testoRisposta(d, v))) + "</td><td>" + (ses.tempi[n] != null ? Math.round(ses.tempi[n]) + " s" : "") +
        (ses.scadute.indexOf(n) >= 0 ? ' <span class="chip rosso">tempo scaduto</span>' : "") + "</td></tr>";
    }).join("");
    app.innerHTML = '<section class="fine contenitore"><div class="fine-testa">' + GQ.logo("logo-fine") + '<div><span class="occhiello">Prova conclusa</span><h1>Grazie, ' + esc(ses.info.nome || "") + "!</h1>" +
      "<p>" + esc(q.titolo) + " · " + esc(new Date(ses.iniziato).toLocaleString("it-IT")) + "</p></div></div>" +
      '<div class="tessere">' + tessera("ok", date, "risposte date su " + tot, "verde") + tessera("salta", tot - date, "senza risposta", "oro") +
      tessera("timer", ses.scadute.length, "con tempo scaduto", "rosso") + tessera("grafico", GQ.durata(durata), "durata della prova", "blu") +
      (tempiTot ? tessera("trofeo", Math.round(tempiTot / Math.max(1, Object.keys(ses.tempi).length)) + " s", "in media per domanda", "viola") : "") + "</div>" +
      '<div class="scheda consegna"><div class="consegna-ico">' + ic("esporta") + "</div><div><h2>Ultimo passo: consegnate le risposte</h2>" +
      "<p>Premete <b>Esporta le risposte</b>: si scarica un piccolo file <code>.json</code>. Inviatelo a chi corregge (email, chiavetta, cartella condivisa). " +
      "Il file contiene solo le vostre risposte: <b>le soluzioni le conosce soltanto chi corregge</b>.</p>" +
      '<div class="consegna-az"><button class="bt bt-primario bt-grande" data-az="esporta">' + ic("scarica") + "Esporta le risposte (.json)</button>" +
      '<button class="bt bt-chiaro" data-az="stampa">' + ic("stampa") + "Stampa il riepilogo</button>" +
      '<button class="bt bt-chiaro" data-az="nuova">' + ic("mescola") + "Nuova prova</button></div>" +
      (ses.esportata ? '<p class="esportata">' + ic("ok") + " Risposte già esportate in <b>" + esc(ses.esportata) + "</b>.</p>" : "") + "</div></div>" +
      '<details class="scheda dettaglio"><summary>Vedi tutte le risposte date</summary><table class="tabella"><thead><tr><th>Domanda</th><th>Risposta</th><th>Tempo</th></tr></thead><tbody>' + righe + "</tbody></table></details>" +
      '<div class="stampa-solo"><h2>Riepilogo risposte — ' + esc(q.titolo) + "</h2><p>" + esc([ses.info.nome, ses.info.centro, ses.info.gruppo, ses.info.data].filter(Boolean).join(" · ")) + '</p><table class="tabella">' + righe +
      "</table><p class='piccolo'>Opera di Danilo D'Auria · CC BY-NC-SA 4.0</p></div></section>";
    $('[data-az="esporta"]').onclick = esporta;
    $('[data-az="stampa"]').onclick = function () { window.print(); };
    $('[data-az="nuova"]').onclick = function () {
      var vai2 = function () { ses = null; GQ.togli(KS); passo = 4; maschera(); };
      if (!ses.esportata) GQ.conferma("Iniziare una nuova prova?", "Le risposte di questa prova <b>non sono ancora state esportate</b> e andranno perse.", "Nuova prova", vai2, true); else vai2();
    };
  }
  function tessera(icona, valore, testo, col) {
    return '<div class="tessera ' + col + '"><span class="t-ico">' + ic(icona) + '</span><b>' + esc(valore) + "</b><span>" + esc(testo) + "</span></div>";
  }
  function testoRisposta(d, v) {
    if (d.tipo === "abbina") return ["1", "2", "3", "4"].map(function (k) { return k + "-" + (v[k] || "?"); }).join(", ");
    if (d.tipo === "aperta") return v.length > 120 ? v.slice(0, 117) + "…" : v;
    return v;
  }
  function esporta() {
    var q = Q(), risposte = {}, i;
    for (i = 0; i < ses.elenco.length; i++) { var n = ses.elenco[i]; if (ses.risposte[n] != null) risposte[String(n)] = ses.risposte[n]; }
    var dati = {
      tipo: ses.quiz === "grande" ? "feniceos_grande_quiz_risposte" : "feniceos_manuale_quiz_risposte",
      versione: 2, quiz: ses.quiz, titolo: q.titolo, totaleDomande: q.totale,
      opera: "Il Grande Quiz dell'Informatica — opera di Danilo D'Auria, CC BY-NC-SA 4.0",
      app: "grande-quiz " + GQ.VERSIONE, esportatoIl: new Date().toISOString(),
      info: ses.info,
      impostazioni: { modalita: ses.modo, timerSecondi: ses.modo === "tempo" && ses.imp.timer ? ses.imp.secondi : null,
        schedaMinuti: ses.modo === "scheda" && ses.imp.schedaTimer ? ses.imp.schedaMinuti : null, alloScadere: ses.imp.scadenza,
        indietro: ses.imp.indietro, ordine: ses.imp.ordine, ambito: ses.imp.ambito },
      domande: ses.elenco, answers: risposte, tempi: ses.tempi, scadute: ses.scadute,
      iniziato: ses.iniziato, finito: ses.finito || new Date().toISOString(),
      durataSecondi: Math.round((new Date(ses.finito || Date.now()) - new Date(ses.iniziato)) / 1000)
    };
    var nome = (ses.quiz === "grande" ? "GrandeQuiz" : "QuizManuale") + "_Risposte_" + (GQ.slug(ses.info.nome) || "partecipante") + "_" +
      (ses.info.data || GQ.oggi()) + "_" + ("0" + new Date().getHours()).slice(-2) + ("0" + new Date().getMinutes()).slice(-2) + ".json";
    GQ.scaricaFile(nome, JSON.stringify(dati, null, 2), "application/json");
    ses.esportata = nome; salvaSes();
    GQ.avviso("Risposte esportate: " + nome, "ok");
    fine();
  }

  /* ---------- avvio della pagina ---------- */
  GQ.monta("../", "quiz/");
  var par = /[?&]quiz=(grande|manuale)/.exec(location.search);
  if (par && QUIZ[par[1]]) { imp.quiz = par[1]; salvaImp(); }
  var pm = /[?&]modo=(tempo|scheda|schermo)/.exec(location.search);
  if (pm) { imp.modo = pm[1]; salvaImp(); passo = 2; }
  if (!QUIZ.grande) { app.innerHTML = '<p class="contenitore">Dati del quiz mancanti.</p>'; return; }
  if (ses && !ses.finita && /[?&]riprendi/.test(location.search)) vai(); else if (ses && ses.finita && !ses.esportata) fine(); else maschera();
  GQ._test = { imp: function () { return imp; }, ses: function () { return ses; }, T: T };
})();
