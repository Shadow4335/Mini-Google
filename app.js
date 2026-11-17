function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getParam(name) {
  var m = location.search.replace(/^\?/, "").split("&"), i, kv;
  for (i = 0; i < m.length; i++) {
    kv = m[i].split("=");
    if (kv[0] === name) return decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
  }
  return "";
}

function pageById(id) {
  for (var i = 0; i < PAGES.length; i++) if (PAGES[i].id === Number(id)) return PAGES[i];
  return null;
}

function logoHTML(size) {
  var cols = ["#0000FF", "#FF0000", "#FFCC00", "#0000FF", "#009900", "#FF0000", "#FFCC00"], word = "Google!", out = "", i;
  for (i = 0; i < word.length; i++) out += '<span style="color:' + cols[i] + '">' + word.charAt(i) + "</span>";
  return '<span class="logo" style="font-size:' + size + 'px">' + out + "</span>";
}

function highlight(text, query) {
  var set = tokenize(query);
  return esc(text).replace(/[A-Za-z0-9]+/g, function (w) {
    return set.indexOf(w.toLowerCase()) !== -1 ? "<b>" + w + "</b>" : w;
  });
}

function fmtScore(kind, r, query) {
  if (kind === "left") return esc(tokenize(query).join(" ")) + " ×" + r.score;
  return "PageRank = " + r.score.toFixed(4);
}

function paneHTML(kind, query) {
  var res = kind === "left" ? keywordSearch(query) : pageRankSearch(query), out = "", i, r;
  if (res.length === 0)
    return "<p>Your search &ndash; <b>" + esc(query) + "</b> &ndash; did not match any documents.</p>";
  for (i = 0; i < res.length; i++) {
    r = res[i];
    out += '<p class="result"><b>Rank ' + (i + 1) + ':</b> <a href="results.html?id=' + r.page.id + "&amp;q=" + encodeURIComponent(query) + '">' +
      esc(r.page.url) + '</a><br><span class="snip">' + highlight(r.page.text, query) +
      '</span><br><span class="url">http://' + esc(r.page.url) + '/ - page ' + r.page.id +
      '</span><br><span class="score">' + fmtScore(kind, r, query) + "</span></p>";
  }
  return out;
}

function cachedHTML(id, query) {
  var p = pageById(id), out, i, t;
  if (!p) return "<p>No such page in the dataset.</p>";
  out = '<table width="100%" cellpadding="6" border="0"><tr><td bgcolor="#FFFFCC"><small>This is the cached copy of <b>http://' +
    esc(p.url) + "/</b> as stored in the Systems &amp; AI Lab index. PageRank = " + PR[p.id].toFixed(4) +
    '.</small></td></tr></table><h2>' + esc(p.url) + "</h2><p>" + highlight(p.text, query) + "</p><h3>Links on this page</h3><ul>";
  if (p.linksTo.length === 0) out += "<li>(none)</li>";
  for (i = 0; i < p.linksTo.length; i++) {
    t = pageById(p.linksTo[i]);
    out += '<li><a href="results.html?id=' + t.id + "&amp;q=" + encodeURIComponent(query) + '">' + esc(t.url) + "</a></li>";
  }
  return out + "</ul>";
}

function inLinks(id) {
  var r = [], i;
  for (i = 0; i < PAGES.length; i++) if (PAGES[i].linksTo.indexOf(id) !== -1) r.push(PAGES[i].id);
  return r;
}
