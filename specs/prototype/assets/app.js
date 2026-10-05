/* ==========================================================================
   PokeTrade prototype — shared data & behavior
   Loaded on every page. No build step, no framework — plain JS, real
   localStorage/sessionStorage so the pages are genuinely connected:
   add a card on search.html and it shows up on dashboard.html; remove it
   from card-details.html and it's gone from the grid.

   Placeholder copy below is written ready to become i18n keys (per
   ui-guideline.md §9) — nothing here should ship to production as-is.
   ========================================================================== */

var PokeTradeProto = (function () {
  'use strict';

  var COLLECTION_KEY = 'poketrade.proto.collection';
  var AUTH_KEY = 'poketrade.proto.loggedIn';
  var FLASH_KEY = 'poketrade.proto.flash';

  var strings = {
    added: 'Added to your collection',
    removed: 'Removed from your collection',
    noResults: 'We couldn’t find that card. Try the exact name or a set code.',
    emptyGrid: 'Your binder’s empty — search for your first card.'
  };

  var SEED_COLLECTION = [
    { id: 'pikachu', name: 'Pikachu', set: 'Base Set', number: '058/102', rarity: 'Common', language: 'English', type: 'lightning', qty: 3, condition: 'Near Mint', price: 4.20, updated: '2 hours ago', source: 'TCGdex', signal: 'green', signalLabel: 'Stable', signalDesc: 'Close to the 7-day average.', rare: false, history: [3,4,3,5,4,4,5,4] },
    { id: 'charizard', name: 'Charizard', set: 'Base Set', number: '004/102', rarity: 'Holo Rare', language: 'English', type: 'fire', qty: 1, condition: 'Lightly Played', price: 285.00, updated: '35 minutes ago', source: 'TCGdex', signal: 'yellow', signalLabel: 'Volatile', signalDesc: 'Prices swung across sources this week.', rare: true, history: [7,6,8,9,6,8,9,10] },
    { id: 'blastoise', name: 'Blastoise', set: 'Base Set', number: '002/102', rarity: 'Holo Rare', language: 'English', type: 'water', qty: 1, condition: 'Near Mint', price: 198.50, updated: '35 minutes ago', source: 'TCGdex', signal: 'green', signalLabel: 'Stable', signalDesc: 'Close to the 7-day average.', rare: true, history: [8,7,7,8,8,7,8,8] },
    { id: 'bulbasaur', name: 'Bulbasaur', set: 'Base Set', number: '044/102', rarity: 'Common', language: 'English', type: 'grass', qty: 2, condition: 'Near Mint', price: 2.10, updated: '2 hours ago', source: 'TCGdex', signal: 'green', signalLabel: 'Stable', signalDesc: 'Close to the 7-day average.', rare: false, history: [2,2,3,2,2,3,2,2] },
    { id: 'snorlax', name: 'Snorlax', set: 'Jungle', number: '011/64', rarity: 'Uncommon', language: 'English', type: 'placeholder', qty: 1, condition: 'Near Mint', price: null, updated: 'Never', source: 'No provider', signal: 'red', signalLabel: 'No price', signalDesc: 'No provider has current pricing.', rare: false, history: [] }
  ];

  // Simulated poke-catalog-mcp search index. Deliberately includes a card
  // with two printings (Charizard) to demonstrate SRCH-03 disambiguation,
  // and one with only a single printing (Mew) to show that disambiguation
  // UI should NOT appear when there's nothing to disambiguate.
  var SEARCH_INDEX = {
    charizard: [
      { name: 'Charizard', set: 'Base Set', number: '004/102', rarity: 'Holo Rare', type: 'fire', tags: ['English', 'Holofoil', 'Shadowless'] },
      { name: 'Charizard', set: 'Base Set', number: '004/102', rarity: 'Holo Rare', type: 'fire', tags: ['English', 'Holofoil', 'Unlimited'] }
    ],
    pikachu: [
      { name: 'Pikachu', set: 'Base Set', number: '058/102', rarity: 'Common', type: 'lightning', tags: ['English', 'Unlimited'] }
    ],
    mew: [
      { name: 'Mew', set: 'Celebrations', number: '011/025', rarity: 'Rare', type: 'placeholder', tags: ['English'] }
    ]
  };

  function getCollection() {
    try {
      var raw = localStorage.getItem(COLLECTION_KEY);
      if (!raw) {
        localStorage.setItem(COLLECTION_KEY, JSON.stringify(SEED_COLLECTION));
        return SEED_COLLECTION.slice();
      }
      return JSON.parse(raw);
    } catch (e) {
      return SEED_COLLECTION.slice();
    }
  }

  function saveCollection(list) {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(list));
  }

  function addToCollection(entry) {
    var list = getCollection();
    var existing = list.find(function (c) { return c.id === entry.id && c.condition === entry.condition; });
    if (existing) {
      existing.qty += entry.qty;
    } else {
      list.push(entry);
    }
    saveCollection(list);
  }

  function removeFromCollection(id) {
    var list = getCollection().filter(function (c) { return c.id !== id; });
    saveCollection(list);
  }

  function findCard(id) {
    return getCollection().find(function (c) { return c.id === id; }) || null;
  }

  function isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  }
  function logIn() { sessionStorage.setItem(AUTH_KEY, '1'); }
  function logOut() { sessionStorage.removeItem(AUTH_KEY); }

  function setFlash(msg) { sessionStorage.setItem(FLASH_KEY, msg); }
  function consumeFlash() {
    var msg = sessionStorage.getItem(FLASH_KEY);
    if (msg) sessionStorage.removeItem(FLASH_KEY);
    return msg;
  }

  function typeLabel(t) {
    return { fire: 'Fire', water: 'Water', grass: 'Grass', lightning: 'Lightning', placeholder: 'No image' }[t] || t;
  }

  var CHIP_ICONS = {
    green: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    yellow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17h.01"/></svg>',
    red: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6l6 6v6l-6 6H9l-6-6V9z"/><path d="M9 9l6 6M15 9l-6 6"/></svg>'
  };

  function chipMarkup(signal, label, desc) {
    return '<span class="chip chip-' + signal + '">' + CHIP_ICONS[signal] +
      '<span>' + label + '<span class="chip-desc">' + desc + '</span></span></span>';
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var NAV_ITEMS = [
    { key: 'collection', href: 'dashboard.html', label: 'Collection',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18M4 9h4M4 15h4"/></svg>' },
    { key: 'wantlist', href: 'wantlist.html', label: 'Want List',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.5-8.5C.7 9 2 5 6 5c2 0 3.5 1.2 4 2 0.5-0.8 2-2 4-2 4 0 5.3 4 3.5 7.5C19 16.65 12 21 12 21z"/></svg>' },
    { key: 'search', href: 'search.html', label: 'Search',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' },
    { key: 'trade', href: 'trade.html', label: 'Trade',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l-4 4 4 4M3 14h13M17 4l4 4-4 4M21 8H8"/></svg>' }
  ];

  // Renders the persistent rail + header shell into #app-shell-root.
  // `activeKey` highlights the current section; pass null on pages that
  // don't belong to one of the four tabs.
  function renderShell(activeKey, opts) {
    opts = opts || {};
    var root = document.getElementById('app-shell-root');
    if (!root) return;
    var railItems = NAV_ITEMS.map(function (item) {
      return '<a class="rail-tab" role="tab" aria-selected="' + (item.key === activeKey ? 'true' : 'false') + '" href="' + item.href + '">' +
        item.icon + item.label + '</a>';
    }).join('');

    root.innerHTML =
      '<nav class="rail" role="tablist" aria-label="Main sections">' +
      '<div class="wordmark-mini" aria-hidden="true">P</div>' + railItems +
      '</nav>' +
      '<div class="main-col">' +
      '<header class="top-header">' +
      '<div>' + (opts.headerLeft || '<h2>' + escapeHtml(opts.title || '') + '</h2>') + '</div>' +
      '<div class="greeting">' +
      '<span>Hi, Ash 👋</span>' +
      '<div class="avatar" aria-hidden="true">A</div>' +
      '<button class="btn-icon" id="protoLogoutBtn" aria-label="Log out" title="Log out">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>' +
      '</button></div></header>' +
      '<section class="panel" id="app-panel-root"></section>' +
      '</div>';

    document.getElementById('protoLogoutBtn').addEventListener('click', function () {
      logOut();
      window.location.href = 'login.html';
    });
  }

  function requireAuthOrRedirect() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  var toastTimer;
  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
  }

  function showFlashIfAny() {
    var msg = consumeFlash();
    if (msg) showToast(msg);
  }

  return {
    strings: strings,
    getCollection: getCollection,
    saveCollection: saveCollection,
    addToCollection: addToCollection,
    removeFromCollection: removeFromCollection,
    findCard: findCard,
    isLoggedIn: isLoggedIn,
    logIn: logIn,
    logOut: logOut,
    setFlash: setFlash,
    showFlashIfAny: showFlashIfAny,
    typeLabel: typeLabel,
    chipMarkup: chipMarkup,
    escapeHtml: escapeHtml,
    renderShell: renderShell,
    requireAuthOrRedirect: requireAuthOrRedirect,
    showToast: showToast,
    SEARCH_INDEX: SEARCH_INDEX
  };
})();
