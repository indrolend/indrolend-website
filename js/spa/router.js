// SPA Hash Router
// Manages view mounting/caching, hash-based navigation, and nav UI.
// Supports three route modes:
//   idle    → #/idle
//   section → #/<sectionId>
//   item    → #/<sectionId>/<itemId>
//
// Public API: window.__SPA_Router
//   .init()
//   .go(sectionId, itemId)         — navigate to item mode
//   .nextSection() / .prevSection() — wrap-around section navigation (section mode)
//   .nextItem()    / .prevItem()    — wrap-around item navigation (item mode)
//   .getCurrentRoute() → { mode, sectionId, itemId }

(function () {
  var routes       = null;     // set during init from window.__INDROLEND_ROUTES__
  var viewHost     = null;
  var mountedViews = {};       // viewKey → DOM element
  var currentMode    = null;   // 'idle' | 'section' | 'item'
  var currentSection = null;
  var currentItem    = null;
  var transitioning  = false;

  // ─── helpers ────────────────────────────────────────────────────────────────

  function getViewHost() {
    if (!viewHost) viewHost = document.getElementById('spa-view-host');
    return viewHost;
  }

  // Returns { mode, sectionId, itemId } or { mode: 'redirect', target }
  function parseHash(hash) {
    var raw = (hash || '').replace(/^#\/?/, '');

    // Empty hash → idle
    if (!raw) return { mode: 'idle', sectionId: null, itemId: null };

    var parts   = raw.split('/');
    var first   = parts[0];
    var second  = parts[1] || null;

    // Explicit idle
    if (first === 'idle') return { mode: 'idle', sectionId: null, itemId: null };

    // Legacy home routes → idle
    if (first === 'home') return { mode: 'redirect', target: '#/idle' };

    // Unknown section → idle
    if (!routes.sections[first]) return { mode: 'redirect', target: '#/idle' };

    // Section only
    if (!second) return { mode: 'section', sectionId: first, itemId: null };

    // Valid section + item
    var sectionItems = routes.sections[first].items;
    if (sectionItems.indexOf(second) !== -1) {
      return { mode: 'item', sectionId: first, itemId: second };
    }

    // Invalid item → fall back to section mode
    return { mode: 'redirect', target: '#/' + first };
  }

  function modeViewKey(mode, sectionId, itemId) {
    if (mode === 'idle')    return '__idle__';
    if (mode === 'section') return '__section__:' + sectionId;
    return sectionId + '/' + itemId;
  }

  function defaultItem(sectionId) {
    var s = routes.sections[sectionId];
    return s ? s.items[0] : null;
  }

  // ─── view mounting ──────────────────────────────────────────────────────────

  function mountView(mode, sectionId, itemId) {
    var key = modeViewKey(mode, sectionId, itemId);
    if (mountedViews[key]) return mountedViews[key];

    var host = getViewHost();
    if (!host) return null;

    var el = document.createElement('div');
    el.className = 'spa-view';
    el.dataset.spaView = key;
    el.style.display = 'none';

    if (mode === 'idle') {
      if (window.__SPA_Views && window.__SPA_Views.idle) {
        window.__SPA_Views.idle.mount(el);
      }
    } else if (mode === 'section') {
      if (window.__SPA_Views && window.__SPA_Views.sectionCarousel) {
        window.__SPA_Views.sectionCarousel.mount(sectionId, el);
      }
    } else {
      // item mode — delegate to section view module
      if (window.__SPA_Views && window.__SPA_Views[sectionId]) {
        window.__SPA_Views[sectionId].mount(itemId, el);
      } else {
        var meta = routes.items[sectionId + '/' + itemId];
        var label   = meta ? meta.label : itemKey;
        el.innerHTML =
          '<div class="spa-view-fallback">' +
            '<span class="important-word">' + label + '</span>' +
          '</div>';
      }
    }

    host.appendChild(el);
    mountedViews[key] = el;

    if (window.__SPA_ImportantWords) {
      window.__SPA_ImportantWords.init(el);
    }

    return el;
  }

  // ─── view display ───────────────────────────────────────────────────────────

  function showView(mode, sectionId, itemId, skipTransition) {
    var view = mountView(mode, sectionId, itemId);
    if (!view) return;

    var fromMode    = currentMode;
    var fromSection = currentSection;
    var fromItem    = currentItem;
    var fromKey     = fromMode ? modeViewKey(fromMode, fromSection, fromItem) : null;
    var fromView    = fromKey ? mountedViews[fromKey] : null;

    // Notify old item view it is being deactivated
    if (fromMode === 'item' && fromSection &&
        window.__SPA_Views && window.__SPA_Views[fromSection] &&
        typeof window.__SPA_Views[fromSection].onDeactivate === 'function') {
      window.__SPA_Views[fromSection].onDeactivate(fromItem);
    }

    function doShow() {
      // Hide every mounted view
      var keys = Object.keys(mountedViews);
      for (var i = 0; i < keys.length; i++) {
        mountedViews[keys[i]].style.display = 'none';
        mountedViews[keys[i]].classList.remove('spa-view-active');
      }

      view.style.display = '';
      view.classList.add('spa-view-active');

      currentMode    = mode;
      currentSection = sectionId;
      currentItem    = itemId;
      transitioning  = false;

      updateNav();
      updateBackButton(mode);

      // Notify new item view it is now active
      if (mode === 'item' &&
          window.__SPA_Views && window.__SPA_Views[sectionId] &&
          typeof window.__SPA_Views[sectionId].onActivate === 'function') {
        window.__SPA_Views[sectionId].onActivate(itemId, view);
      }
    }

    // Run transition when switching between two real views
    if (!skipTransition && fromView && window.__SPA_Transition) {
      transitioning = true;
      var fromCanvas = null;
      if (fromMode === 'item' &&
          window.__SPA_Views && window.__SPA_Views[fromSection] &&
          typeof window.__SPA_Views[fromSection].getTransitionCanvas === 'function') {
        fromCanvas = window.__SPA_Views[fromSection].getTransitionCanvas(fromItem);
      }
      window.__SPA_Transition.transition(fromCanvas, null, doShow);
    } else {
      doShow();
    }
  }

  // ─── navigation API ─────────────────────────────────────────────────────────

  function navigate(mode, sectionId, itemId, skipTransition) {
    if (transitioning) return;

    var newHash;

    if (mode === 'idle') {
      newHash = '#/idle';
    } else if (mode === 'section') {
      if (!routes.sections[sectionId]) return;
      newHash = '#/' + sectionId;
    } else {
      // item mode
      if (!routes.sections[sectionId]) return;
      itemId = itemId || defaultItem(sectionId);
      var items = routes.sections[sectionId].items;
      if (items.indexOf(itemId) === -1) itemId = defaultItem(sectionId);
      newHash = '#/' + sectionId + '/' + itemId;
    }

    if (window.location.hash === newHash) {
      // Already here — ensure it's shown (e.g. on first load)
      showView(mode, sectionId, itemId, skipTransition);
      return;
    }

    // Updating the hash fires hashchange → handleHashChange → showView
    window.location.hash = newHash;
  }

  // go() preserves backward-compatible item-mode navigation
  function go(sectionId, itemId) {
    navigate('item', sectionId, itemId);
  }

  function nextSection() {
    if (!currentSection) return;
    var order  = routes.sectionOrder;
    var idx    = order.indexOf(currentSection);
    var next   = (idx + 1) % order.length;
    navigate('section', order[next], null);
  }

  function prevSection() {
    if (!currentSection) return;
    var order  = routes.sectionOrder;
    var idx    = order.indexOf(currentSection);
    var prev   = (idx - 1 + order.length) % order.length;
    navigate('section', order[prev], null);
  }

  function nextItem() {
    if (currentMode !== 'item' || !currentSection || !currentItem) return;
    var items = routes.sections[currentSection].items;
    var idx   = items.indexOf(currentItem);
    var next  = (idx + 1) % items.length;
    navigate('item', currentSection, items[next]);
  }

  function prevItem() {
    if (currentMode !== 'item' || !currentSection || !currentItem) return;
    var items = routes.sections[currentSection].items;
    var idx   = items.indexOf(currentItem);
    var prev  = (idx - 1 + items.length) % items.length;
    navigate('item', currentSection, items[prev]);
  }

  function getCurrentRoute() {
    return { mode: currentMode, sectionId: currentSection, itemId: currentItem };
  }

  // ─── back button ────────────────────────────────────────────────────────────

  function updateBackButton(mode) {
    var btn = document.getElementById('spa-back-btn');
    if (!btn) return;
    btn.style.display = (mode === 'item') ? 'block' : 'none';
  }

  // ─── nav UI (kept functional; hidden via CSS) ───────────────────────────────

  function updateNav() {
    updateSectionLinks();
    updateItemDots();
  }

  function updateSectionLinks() {
    var sectionsEl = document.getElementById('spa-nav-sections');
    if (!sectionsEl) return;

    if (!sectionsEl.dataset.built) {
      sectionsEl.dataset.built = 'true';
      routes.sectionOrder.forEach(function (sid) {
        var a = document.createElement('a');
        a.className = 'spa-nav-section-link';
        a.textContent = routes.sections[sid].label;
        a.href = '#/' + sid;
        a.dataset.section = sid;
        sectionsEl.appendChild(a);
      });
    }

    sectionsEl.querySelectorAll('.spa-nav-section-link').forEach(function (a) {
      a.classList.toggle('active', a.dataset.section === currentSection);
    });
  }

  function updateItemDots() {
    var itemNavEl = document.getElementById('spa-item-nav');
    if (!itemNavEl || !currentSection) return;

    var items = routes.sections[currentSection].items;
    itemNavEl.innerHTML = '';

    items.forEach(function (iid) {
      var btn = document.createElement('button');
      btn.className = 'spa-item-dot' + (iid === currentItem ? ' active' : '');
      btn.dataset.section = currentSection;
      btn.dataset.item    = iid;
      var meta = routes.items[currentSection + '/' + iid];
      btn.title = meta ? meta.label : iid;
      btn.setAttribute('aria-label', meta ? meta.label : iid);
      btn.addEventListener('click', function () { go(currentSection, iid); });
      itemNavEl.appendChild(btn);
    });
  }

  // ─── hash change handler ────────────────────────────────────────────────────

  function handleHashChange() {
    if (transitioning) return;

    var parsed = parseHash(window.location.hash);

    if (parsed.mode === 'redirect') {
      window.location.hash = parsed.target;
      return;
    }

    // Skip if already on this route
    if (parsed.mode    === currentMode &&
        parsed.sectionId === currentSection &&
        parsed.itemId    === currentItem) return;

    showView(parsed.mode, parsed.sectionId, parsed.itemId);
  }

  // ─── init ───────────────────────────────────────────────────────────────────

  function init() {
    routes = window.__INDROLEND_ROUTES__;
    if (!routes) { console.error('SPA: routes not loaded'); return; }

    window.addEventListener('hashchange', handleHashChange);

    // Wire up back button
    var backBtn = document.getElementById('spa-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (currentSection) navigate('section', currentSection, null);
      });
    }

    var hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') {
      window.location.hash = '#/idle';
    } else {
      handleHashChange();
    }
  }

  window.__SPA_Router = {
    init:            init,
    go:              go,
    nextSection:     nextSection,
    prevSection:     prevSection,
    nextItem:        nextItem,
    prevItem:        prevItem,
    getCurrentRoute: getCurrentRoute
  };

  // Self-initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    init();
  });
}());
