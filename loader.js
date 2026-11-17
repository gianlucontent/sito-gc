/* Caricatore del sito GianluContent per GoHighLevel.
   In GHL si incolla UNA volta sola:
     <div id="gc-root"></div>
     <script src="https://INDIRIZZO-PUBBLICAZIONE/loader.js" data-page="home"></script>
   (data-page="brief" nella pagina /brief-formazione).
   A ogni apertura scarica la versione più recente della pagina e la inserisce,
   eseguendo gli script nello stesso ordine del file originale. */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var base = me.src.replace(/[^\/]*$/, "");
  var page = me.getAttribute("data-page") || "home";
  var root = document.getElementById(me.getAttribute("data-target") || "gc-root");
  if (!root) { root = document.createElement("div"); me.parentNode.insertBefore(root, me); }
  root.style.minHeight = "100vh";
  root.style.background = "#100B18";

  function abs(html) {
    // percorsi relativi delle immagini -> indirizzo di pubblicazione
    return html.replace(/(src|srcset)="img\//g, '$1="' + base + "img/");
  }

  function runScripts(list, i, done) {
    if (i >= list.length) { done(); return; }
    var old = list[i], s = document.createElement("script");
    for (var a = 0; a < old.attributes.length; a++) s.setAttribute(old.attributes[a].name, old.attributes[a].value);
    var next = function () { runScripts(list, i + 1, done); };
    if (old.src && !old.async) {
      s.onload = next; s.onerror = next;
      old.parentNode.replaceChild(s, old);
    } else {
      s.text = old.text;
      old.parentNode.replaceChild(s, old);
      next();
    }
  }

  fetch(base + page + ".html?v=" + Date.now(), { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (html) {
      root.innerHTML = abs(html);
      root.style.minHeight = "";
      runScripts([].slice.call(root.querySelectorAll("script")), 0, function () {
        var refresh = function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };
        if (document.readyState === "complete") setTimeout(refresh, 300); else window.addEventListener("load", refresh);
        document.dispatchEvent(new CustomEvent("gc:ready", { detail: { page: page } }));
      });
    })
    .catch(function () {
      root.innerHTML = '<p style="color:#FAF7FF;font-family:Arial,sans-serif;padding:40px;text-align:center">La pagina non si è caricata. Ricarica tra qualche secondo.</p>';
    });
})();
