/* =============================================================================
   IL GRANDE QUIZ DELL'INFORMATICA — la cassaforte delle soluzioni
   Cifratura: AES-256-GCM con chiave ricavata dalla password (PBKDF2-SHA-256, 600.000 passaggi, sale casuale).
   Secondo controllo: codice a 6 cifre di Google Authenticator (TOTP, RFC 6238, SHA-1, 30 secondi).
   Tutto avviene nel browser con la Web Crypto API: nessun server, nessun dato in rete.
   NOTA ONESTA: il vero lucchetto è la password. Il codice di Authenticator è un controllo in più dell'interfaccia,
   perché una pagina senza server non può custodire un segreto che chi conosce la password non possa leggere.
   Ideazione e cura: Danilo D'Auria · Codice MIT
   ============================================================================= */
(function () {
  "use strict";
  var C = window.GQC = {};
  var MAGIA = "GQCASSAFORTE1\n", ITER = 600000;
  var enc = new TextEncoder(), dec = new TextDecoder();

  C.disponibile = function () { return !!(window.crypto && window.crypto.subtle && window.TextEncoder); };
  C.casuali = function (n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
  C.b64 = function (u8) { var s = "", i, CH = 0x8000; for (i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH)); return btoa(s); };
  C.deb64 = function (s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  C.hex = function (buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); };
  C.sha256 = function (testo) { return crypto.subtle.digest("SHA-256", enc.encode(testo)).then(C.hex); };

  /* ---------- compressione (se il browser la offre) ---------- */
  function flusso(dati, tipo, comprimi) {
    var cs = comprimi ? new CompressionStream(tipo) : new DecompressionStream(tipo);
    var w = cs.writable.getWriter(); w.write(dati); w.close();
    return new Response(cs.readable).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  var conGzip = typeof CompressionStream !== "undefined";

  function chiave(password, sale, iter) {
    return crypto.subtle.importKey("raw", enc.encode(password.normalize ? password.normalize("NFC") : password), "PBKDF2", false, ["deriveKey"]).then(function (k) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: sale, iterations: iter, hash: "SHA-256" }, k, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    });
  }

  /* chiude: oggetto -> Uint8Array del file cassaforte.bin */
  C.chiudi = function (oggetto, password) {
    var sale = C.casuali(16), iv = C.casuali(12), testo = enc.encode(JSON.stringify(oggetto));
    var testa = { formato: 1, kdf: "PBKDF2-SHA256", iterazioni: ITER, sale: C.b64(sale), iv: C.b64(iv), gzip: conGzip, creata: new Date().toISOString(),
      opera: "Il Grande Quiz dell'Informatica — Danilo D'Auria" };
    return (conGzip ? flusso(testo, "gzip", true) : Promise.resolve(testo)).then(function (dati) {
      return chiave(password, sale, ITER).then(function (k) {
        return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv, additionalData: enc.encode(MAGIA) }, k, dati);
      });
    }).then(function (cif) {
      var t = enc.encode(MAGIA + JSON.stringify(testa) + "\n"), out = new Uint8Array(t.length + cif.byteLength);
      out.set(t, 0); out.set(new Uint8Array(cif), t.length);
      return out;
    });
  };

  /* legge la testa senza password (per controllare che il file sia giusto) */
  C.testa = function (u8) {
    var inizio = dec.decode(u8.subarray(0, Math.min(u8.length, 2048)));
    if (inizio.indexOf(MAGIA) !== 0) throw new Error("Questo non è un file cassaforte.bin del Grande Quiz.");
    var fine = inizio.indexOf("\n", MAGIA.length);
    var testa = JSON.parse(inizio.slice(MAGIA.length, fine));
    testa._inizioDati = enc.encode(inizio.slice(0, fine + 1)).length;
    return testa;
  };

  /* apre: Uint8Array + password -> oggetto (errore "password" se sbagliata) */
  C.apri = function (u8, password) {
    var t;
    try { t = C.testa(u8); } catch (e) { return Promise.reject(e); }
    return chiave(password, C.deb64(t.sale), t.iterazioni).then(function (k) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: C.deb64(t.iv), additionalData: enc.encode(MAGIA) }, k, u8.subarray(t._inizioDati));
    }).then(function (b) {
      var u = new Uint8Array(b);
      return t.gzip ? flusso(u, "gzip", false) : u;
    }, function () { var e = new Error("password"); e.password = true; throw e; }).then(function (u) {
      return JSON.parse(dec.decode(u));
    });
  };

  /* ---------- Base32 e TOTP (compatibile con Google Authenticator) ---------- */
  var ALFA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  C.base32 = function (u8) {
    var bits = 0, val = 0, out = "";
    for (var i = 0; i < u8.length; i++) { val = (val << 8) | u8[i]; bits += 8; while (bits >= 5) { out += ALFA[(val >>> (bits - 5)) & 31]; bits -= 5; } }
    if (bits > 0) out += ALFA[(val << (5 - bits)) & 31];
    return out;
  };
  C.debase32 = function (s) {
    s = String(s).toUpperCase().replace(/[^A-Z2-7]/g, "");
    var bits = 0, val = 0, out = [];
    for (var i = 0; i < s.length; i++) { val = (val << 5) | ALFA.indexOf(s[i]); bits += 5; if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; } }
    return new Uint8Array(out);
  };
  C.totp = function (segreto, quando) {
    var passo = Math.floor((quando || Date.now()) / 1000 / 30), msg = new Uint8Array(8), x = passo;
    for (var i = 7; i >= 0; i--) { msg[i] = x & 255; x = Math.floor(x / 256); }
    return crypto.subtle.importKey("raw", C.debase32(segreto), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]).then(function (k) {
      return crypto.subtle.sign("HMAC", k, msg);
    }).then(function (sig) {
      var h = new Uint8Array(sig), o = h[19] & 15;
      var n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
      return ("000000" + (n % 1000000)).slice(-6);
    });
  };
  /* accetta il codice di adesso e quelli dei 30 secondi prima e dopo (orologi un po' sfasati) */
  C.verificaTotp = function (segreto, codice) {
    codice = String(codice).replace(/\D/g, "");
    if (codice.length !== 6) return Promise.resolve(false);
    var ora = Date.now();
    return Promise.all([C.totp(segreto, ora - 30000), C.totp(segreto, ora), C.totp(segreto, ora + 30000)]).then(function (c) { return c.indexOf(codice) >= 0; });
  };
  C.nuovoSegreto = function () { return C.base32(C.casuali(20)); };
  C.codiceEmergenza = function () {
    var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", u = C.casuali(20), s = "";
    for (var i = 0; i < 20; i++) { s += A[u[i] % A.length]; if (i % 5 === 4 && i < 19) s += "-"; }
    return s;
  };
  C.uri = function (segreto) {
    return "otpauth://totp/GrandeQuiz:Danilo?secret=" + segreto + "&issuer=GrandeQuiz";
  };
})();
