/* =============================================================================
   IL GRANDE QUIZ DELL'INFORMATICA — area riservata di Danilo D'Auria
   1) password  → apre la cassaforte cifrata (AES-256-GCM)
   2) Google Authenticator (6 cifre) oppure codice di emergenza
   3) cruscotto: Correttore automatico, presentazione a squadre, quiz e manuale con le soluzioni, PDF riservati.
   Le soluzioni restano solo in memoria finché la pagina è aperta; si richiude da sola dopo 20 minuti di inattività.
   Ideazione e cura: Danilo D'Auria · Codice MIT · Contenuti CC BY-NC-SA 4.0
   ============================================================================= */
(function () {
  "use strict";
  var GQ = window.GQ, C = window.GQC, $ = GQ.$, $$ = GQ.$$, esc = GQ.esc, ic = GQ.icona, QUIZ = window.GQ_QUIZ || {};
  var app = $("#app"), byte = null, tesoro = null, schede = [], selezionata = -1, filtro = "errori";
  var INATTIVO = 20 * 60 * 1000, ultimoGesto = Date.now();
  GQ.monta("../", "riservato/");

  if (!C.disponibile()) { app.innerHTML = '<div class="contenitore"><div class="scheda"><h2>Browser non adatto</h2><p>Serve un browser recente: Chrome, Edge, Firefox o Safari aggiornati.</p></div></div>'; return; }

  /* ---------- 1. trovare il file della cassaforte ---------- */
  function carica() {
    serratura("cerco");
    fetch("cassaforte.bin", { cache: "no-store" }).then(function (r) {
      if (r.status === 404) throw { manca: true };
      if (!r.ok) throw new Error("risposta " + r.status);
      return r.arrayBuffer();
    }).then(function (b) { pronto(new Uint8Array(b)); }).catch(function (e) {
      serratura(e && e.manca ? "manca" : "scegli");
    });
  }
  function pronto(u8) {
    try { C.testa(u8); byte = u8; serratura("password"); }
    catch (e) { serratura("scegli", e.message); }
  }

  /* ---------- 2. la serratura ---------- */
  function attesa() { var a = GQ.leggi("gq.tentativi", { n: 0, fino: 0 }); return a; }
  function serratura(fase, msg) {
    var corpo = "";
    if (fase === "cerco") corpo = "<p>Un momento…</p>";
    else if (fase === "manca") corpo = "<p>La cassaforte delle soluzioni <b>non è ancora stata creata</b> per questo sito.</p>" +
      '<p class="piccolo">Danilo: aprite <a href="crea-cassaforte.html">Crea la cassaforte</a>, poi copiate <code>cassaforte.bin</code> in <code>docs/riservato/</code> e fate Push.</p>' + sceltaFile();
    else if (fase === "scegli") corpo = "<p>Aprendo il sito dal computer (doppio clic) il browser non legge da solo la cassaforte: sceglietela voi.</p>" +
      (msg ? '<p class="attesa">' + esc(msg) + "</p>" : "") + sceltaFile();
    else if (fase === "password") {
      var a = attesa(), resta = Math.ceil((a.fino - Date.now()) / 1000);
      corpo = '<div class="passaggi"><span class="on"></span><span></span></div><form id="f-pw" autocomplete="off"><label class="campo"><span>Password</span><span class="pw">' +
        '<input type="password" id="pw" autocomplete="current-password" required autofocus><button type="button" id="occhio" aria-label="Mostra la password">' + ic("occhio") + "</button></span></label>" +
        '<button class="bt bt-primario bt-grande" id="sblocca"' + (resta > 0 ? " disabled" : "") + ">" + ic("chiave") + "Apri la cassaforte</button>" +
        '<p id="msg" class="' + (resta > 0 ? "attesa" : "") + '">' + (resta > 0 ? "Troppi tentativi: riprovate tra " + resta + " secondi." : esc(msg || "")) + "</p></form>";
    } else if (fase === "totp") {
      corpo = '<div class="passaggi"><span class="on"></span><span class="on"></span></div><p>Password giusta. Ora il codice di <b>Google Authenticator</b> (voce <b>GrandeQuiz</b>).</p>' +
        '<form id="f-totp"><div class="cifre">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<input inputmode="numeric" maxlength="1" aria-label="Cifra ' + (i + 1) + '" data-c="' + i + '">'; }).join("") + "</div>" +
        '<button class="bt bt-primario bt-grande">' + ic("scudo") + "Conferma</button><p id=\"msg\">" + esc(msg || "") + "</p>" +
        '<p style="text-align:center"><button type="button" class="link" id="usa-emergenza">Ho perso il telefono: uso il codice di emergenza</button></p></form>';
    } else if (fase === "emergenza") {
      corpo = '<form id="f-em"><label class="campo"><span>Codice di emergenza</span><input id="em" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required></label>' +
        '<button class="bt bt-primario bt-grande">' + ic("scudo") + "Conferma</button><p id=\"msg\">" + esc(msg || "") + "</p>" +
        '<p class="piccolo">Dopo, rifate il collegamento con un telefono nuovo: <a href="crea-cassaforte.html">Crea la cassaforte</a>.</p></form>';
    }
    app.innerHTML = '<section class="serratura"><div class="serratura-box"><div class="serratura-ico">' + ic("lucchetto") + "</div>" +
      "<h1>Area riservata</h1><p>Soluzioni, correttore e presentazione a squadre del <b>Grande Quiz</b>. Accesso riservato a <b>Danilo D'Auria</b>.</p>" + corpo +
      '<p class="onesto">' + ic("info") + " Le soluzioni sono cifrate con AES-256 e si aprono solo nel vostro browser. Nessun dato viene inviato in rete.</p></div></section>";
    collegaSerratura(fase);
  }
  function sceltaFile() {
    return '<label class="bt bt-chiaro file-bt" style="margin-top:.6rem">' + ic("carica") + 'Scegli il file cassaforte.bin<input type="file" id="fbin" accept=".bin" hidden></label>';
  }
  function collegaSerratura(fase) {
    var f = $("#fbin");
    if (f) f.onchange = function () { var x = f.files[0]; if (!x) return; var r = new FileReader(); r.onload = function () { pronto(new Uint8Array(r.result)); }; r.readAsArrayBuffer(x); };
    if (fase === "password") {
      var a = attesa(), resta = a.fino - Date.now();
      if (resta > 0) setTimeout(function () { serratura("password"); }, resta + 200);
      $("#occhio").onclick = function () { var p = $("#pw"); p.type = p.type === "password" ? "text" : "password"; };
      $("#f-pw").onsubmit = function (e) {
        e.preventDefault();
        var pw = $("#pw").value; if (!pw) return;
        $("#sblocca").disabled = true; $("#msg").className = ""; $("#msg").textContent = "Apro la cassaforte…";
        C.apri(byte, pw).then(function (o) {
          GQ.salva("gq.tentativi", { n: 0, fino: 0 });
          tesoro = o; serratura("totp");
        }).catch(function (err) {
          if (!err.password) { serratura("password", "Errore: " + err.message); return; }
          var t = attesa(); t.n++; if (t.n >= 3) t.fino = Date.now() + Math.min(300, 15 * Math.pow(2, t.n - 3)) * 1000;
          GQ.salva("gq.tentativi", t);
          serratura("password", "Password non corretta.");
        });
      };
    }
    if (fase === "totp") {
      var cif = $$("[data-c]");
      cif.forEach(function (c, i) {
        c.oninput = function () {
          var v = c.value.replace(/\D/g, "");
          if (v.length > 1) { v.split("").slice(0, 6 - i).forEach(function (d, j) { cif[i + j].value = d; }); cif[Math.min(5, i + v.length - 1)].focus(); }
          else { c.value = v; if (v && i < 5) cif[i + 1].focus(); }
          if (cif.every(function (x) { return x.value; })) $("#f-totp").requestSubmit ? $("#f-totp").requestSubmit() : $("#f-totp button").click();
        };
        c.onkeydown = function (e) { if (e.key === "Backspace" && !c.value && i > 0) cif[i - 1].focus(); };
      });
      cif[0].focus();
      $("#f-totp").onsubmit = function (e) {
        e.preventDefault();
        var codice = cif.map(function (x) { return x.value; }).join("");
        C.verificaTotp(tesoro.sicurezza.totp, codice).then(function (ok) {
          if (ok) aperta(); else { serratura("totp", "Codice non valido. Controllate che l'ora del telefono e del computer sia giusta, poi riprovate."); }
        });
      };
      $("#usa-emergenza").onclick = function () { serratura("emergenza"); };
    }
    if (fase === "emergenza") {
      $("#f-em").onsubmit = function (e) {
        e.preventDefault();
        C.sha256($("#em").value.toUpperCase().replace(/[^A-Z0-9]/g, "")).then(function (h) {
          if (h === tesoro.sicurezza.emergenzaHash) aperta(); else serratura("emergenza", "Codice di emergenza non valido.");
        });
      };
    }
  }

  /* ---------- 3. cruscotto ---------- */
  function aperta() {
    ultimoGesto = Date.now();
    ["click", "keydown", "pointermove"].forEach(function (ev) { document.addEventListener(ev, function () { ultimoGesto = Date.now(); }, { passive: true }); });
    setInterval(function () { if (tesoro && Date.now() - ultimoGesto > INATTIVO) blocca("Area richiusa dopo 20 minuti di inattività."); }, 15000);
    cruscotto();
  }
  function blocca(msg) { tesoro = null; schede = []; GQ.avviso(msg || "Area riservata chiusa.", "ok"); serratura("password"); }
  function cruscotto() {
    var p = tesoro.pagine || {}, pdf = tesoro.pdf || {};
    app.innerHTML = '<section class="cruscotto contenitore"><div class="crusc-testa"><div><span class="occhiello">Area riservata · aperta</span><h1>Buon lavoro, Danilo</h1>' +
      "<p>Cassaforte versione " + esc(tesoro.versione) + " del " + esc(tesoro.creato) + ". Si richiude da sola dopo 20 minuti senza attività.</p></div>" +
      '<button class="bt bt-scuro" id="blocca">' + ic("lucchetto") + "Chiudi l'area riservata</button></div>" +
      '<div class="tessere-r">' +
      '<a class="tr" href="#correttore" id="vai-corr"><span class="tr-ico" style="background:var(--arancio)">' + ic("ok") + "</span><b>Correttore automatico</b><span>Caricate i file .json dei partecipanti: punteggi per livello, errori e spiegazioni.</span></a>" +
      Object.keys(p).map(function (k) {
        var icona = k === "presentazione" ? "squadra" : k === "quiz_soluzioni" ? "trofeo" : "libro";
        return '<button class="tr" data-pagina="' + k + '"><span class="tr-ico">' + ic(icona) + "</span><b>" + esc(p[k].titolo) + "</b><span>Si apre in una nuova scheda del browser.</span></button>";
      }).join("") +
      Object.keys(pdf).map(function (k) {
        var nomi = { "Il_Grande_Quiz_dellInformatica_Risposte.pdf": "Grande Quiz — libro delle risposte", "FeniceOS_Foglio_Risposte.pdf": "Manuale FeniceOS — foglio delle risposte",
          "FeniceOS_Manuale_Tecnologia_Gentile.pdf": "Manuale «FeniceOS — Tecnologia Gentile» (con appendice)" };
        return '<button class="tr" data-pdf="' + esc(k) + '"><span class="tr-ico" style="background:var(--viola)">' + ic("pdf") + "</span><b>" + esc(nomi[k] || k.replace(/_/g, " ").replace(/\.pdf$/, "")) + "</b><span>PDF riservato: scarica.</span></button>";
      }).join("") + "</div>" +
      '<h2 id="correttore">' + ic("ok") + " Correttore automatico</h2>" +
      '<label class="zona" id="zona">' + ic("carica") + "<b>Trascinate qui i file .json delle risposte</b><span>oppure cliccate per sceglierli (anche molti insieme)</span>" +
      '<input type="file" id="fjson" accept=".json,application/json" multiple hidden></label>' +
      '<div id="ris"></div><div id="dett"></div></section>';
    $("#blocca").onclick = function () { blocca(); };
    $$("[data-pagina]").forEach(function (b) { b.onclick = function () { apriPagina(b.getAttribute("data-pagina")); }; });
    $$("[data-pdf]").forEach(function (b) {
      b.onclick = function () { var k = b.getAttribute("data-pdf"); GQ.scaricaFile(k, new Blob([C.deb64(pdf[k])], { type: "application/pdf" })); };
    });
    var z = $("#zona"), f = $("#fjson");
    f.onchange = function () { leggiFile(f.files); f.value = ""; };
    z.addEventListener("dragover", function (e) { e.preventDefault(); z.classList.add("sopra"); });
    z.addEventListener("dragleave", function () { z.classList.remove("sopra"); });
    z.addEventListener("drop", function (e) { e.preventDefault(); z.classList.remove("sopra"); leggiFile(e.dataTransfer.files); });
    disegnaRisultati();
  }
  function apriPagina(k) {
    var url = URL.createObjectURL(new Blob([tesoro.pagine[k].html], { type: "text/html" }));
    var w = window.open(url, "_blank");
    if (!w) GQ.avviso("Il browser ha bloccato la nuova scheda: consentite le finestre per questo sito.", "errore");
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  /* ---------- 4. correzione ---------- */
  function leggiFile(lista) {
    Array.prototype.forEach.call(lista, function (file) {
      var r = new FileReader();
      r.onload = function () {
        try { schede.push(correggi(JSON.parse(r.result), file.name)); schede.sort(function (a, b) { return b.pct - a.pct; }); disegnaRisultati(); }
        catch (e) { GQ.avviso(file.name + ": " + e.message, "errore"); }
      };
      r.readAsText(file);
    });
  }
  function correggi(d, nomeFile) {
    var quiz = d.quiz || (d.tipo === "feniceos_grande_quiz_risposte" ? "grande" : d.tipo === "feniceos_manuale_quiz_risposte" ? "manuale" : null);
    if (!quiz || !QUIZ[quiz] || !d.answers) throw new Error("non è un file di risposte del Grande Quiz");
    var q = QUIZ[quiz], k = tesoro.chiavi[quiz], elenco = d.domande && d.domande.length ? d.domande : q.domande.map(function (x) { return x.n; });
    var perLiv = {}, voci = [], giuste = 0, chiuse = 0, aperte = 0;
    elenco.forEach(function (n) {
      var dom = null; for (var i = 0; i < q.domande.length; i++) if (q.domande[i].n === +n) { dom = q.domande[i]; break; }
      if (!dom) return;
      var chiave = k[String(n)] || {}, data = d.answers[String(n)], esito, parziale = null;
      var L = perLiv[dom.livello] = perLiv[dom.livello] || { giuste: 0, totale: 0 };
      if (dom.tipo === "aperta") { esito = "aperta"; aperte++; }
      else {
        chiuse++; L.totale++;
        if (data == null || data === "") esito = "vuota";
        else if (dom.tipo === "abbina") {
          var ok = 0; ["1", "2", "3", "4"].forEach(function (v) { if (data[v] && chiave.giusta && data[v] === chiave.giusta[v]) ok++; });
          parziale = ok; esito = ok === 4 ? "giusta" : "sbagliata";
        } else esito = data === chiave.giusta ? "giusta" : "sbagliata";
        if (esito === "giusta") { giuste++; L.giuste++; }
      }
      voci.push({ n: +n, dom: dom, data: data, giusta: chiave.giusta, spiega: chiave.spiega, esito: esito, parziale: parziale,
        tempo: d.tempi ? d.tempi[String(n)] : null, scaduta: (d.scadute || []).indexOf(+n) >= 0 });
    });
    var pct = chiuse ? Math.round(giuste / chiuse * 1000) / 10 : 0;
    var tempi = voci.filter(function (v) { return v.tempo != null; }).map(function (v) { return v.tempo; });
    return { file: nomeFile, quiz: quiz, titolo: q.titolo, info: d.info || {}, perLiv: perLiv, voci: voci, giuste: giuste, chiuse: chiuse, aperte: aperte, pct: pct,
      date: voci.filter(function (v) { return v.data != null && v.data !== ""; }).length, scadute: (d.scadute || []).length,
      media: tempi.length ? Math.round(tempi.reduce(function (a, b) { return a + b; }, 0) / tempi.length) : null,
      modalita: d.impostazioni ? d.impostazioni.modalita : "scheda", timer: d.impostazioni ? d.impostazioni.timerSecondi : null, quando: d.finito || d.esportatoIl };
  }
  function giudizio(p) {
    return p >= 90 ? ["Eccellente", ""] : p >= 75 ? ["Ottimo", ""] : p >= 60 ? ["Buono", "medio"] : p >= 50 ? ["Sufficiente", "medio"] : ["Da ripassare insieme", "basso"];
  }
  function disegnaRisultati() {
    var r = $("#ris"); if (!r) return;
    if (!schede.length) { r.innerHTML = '<p class="piccolo" style="margin-top:.8rem">' + ic("info") + " Nessuna scheda caricata. I file non lasciano mai questo computer.</p>"; $("#dett").innerHTML = ""; return; }
    r.innerHTML = '<div class="barra-az"><button class="bt bt-chiaro bt-piccolo" id="csv">' + ic("scarica") + "Esporta il riepilogo (CSV per Excel)</button>" +
      '<button class="bt bt-chiaro bt-piccolo" id="svuota">' + ic("cestino") + "Svuota</button></div>" +
      '<div class="risultati"><table><thead><tr><th>#</th><th>Partecipante</th><th>Centro / gruppo</th><th>Quiz</th><th>Giuste</th><th>Punteggio</th><th>Per livello</th><th>Tempo medio</th><th>Scadute</th></tr></thead><tbody>' +
      schede.map(function (s, i) {
        return '<tr data-i="' + i + '"><td>' + (i + 1) + "</td><td><b>" + esc(s.info.nome || s.file) + "</b></td><td>" + esc([s.info.centro, s.info.gruppo].filter(Boolean).join(" · ")) + "</td><td>" + esc(s.quiz === "grande" ? "Grande Quiz" : "Manuale") +
          "</td><td>" + s.giuste + " / " + s.chiuse + '</td><td><span class="pct"><i><b style="width:' + s.pct + '%"></b></i>' + s.pct + " %</span></td><td>" +
          Object.keys(s.perLiv).filter(function (l) { return s.perLiv[l].totale; }).map(function (l) { return esc(l.split(" ")[0]) + " " + s.perLiv[l].giuste + "/" + s.perLiv[l].totale; }).join(" · ") +
          "</td><td>" + (s.media != null ? s.media + " s" : "—") + "</td><td>" + s.scadute + "</td></tr>";
      }).join("") + "</tbody></table></div>";
    $$("[data-i]").forEach(function (tr) { tr.onclick = function () { selezionata = +tr.getAttribute("data-i"); dettaglio(); }; });
    $("#csv").onclick = csv;
    $("#svuota").onclick = function () { schede = []; selezionata = -1; disegnaRisultati(); };
    if (selezionata >= 0 && schede[selezionata]) dettaglio();
  }
  function testoDato(v) {
    if (v.data == null || v.data === "") return "<i>nessuna risposta</i>";
    if (v.dom.tipo === "abbina") return esc(["1", "2", "3", "4"].map(function (k) { return k + "-" + (v.data[k] || "?"); }).join(", ")) + (v.parziale != null ? " (" + v.parziale + "/4 abbinamenti giusti)" : "");
    if (v.dom.tipo === "mc") { var i = "ABCD".indexOf(v.data); return esc(v.data) + (i >= 0 ? ") " + v.dom.opzioni[i] : ""); }
    return esc(v.data);
  }
  function dettaglio() {
    var s = schede[selezionata], g = giudizio(s.pct);
    var voci = s.voci.filter(function (v) { return filtro === "tutte" || (filtro === "errori" ? v.esito === "sbagliata" || v.esito === "vuota" : v.esito === "aperta"); });
    $("#dett").innerHTML = '<div class="scheda dett"><div class="dett-testa"><div><span class="occhiello">Scheda di valutazione · ' + esc(s.titolo) + "</span><h2>" + esc(s.info.nome || s.file) + "</h2>" +
      "<p>" + esc([s.info.centro, s.info.gruppo, s.info.data].filter(Boolean).join(" · ")) + (s.timer ? " · timer " + s.timer + " s per domanda" : "") + '</p></div><span class="giudizio ' + g[1] + '">' + g[0] + " · " + s.pct + " %</span></div>" +
      '<div class="liv-grid">' + Object.keys(s.perLiv).filter(function (l) { return s.perLiv[l].totale; }).map(function (l) {
        var x = s.perLiv[l]; return '<div class="liv"><span>' + esc(l) + "</span><b>" + x.giuste + " / " + x.totale + "</b></div>"; }).join("") +
      '<div class="liv"><span>Totale</span><b>' + s.giuste + " / " + s.chiuse + "</b></div>" + (s.aperte ? '<div class="liv"><span>Domande aperte</span><b>' + s.aperte + "</b></div>" : "") + "</div>" +
      '<div class="filtri no-stampa">' + [["errori", "Errori e risposte mancanti"], ["aperte", "Domande aperte"], ["tutte", "Tutte"]].map(function (f) {
        return '<button class="seg' + (filtro === f[0] ? " seg-on" : "") + '" data-f="' + f[0] + '">' + f[1] + "</button>"; }).join("") +
      '<button class="bt bt-chiaro bt-piccolo" id="stampa-dett">' + ic("stampa") + "Stampa la scheda</button></div>" +
      '<div class="voci">' + (voci.length ? voci.map(function (v) {
        var giusta = v.dom.tipo === "abbina" ? ["1", "2", "3", "4"].map(function (k) { return k + "-" + (v.giusta || {})[k]; }).join(", ")
          : v.dom.tipo === "mc" ? v.giusta + ") " + (v.dom.opzioni["ABCD".indexOf(v.giusta)] || "") : v.giusta;
        return '<div class="voce ' + v.esito + '"><span class="dn">D' + v.n + '</span><div><div class="vt">' + v.dom.testo + "</div>" +
          '<div class="vr"><b>Risposta data:</b> ' + testoDato(v) + (v.esito !== "aperta" && v.esito !== "giusta" && v.giusta ? " · <b>Giusta:</b> " + giusta : "") +
          (v.tempo != null ? " · " + Math.round(v.tempo) + " s" : "") + (v.scaduta ? ' <span class="chip rosso">tempo scaduto</span>' : "") + "</div>" +
          (v.spiega && v.esito !== "giusta" ? '<div class="vs">' + v.spiega + "</div>" : "") + "</div></div>";
      }).join("") : '<p class="piccolo">Niente da mostrare con questo filtro.</p>') + "</div>" +
      '<p class="piccolo" style="margin-top:1rem">Correzione automatica — Il Grande Quiz dell\'Informatica, opera di Danilo D\'Auria (CC BY-NC-SA 4.0). Le domande aperte si valutano a voce.</p></div>';
    $$("[data-f]").forEach(function (b) { b.onclick = function () { filtro = b.getAttribute("data-f"); dettaglio(); }; });
    $("#stampa-dett").onclick = function () { window.print(); };
    $("#dett").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function csv() {
    var livelli = []; schede.forEach(function (s) { Object.keys(s.perLiv).forEach(function (l) { if (livelli.indexOf(l) < 0) livelli.push(l); }); });
    var q = function (x) { x = x == null ? "" : String(x); return /[;"\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    var righe = [["Nome", "Centro", "Gruppo", "Data", "Quiz", "Modalita"].concat(livelli).concat(["Giuste", "Domande chiuse", "Percentuale", "Domande aperte", "Tempo medio (s)", "Tempo scaduto", "File"])];
    schede.forEach(function (s) {
      righe.push([s.info.nome, s.info.centro, s.info.gruppo, s.info.data, s.titolo, s.modalita].concat(livelli.map(function (l) { var x = s.perLiv[l]; return x && x.totale ? x.giuste + "/" + x.totale : ""; }))
        .concat([s.giuste, s.chiuse, String(s.pct).replace(".", ","), s.aperte, s.media, s.scadute, s.file]));
    });
    GQ.scaricaFile("GrandeQuiz_Riepilogo_" + GQ.oggi() + ".csv", "﻿" + righe.map(function (r) { return r.map(q).join(";"); }).join("\r\n"), "text/csv;charset=utf-8");
  }

  window._gqRis = { correggi: function (d) { return correggi(d, "test.json"); }, aperta: function () { return !!tesoro; } };
  carica();
})();
