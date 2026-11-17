function tokenize(text) {
  var parts = String(text).toLowerCase().split(/[^a-z0-9]+/), out = [], i;
  for (i = 0; i < parts.length; i++) if (parts[i] !== "") out.push(parts[i]);
  return out;
}

function keywordSearch(query) {
  var q = tokenize(query), res = [], i, j, k, toks, score;
  for (i = 0; i < PAGES.length; i++) {
    toks = tokenize(PAGES[i].text);
    score = 0;
    for (j = 0; j < q.length; j++)
      for (k = 0; k < toks.length; k++) if (toks[k] === q[j]) score++;
    if (score > 0) res.push({page: PAGES[i], score: score});
  }
  res.sort(function (a, b) { return b.score - a.score || a.page.id - b.page.id; });
  return res;
}

// Returns {ranks: {id: value}, iterations: n}
function computePageRank(pages, d) {
  if (d === undefined) d = 0.85;
  var N = pages.length, pr = {}, i, j, it, diff, next, p, q, dangling, k;
  for (i = 0; i < N; i++) pr[pages[i].id] = 1 / N;
  for (it = 1; it <= 100; it++) {
    dangling = 0;
    next = {};
    for (i = 0; i < N; i++) {
      if (pages[i].linksTo.length === 0) dangling += pr[pages[i].id];
    }
    for (i = 0; i < N; i++) {
      p = pages[i];
      var sum = dangling / N;
      for (j = 0; j < N; j++) {
        q = pages[j];
        for (k = 0; k < q.linksTo.length; k++)
          if (q.linksTo[k] === p.id) sum += pr[q.id] / q.linksTo.length;
      }
      next[p.id] = (1 - d) / N + d * sum;
    }
    diff = 0;
    for (i = 0; i < N; i++) diff += Math.abs(next[pages[i].id] - pr[pages[i].id]);
    pr = next;
    if (diff < 1e-6) break;
  }
  return {ranks: pr, iterations: Math.min(it, 100)};
}

var PR_RESULT = computePageRank(PAGES);  // computed once for the whole graph
var PR = PR_RESULT.ranks;

function pageRankSearch(query) {
  var q = tokenize(query), res = [], i, j, toks;
  for (i = 0; i < PAGES.length; i++) {
    toks = tokenize(PAGES[i].text);
    var hit = false;
    for (j = 0; j < q.length; j++) if (toks.indexOf(q[j]) !== -1) hit = true;
    if (hit) res.push({page: PAGES[i], score: PR[PAGES[i].id]});
  }
  res.sort(function (a, b) { return b.score - a.score || a.page.id - b.page.id; });
  return res;
}
