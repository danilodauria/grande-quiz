/* =============================================================================
   IL GRANDE QUIZ DELL'INFORMATICA — funzioni comuni a tutte le pagine
   (icone, marchio, piè di pagina con la paternità dell'opera, avvisi, preferenze di lettura)
   Ideazione e cura: Danilo D'Auria · Codice MIT · Contenuti CC BY-NC-SA 4.0
   JavaScript ES5, nessuna libreria esterna, funziona anche aprendo i file con doppio clic.
   ============================================================================= */
(function () {
  "use strict";
  var GQ = window.GQ = window.GQ || {};
  GQ.AUTORE = "Danilo D'Auria";
  GQ.VERSIONE = "1.0.0";

  /* ---------- icone (tratto 1.8, griglia 24) ---------- */
  var I = {
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5M12 2.5V5M18.5 6.5l1.5-1.5"/>',
    scheda: '<rect x="5" y="3.5" width="14" height="18" rx="2.5"/><path d="M9 3.5h6v2.5H9zM8.5 11l1.5 1.5 3-3M8.5 16.5l1.5 1.5 3-3M15 11.5h1M15 17h1"/>',
    schermo: '<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M8 20.5h8M12 16.5v4M7 8.5h6M7 11.5h10"/>',
    lucchetto: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/>',
    sblocco: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7M12 14.5v2.5"/>',
    libro: '<path d="M3.5 5.5c2.5-1.3 5.5-1.3 8.5.5v13c-3-1.8-6-1.8-8.5-.5zM20.5 5.5c-2.5-1.3-5.5-1.3-8.5.5v13c3-1.8 6-1.8 8.5-.5z"/>',
    scarica: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2"/>',
    carica: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2"/>',
    lavagna: '<rect x="3" y="3.5" width="18" height="12" rx="1.5"/><path d="M8 21l2.5-5.5M16 21l-2.5-5.5M7 8l3 3 3-2.5 4 3.5"/>',
    squadra: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3.5 19.5c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5M14.6 14.6c2.6-.5 5 .9 5.9 4.4"/>',
    gioca: '<path class="pieno" d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    pausa: '<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/>',
    avanti: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    indietro: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    salta: '<path d="M5 6l7 6-7 6zM13 6l7 6-7 6z"/>',
    esporta: '<path d="M14 3.5H6.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9z"/><path d="M14 3.5V9h5.5M12 17.5v-6M9.5 14 12 11.5l2.5 2.5"/>',
    stampa: '<path d="M7 8.5V3.5h10v5M7 17.5H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>',
    contrasto: '<circle cx="12" cy="12" r="8.5"/><path class="pieno" d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
    intero: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    casa: '<path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5.5h4V20"/>',
    chiudi: '<path d="M6 6l12 12M18 6 6 18"/>',
    ok: '<path d="M4.5 12.5l5 5L19.5 7"/>',
    no: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>',
    chiave: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8.5-8.5M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    scudo: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z"/><path d="M8.8 12l2.3 2.3 4.2-4.6"/>',
    telefono: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    file: '<path d="M14 3.5H6.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9z"/><path d="M14 3.5V9h5.5M8.5 13.5h7M8.5 17h5"/>',
    grafico: '<path d="M4 20.5h16M7 17v-5M12 17V7M17 17v-8"/>',
    trofeo: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.6 4M16 6h3.5a3 3 0 0 1-3.6 4M12 13v4M8.5 20.5h7M10 17h4"/>',
    mescola: '<path d="M3.5 7h3.5c3.5 0 4.5 10 8 10h5M3.5 17h3.5c1.7 0 2.7-2.3 3.6-4.6M15.3 7h4.7M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5"/>',
    regola: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    utente: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2"/>',
    occhio: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    occhiochiuso: '<path d="M4 4l16 16M10.6 6.1A9 9 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3 3.6M6.4 7.9A16 16 0 0 0 2.5 12S6 18 12 18a9 9 0 0 0 3.6-.8M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    lente: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20.5 20.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    pdf: '<path d="M14 3.5H6.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9z"/><path d="M14 3.5V9h5.5M8 16.5v-4h1.6a1.2 1.2 0 0 1 0 2.4H8M12.5 12.5v4h1a2 2 0 0 0 0-4zM17.5 12.5H16v4M16 14.5h1.3"/>',
    zip: '<path d="M14 3.5H6.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9z"/><path d="M14 3.5V9h5.5M10 4v2M10 7.5v2M10 11v2M9 14.5h2v3H9z"/>',
    stella: '<path d="M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.5L12 16.6l-5 2.6.9-5.5-4-4 5.6-.8z"/>',
    campanella: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',
    muto: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5"/>',
    suono: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    copia: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
    cestino: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13.5h9l1-13.5M10 11v6M14 11v6"/>',
    cuore: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
    codice: '<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>'
  };
  GQ.icona = function (nome, cls, titolo) {
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" ' + (titolo ? 'role="img" aria-label="' + GQ.esc(titolo) + '"' : 'aria-hidden="true"') +
      ">" + (I[nome] || I.info) + "</svg>";
  };

  /* ---------- marchio: la fenice di FeniceOS ---------- */
  GQ.logo = function (cls) {
    return '<svg class="' + (cls || "logo") + '" viewBox="0 0 120 120" aria-hidden="true">' +
      '<defs><radialGradient id="gqsol" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#ffe1ae"/><stop offset="1" stop-color="#f2b866"/></radialGradient>' +
      '<linearGradient id="gqcorpo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f08a3c"/><stop offset="1" stop-color="#c9581d"/></linearGradient></defs>' +
      '<circle cx="60" cy="60" r="57" fill="url(#gqsol)"/><circle cx="60" cy="60" r="57" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>' +
      '<g fill="none" stroke="#b9661f" stroke-width="4" stroke-linecap="round"><path d="M60 40 L20 30 M60 40 L18 45 M60 40 L20 60 M60 40 L22 75 M60 40 L28 88"/>' +
      '<path d="M60 40 L100 30 M60 40 L102 45 M60 40 L100 60 M60 40 L98 75 M60 40 L92 88"/></g>' +
      '<path d="M60 34 C50 34 44 44 44 56 C44 72 52 84 60 96 C68 84 76 72 76 56 C76 44 70 34 60 34 Z" fill="url(#gqcorpo)"/>' +
      '<path d="M60 30 L54 22 L60 18 L66 22 Z" fill="#e8873a"/><circle cx="57" cy="30" r="1.8" fill="#1b3a4b"/></svg>';
  };

  GQ.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };
  GQ.$ = function (s, r) { return (r || document).querySelector(s); };
  GQ.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- memoria del browser (può mancare: finestre private, file aperti da chiavetta) ---------- */
  GQ.leggi = function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  GQ.salva = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  GQ.togli = function (k) { try { localStorage.removeItem(k); } catch (e) { /* niente */ } };

  /* ---------- avvisi ---------- */
  var tAvviso;
  GQ.avviso = function (msg, tipo) {
    var a = document.getElementById("avviso");
    if (!a) { a = document.createElement("div"); a.id = "avviso"; a.setAttribute("role", "status"); a.setAttribute("aria-live", "polite"); document.body.appendChild(a); }
    a.textContent = msg; a.className = (tipo || "") + " si";
    clearTimeout(tAvviso); tAvviso = setTimeout(function () { a.className = tipo || ""; }, 3200);
  };
  GQ.conferma = function (titolo, testo, siTesto, cb, pericolo) {
    var v = document.createElement("div");
    v.className = "velo";
    v.innerHTML = '<div class="finestra" role="dialog" aria-modal="true" aria-labelledby="gqcf"><h3 id="gqcf">' + GQ.esc(titolo) + "</h3><p>" + testo +
      '</p><div class="azioni"><button class="bt bt-chiaro" data-no>Annulla</button><button class="bt ' + (pericolo ? "bt-pericolo" : "bt-primario") +
      '" data-si>' + GQ.esc(siTesto) + "</button></div></div>";
    document.body.appendChild(v);
    function chiudi() { if (v.parentNode) v.parentNode.removeChild(v); document.removeEventListener("keydown", tasto); }
    function tasto(e) { if (e.key === "Escape") chiudi(); }
    document.addEventListener("keydown", tasto);
    v.addEventListener("click", function (e) { if (e.target === v || e.target.closest("[data-no]")) chiudi(); });
    v.querySelector("[data-si]").addEventListener("click", function () { chiudi(); cb(); });
    v.querySelector("[data-si]").focus();
  };

  /* ---------- scaricare un file creato nella pagina ---------- */
  GQ.scaricaFile = function (nome, contenuto, tipo) {
    var blob = contenuto instanceof Blob ? contenuto : new Blob([contenuto], { type: tipo || "application/octet-stream" });
    if (window.navigator && window.navigator.msSaveOrOpenBlob) { window.navigator.msSaveOrOpenBlob(blob, nome); return; }
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = nome; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  };
  GQ.slug = function (s) {
    return String(s || "").normalize ? String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "")
      : String(s || "").replace(/[^a-zA-Z0-9]+/g, "_");
  };
  GQ.durata = function (s) {
    s = Math.max(0, Math.round(s || 0));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    if (h) return h + " h" + (m ? " " + m + " min" : "");
    return (m ? m + " min" + (r ? " " : "") : "") + (r || !m ? r + " s" : "");
  };
  GQ.oggi = function () { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };

  /* ---------- preferenze di lettura (A−, A+, alto contrasto, schermo intero) ---------- */
  var pref = GQ.leggi("gq.lettura", { scala: 1, contrasto: false });
  function applica() {
    document.documentElement.style.setProperty("--scala", pref.scala);
    document.body.classList.toggle("contrasto", !!pref.contrasto);
  }
  GQ.testo = function (d) { pref.scala = Math.max(.85, Math.min(1.6, Math.round((pref.scala + d) * 100) / 100)); GQ.salva("gq.lettura", pref); applica(); };
  GQ.contrasto = function () { pref.contrasto = !pref.contrasto; GQ.salva("gq.lettura", pref); applica(); };
  GQ.schermoIntero = function () {
    var d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
    else if (el.requestFullscreen || el.webkitRequestFullscreen) { (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
  };

  /* ---------- barra e piè di pagina comuni ---------- */
  GQ.base = ""; // percorso verso la radice del sito ("" oppure "../"), lo imposta ogni pagina
  GQ.barra = function (attiva, extra) {
    var b = GQ.base, voci = [["", "casa", "Inizio"], ["quiz/", "timer", "Quiz"], ["manuale/", "libro", "Manuale"], ["vademecum/", "info", "Vademecum"],
      ["#scarica", "scarica", "Scarica"], ["riservato/", "lucchetto", "Area riservata"]];
    var nav = voci.map(function (v) {
      var href = v[0] === "#scarica" ? b + "#scarica" : b + v[0];
      return '<a href="' + href + '"' + (attiva === v[0] ? ' aria-current="page"' : "") + ">" + GQ.icona(v[1]) + "<span>" + v[2] + "</span></a>";
    }).join("");
    return '<header class="barra no-stampa"><div class="barra-dentro"><a class="marchio" href="' + (b || "./") + '">' + GQ.logo() +
      '<span><span class="k">Un progetto FeniceOS · di Danilo D\'Auria</span><span class="t">Il Grande Quiz dell\'Informatica</span></span></a>' +
      (extra || "") + '<button class="bt-barra menu-bt" type="button" aria-expanded="false" aria-controls="gq-nav" onclick="var n=document.getElementById(\'gq-nav\'),a=n.classList.toggle(\'aperto\');this.setAttribute(\'aria-expanded\',a)">' +
      GQ.icona("menu") + "<span>Menu</span></button>" + '<nav id="gq-nav" aria-label="Sezioni del sito">' + nav + "</nav></div></header>";
  };
  GQ.CC = '<svg viewBox="0 0 88 31" role="img" aria-label="Creative Commons BY-NC-SA"><rect width="88" height="31" rx="4" fill="#abb1aa"/>' +
    '<rect x="1" y="1" width="86" height="29" rx="3" fill="#000"/><circle cx="15.5" cy="15.5" r="11.5" fill="#fff"/>' +
    '<text x="15.5" y="20" font-family="Arial" font-weight="700" font-size="11" text-anchor="middle" fill="#000">cc</text>' +
    '<text x="56" y="13" font-family="Arial" font-weight="700" font-size="8.5" text-anchor="middle" fill="#fff">BY · NC · SA</text>' +
    '<text x="56" y="24" font-family="Arial" font-size="7.5" text-anchor="middle" fill="#abb1aa">4.0 Internazionale</text></svg>';
  GQ.piede = function () {
    var anno = new Date().getFullYear();
    return '<footer class="piede no-stampa"><div class="contenitore"><div>' +
      "<p><b>Il Grande Quiz dell'Informatica</b> — opera ideata, scritta e curata da <b>Danilo D'Auria</b>, ideatore e sviluppatore di " +
      "FeniceOS, autore di «Tecnologia Gentile: Informatica Sostenibile».</p>" +
      '<p class="cc">' + GQ.CC + '<span>© ' + (anno > 2026 ? "2026–" + anno : "2026") + ' Danilo D\'Auria. Domande, testi e grafica: licenza <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it" rel="license">Creative Commons Attribuzione – Non commerciale – Condividi allo stesso modo 4.0</a>. ' +
      "Chi usa o adatta l'opera deve citare l'autore, non può farne uso commerciale e deve condividere con la stessa licenza.</span></p></div>" +
      "<div><p><b>Funziona offline</b>, nel vostro browser: nessun dato viene inviato in rete. Le risposte restano su questo dispositivo finché non le esportate voi.</p>" +
      '<p>Codice sorgente con licenza MIT · <a href="https://github.com/danilodauria/grande-quiz">github.com/danilodauria/grande-quiz</a> · versione ' + GQ.VERSIONE + "</p></div></div></footer>";
  };
  GQ.disegnaIcone = function (radice) {
    GQ.$$("[data-ico]", radice).forEach(function (e) { e.outerHTML = GQ.icona(e.getAttribute("data-ico")); });
    GQ.$$("[data-logo]", radice).forEach(function (e) { e.outerHTML = GQ.logo(e.getAttribute("data-logo") || "logo"); });
    GQ.$$("[data-cc]", radice).forEach(function (e) { e.outerHTML = GQ.CC; });
  };
  GQ.monta = function (base, attiva, extra) {
    GQ.base = base || "";
    GQ.disegnaIcone(document);
    var t = document.getElementById("gq-barra"); if (t) t.outerHTML = GQ.barra(attiva, extra);
    var p = document.getElementById("gq-piede"); if (p) p.outerHTML = GQ.piede();
    applica();
  };
  if (document.readyState !== "loading") applica(); else document.addEventListener("DOMContentLoaded", applica);
})();
