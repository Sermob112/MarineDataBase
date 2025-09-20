// renderer/assets/js/indexScripts.js
(() => {
  if (window.__indexPageInit) return;
  window.__indexPageInit = true;

  // маленький селектор-помощник
  function $(sel) { return document.querySelector(sel); }

  // ждём каркас из Baselayout
  function onLayoutReady() {
    init().catch(err => console.error('init failed:', err));
  }
  if (window.__layoutLoaded) onLayoutReady();
  else document.addEventListener('layout:ready', onLayoutReady, { once: true });
  async function openFormularById(id, model = 'MarinFleet') {
    if (!id) return;
    await ipcRenderer.invoke('load-ship-details', { id, model });
    window.location.href = 'shipFormular.html';
  }
  // -------------------------------------------------------------------------
  // init
  // -------------------------------------------------------------------------
  async function init() {
    const { ipcRenderer } = require('electron');

    // === Глобальная строка поиска (смонтировать виджет подсказок) ===========
    if (typeof window.mountSearchWidget === 'function') {
      window.mountSearchWidget({
        input:      '#search-input',
        suggest:    '#search-suggest',
        resultInfo: '#result-info',
        minChars:   2,
        debounceMs: 200,
        ipcSuggest: 'search-ship-suggest',
        onPick: async (row) => {
          await openFormularById(row.id, row.model);
        },
        // сюда можно добавить переключение нужной вкладки и загрузку
        triggerSearch: async (q) => {
          // no-op: при нажатии Enter можно, например, активировать вкладку "Флот"
          // и выполнить подзагрузку. Оставил место для логики.
        },
      });
    }

    // Универсальный переход в формуляр
    async function openFormularByLi(li) {
      const id = Number(li?.dataset?.id);
      if (!id) return;
      const model = li?.dataset?.model === 'SeaFleet' ? 'SeaFleet' : 'MarinFleet';
      await ipcRenderer.invoke('load-ship-details', { id, model });
      window.location.href = 'shipFormular.html';
    }

    // Вставка шапки таблицы перед UL
    function injectHeader(ul, key = '') {
      const parent = ul.parentElement;
      const dataFor = key || ul.id || '';
      if (!parent.querySelector(`.disclosure-head[data-for="${dataFor}"]`)) {
        const head = document.createElement('div');
        head.className = 'disclosure-head';
        head.dataset.for = dataFor;
        head.innerHTML = `
          <span class="disclosure-item__imo">IMO</span>
          <span class="disclosure-item__name">Название</span>
          <span class="disclosure-item__reg">Рег. №</span>
        `;
        parent.insertBefore(head, ul);
      }
    }

    // Добавление строк (3 колонки) в список UL
    function appendItems(ul, items, modelName) {
      const frag = document.createDocumentFragment();
      (items || []).forEach(it => {
        const li = document.createElement('li');
        li.className = 'disclosure-item';
        li.dataset.id = it.id;
        li.dataset.model = modelName; // SeaFleet | MarinFleet

        const c1 = document.createElement('span'); c1.className = 'disclosure-item__imo';  c1.textContent = it.imo  || '—';
        const c2 = document.createElement('span'); c2.className = 'disclosure-item__name'; c2.textContent = it.name || '—';
        const c3 = document.createElement('span'); c3.className = 'disclosure-item__reg';  c3.textContent = it.reg  || '—';
        li.append(c1, c2, c3);
        frag.appendChild(li);
      });
      ul.appendChild(frag);
    }

    // ================= ПУТЕВЫЕ УСЛОВИЯ (ленивая подгрузка) ==================
    const BUCKETS = {
      sea:      { ulSel: '#route-sea-list',      label: 'Морские',   model: 'SeaFleet'   },
      river:    { ulSel: '#route-river-list',    label: 'Речные',    model: 'MarinFleet' },
      riverSea: { ulSel: '#route-riversea-list', label: 'Река-море', model: 'MarinFleet' },
      other:    { ulSel: '#route-other-list',    label: 'Прочее',    model: 'MarinFleet' },
    };

    const routeState = {}; // bucket -> { ul, offset, busy, done }

    for (const [bucket, cfg] of Object.entries(BUCKETS)) {
      const ul = $(cfg.ulSel);
      if (!ul) continue;

      injectHeader(ul); // шапка «IMO | Название | Рег. №»
      routeState[bucket] = { ul, offset: 0, busy: false, done: false };

      // клик по строке -> формуляр
      ul.addEventListener('click', (e) => {
        const li = e.target.closest('.disclosure-item');
        if (li) openFormularByLi(li);
      });

      // бесконечная прокрутка
      ul.addEventListener('scroll', () => {
        if (ul.scrollTop + ul.clientHeight >= ul.scrollHeight - 20) {
          loadRoutePage(bucket);
        }
      }, { passive: true });

      // при первом раскрытии — грузим первую страницу
      const details = ul.closest('details');
      if (details) {
        details.addEventListener('toggle', () => {
          const st = routeState[bucket];
          if (details.open && st.offset === 0 && !st.busy) loadRoutePage(bucket);
        });
      }
    }

    // автозагрузка для уже открытых секций
    for (const [bucket, st] of Object.entries(routeState)) {
      const details = st.ul.closest('details');
      if (details && details.open && st.offset === 0 && !st.busy) {
        loadRoutePage(bucket);
      }
    }

    // счётчики в summary
    try {
      const facets = await ipcRenderer.invoke('get-index-facets');
      if (facets?.route) {
        for (const [bucket, cfg] of Object.entries(BUCKETS)) {
          const ul = $(cfg.ulSel);
          const summary = ul?.closest('details')?.querySelector('summary');
          if (summary) summary.textContent = `${cfg.label} (${facets.route[bucket]?.count ?? 0})`;
        }
      }
    } catch (e) {
      console.error('get-index-facets failed:', e);
    }

    async function loadRoutePage(bucket) {
      const st = routeState[bucket];
      if (!st || st.busy || st.done) return;

      st.busy = true;
      const ul = st.ul;

      try {
        if (st.offset === 0 && !ul.dataset.loading) {
          ul.dataset.loading = '1';
          ul.innerHTML = '<li class="disclosure-item"><span>Загрузка…</span><span></span><span></span></li>';
        }

        const { items, nextOffset } = await ipcRenderer.invoke('get-route-page', {
          bucket, offset: st.offset, limit: 200,
        });

        if (!items || !items.length) {
          st.done = true;
          if (st.offset === 0) {
            ul.innerHTML = '<li class="disclosure-item"><span>(нет данных)</span><span></span><span></span></li>';
          }
        } else {
          if (ul.dataset.loading) { ul.dataset.loading = ''; ul.innerHTML = ''; }
          const modelName = BUCKETS[bucket].model;
          appendItems(ul, items, modelName);
          st.offset = nextOffset;
        }
      } catch (err) {
        console.error('get-route-page failed', bucket, err);
        st.done = true;
        if (st.offset === 0) {
          ul.innerHTML = '<li class="disclosure-item"><span>Ошибка загрузки</span><span></span><span></span></li>';
        }
      } finally {
        st.busy = false;
      }
    }

    // ================= ГРУЗОВАЯ БАЗА (main_type из SeaFleet) =================
    (function initCargoBase() {
      const typeUL = $('#cargo-type-list');
      const catUL  = $('#cargo-category-list'); // правая таблица
      if (!typeUL || !catUL) return;

      injectHeader(catUL, 'cargo');

      let currentType = null;
      const cargoState = { offset: 0, busy: false, done: false };

      // загрузка типов
      (async () => {
        try {
          const types = await ipcRenderer.invoke('get-seafleet-types'); // [{type, count}]
          renderTypeList(types);
        } catch (e) {
          console.error('get-seafleet-types failed', e);
          renderTypeList([]);
        }
      })();

      // выбор типа слева
      typeUL.addEventListener('click', (e) => {
        const li = e.target.closest('.disclosure-item');
        if (!li) return;
        typeUL.querySelectorAll('.disclosure-item.is-selected').forEach(x => x.classList.remove('is-selected'));
        li.classList.add('is-selected');

        currentType = li.dataset.type || li.textContent.trim();
        resetCat();
        loadCatPage();

        const det = catUL.closest('details');
        if (det && !det.open) det.open = true;
      });

      // догрузка
      catUL.addEventListener('scroll', () => {
        if (catUL.scrollTop + catUL.clientHeight >= catUL.scrollHeight - 20) {
          loadCatPage();
        }
      }, { passive: true });

      // клик по строке
      catUL.addEventListener('click', (e) => {
        const li = e.target.closest('.disclosure-item');
        if (li) openFormularByLi(li);
      });

      function renderTypeList(types) {
        typeUL.innerHTML = '';
        if (!types || !types.length) {
          typeUL.innerHTML = '<li class="disclosure-item"><span></span><span>(нет данных)</span><span></span></li>';
          return;
        }
        const frag = document.createDocumentFragment();
        types.forEach(t => {
          const li = document.createElement('li');
          li.className = 'disclosure-item';
          li.dataset.type = t.type;

          const c1 = document.createElement('span');
          const c2 = document.createElement('span'); c2.textContent = t.type;
          const c3 = document.createElement('span'); c3.textContent = String(t.count ?? '');
          c3.style.justifySelf = 'end';

          li.append(c1, c2, c3);
          frag.appendChild(li);
        });
        typeUL.appendChild(frag);
      }

      function resetCat() {
        cargoState.offset = 0;
        cargoState.busy = false;
        cargoState.done = false;
        catUL.dataset.loading = '1';
        catUL.innerHTML = '<li class="disclosure-item"><span>Загрузка…</span><span></span><span></span></li>';
      }

      async function loadCatPage() {
        if (!currentType || cargoState.busy || cargoState.done) return;
        cargoState.busy = true;
        try {
          const { items, nextOffset } = await ipcRenderer.invoke('get-seafleet-by-type', {
            type: currentType, offset: cargoState.offset, limit: 200,
          });
          if (!items || !items.length) {
            cargoState.done = true;
            if (cargoState.offset === 0) {
              catUL.innerHTML = '<li class="disclosure-item"><span>(нет данных)</span><span></span><span></span></li>';
            }
          } else {
            if (catUL.dataset.loading) { catUL.dataset.loading = ''; catUL.innerHTML = ''; }
            appendItems(catUL, items, 'SeaFleet');
            cargoState.offset = nextOffset;
          }
        } catch (e) {
          console.error('get-seafleet-by-type failed', e);
          cargoState.done = true;
          if (cargoState.offset === 0) {
            catUL.innerHTML = '<li class="disclosure-item"><span>Ошибка загрузки</span><span></span><span></span></li>';
          }
        } finally {
          cargoState.busy = false;
        }
      }
    })();

    // ================= ДВИЖЕНИЕ (propulsion_type из SeaFleet) ================
    (function initMovement() {
      const typeUL  = $('#movement-type-list');     // слева — уникальные propulsion_type
      const tableUL = $('#movement-vessels-list');  // справа — суда выбранного типа
      if (!typeUL || !tableUL) return;

      injectHeader(tableUL, 'movement');
      let currentType = null;
      const mvState = { offset: 0, busy: false, done: false };

      // загрузка уникальных типов
      (async () => {
        try {
          const types = await ipcRenderer.invoke('get-movement-types'); // [{type,count}]
          renderTypeList(types);
        } catch (e) {
          console.error('get-movement-types failed:', e);
          renderTypeList([]);
        }
      })();

      // выбор типа
      typeUL.addEventListener('click', (e) => {
        const li = e.target.closest('.disclosure-item');
        if (!li) return;
        typeUL.querySelectorAll('.disclosure-item.is-selected').forEach(x => x.classList.remove('is-selected'));
        li.classList.add('is-selected');

        currentType = li.dataset.type || li.textContent.trim();
        resetTable();
        loadPage();

        const det = tableUL.closest('details');
        if (det && !det.open) det.open = true;
      });

      // догрузка
      tableUL.addEventListener('scroll', () => {
        if (tableUL.scrollTop + tableUL.clientHeight >= tableUL.scrollHeight - 20) {
          loadPage();
        }
      }, { passive: true });

      // клик -> формуляр
      tableUL.addEventListener('click', (e) => {
        const li = e.target.closest('.disclosure-item');
        if (li) openFormularByLi(li);
      });

      function renderTypeList(types) {
        typeUL.innerHTML = '';
        if (!types || !types.length) {
          typeUL.innerHTML = '<li class="disclosure-item"><span></span><span>(нет данных)</span><span></span></li>';
          return;
        }
        const frag = document.createDocumentFragment();
        for (const t of types) {
          const li = document.createElement('li');
          li.className = 'disclosure-item';
          li.dataset.type = t.type;

          const c1 = document.createElement('span');
          const c2 = document.createElement('span'); c2.textContent = t.type;
          const c3 = document.createElement('span'); c3.textContent = String(t.count ?? '');
          c3.style.justifySelf = 'end';

          li.append(c1, c2, c3);
          frag.appendChild(li);
        }
        typeUL.appendChild(frag);
      }

      function resetTable() {
        mvState.offset = 0;
        mvState.busy = false;
        mvState.done = false;
        tableUL.dataset.loading = '1';
        tableUL.innerHTML = '<li class="disclosure-item"><span>Загрузка…</span><span></span><span></span></li>';
      }

      async function loadPage() {
        if (!currentType || mvState.busy || mvState.done) return;
        mvState.busy = true;
        try {
          const { items, nextOffset } = await ipcRenderer.invoke('get-movement-by-type', {
            type: currentType, offset: mvState.offset, limit: 200,
          });
          if (!items || !items.length) {
            mvState.done = true;
            if (mvState.offset === 0) {
              tableUL.innerHTML = '<li class="disclosure-item"><span>(нет данных)</span><span></span><span></span></li>';
            }
          } else {
            if (tableUL.dataset.loading) { tableUL.dataset.loading = ''; tableUL.innerHTML = ''; }
            appendItems(tableUL, items, 'SeaFleet');
            mvState.offset = nextOffset;
          }
        } catch (e) {
          console.error('get-movement-by-type failed:', e);
          mvState.done = true;
          if (mvState.offset === 0) {
            tableUL.innerHTML = '<li class="disclosure-item"><span>Ошибка загрузки</span><span></span><span></span></li>';
          }
        } finally {
          mvState.busy = false;
        }
      }
    })();

    // ================== ФАСЕТЫ: Порт приписки / Страна строителя ============
    (function initFactory() {
      // Общий рендерер левой колонки (значение + count)
      function renderFacetList(ul, items, dataKey) {
        ul.innerHTML = '';
        if (!items || !items.length) {
          ul.innerHTML = '<li class="disclosure-item"><span></span><span>(нет данных)</span><span></span></li>';
          return;
        }
        const frag = document.createDocumentFragment();
        for (const t of items) {
          const li = document.createElement('li');
          li.className = 'disclosure-item';
          li.dataset[dataKey] = t.value; // t.value — строка значения фасета

          const c1 = document.createElement('span');
          const c2 = document.createElement('span'); c2.textContent = t.value || '—';
          const c3 = document.createElement('span'); c3.textContent = String(t.count ?? '');
          c3.style.justifySelf = 'end';

          li.append(c1, c2, c3);
          frag.appendChild(li);
        }
        ul.appendChild(frag);
      }

      // ---- 1) ПОРТ ПРИПИСКИ
      (function initHomeport() {
        const typeUL  = document.querySelector('#homeport-list');           // слева — список портов
        const tableUL = document.querySelector('#homeport-vessels-list');   // справа — суда выбранного порта
        if (!typeUL || !tableUL) return;

        injectHeader(tableUL, 'homeport'); // шапка "IMO | Название | Рег. №"

        let current = null;
        const st = { offset: 0, busy: false, done: false };

        // Загрузка уникальных портов
        (async () => {
          try {
            // Ожидаемый ответ: [{ value: 'Saint Petersburg', count: 123 }, ...]
            const ports = await ipcRenderer.invoke('get-homeports');
            renderFacetList(typeUL, ports, 'value');
          } catch (e) {
            console.error('get-homeports failed:', e);
            renderFacetList(typeUL, [], 'value');
          }
        })();

        // Выбор порта
        typeUL.addEventListener('click', (e) => {
          const li = e.target.closest('.disclosure-item');
          if (!li) return;

          typeUL.querySelectorAll('.disclosure-item.is-selected').forEach(x => x.classList.remove('is-selected'));
          li.classList.add('is-selected');

          current = li.dataset.value || li.textContent.trim();
          resetTable();
          loadPage();

          const det = tableUL.closest('details');
          if (det && !det.open) det.open = true;
        });

        // Догрузка
        tableUL.addEventListener('scroll', () => {
          if (tableUL.scrollTop + tableUL.clientHeight >= tableUL.scrollHeight - 20) {
            loadPage();
          }
        }, { passive: true });

        // Клик по строке -> формуляр
        tableUL.addEventListener('click', (e) => {
          const li = e.target.closest('.disclosure-item');
          if (li) openFormularByLi(li);
        });

        function resetTable() {
          st.offset = 0; st.busy = false; st.done = false;
          tableUL.dataset.loading = '1';
          tableUL.innerHTML = '<li class="disclosure-item"><span>Загрузка…</span><span></span><span></span></li>';
        }

        async function loadPage() {
          if (!current || st.busy || st.done) return;
          st.busy = true;
          try {
            // Ожидаемый ответ: { items: [{id, imo, name, reg}], nextOffset }
            const { items, nextOffset } = await ipcRenderer.invoke('get-vessels-by-homeport', {
              homeport: current, offset: st.offset, limit: 200,
            });

            if (!items || !items.length) {
              st.done = true;
              if (st.offset === 0) {
                tableUL.innerHTML = '<li class="disclosure-item"><span>(нет данных)</span><span></span><span></span></li>';
              }
            } else {
              if (tableUL.dataset.loading) { tableUL.dataset.loading = ''; tableUL.innerHTML = ''; }
              // Если данные только из SeaFleet — оставьте 'SeaFleet'; иначе можно вернуть model в item и доработать appendItems
              appendItems(tableUL, items, 'SeaFleet');
              st.offset = nextOffset;
            }
          } catch (e) {
            console.error('get-vessels-by-homeport failed:', e);
            st.done = true;
            if (st.offset === 0) {
              tableUL.innerHTML = '<li class="disclosure-item"><span>Ошибка загрузки</span><span></span><span></span></li>';
            }
          } finally {
            st.busy = false;
          }
        }
      })();

      // ---- 2) СТРАНА СТРОИТЕЛЬ
      (function initBuilderCountry() {
        const typeUL  = document.querySelector('#builder-country-list');          // слева — список стран
        const tableUL = document.querySelector('#builder-country-vessels-list');  // справа — суда выбранной страны
        if (!typeUL || !tableUL) return;

        injectHeader(tableUL, 'builder-country'); // шапка "IMO | Название | Рег. №"

        let current = null;
        const st = { offset: 0, busy: false, done: false };

        // Загрузка уникальных стран строителей
        (async () => {
          try {
            // Ожидаемый ответ: [{ value: 'Russia', count: 456 }, ...]
            const countries = await ipcRenderer.invoke('get-builder-countries');
            renderFacetList(typeUL, countries, 'value');
          } catch (e) {
            console.error('get-builder-countries failed:', e);
            renderFacetList(typeUL, [], 'value');
          }
        })();

        // Выбор страны
        typeUL.addEventListener('click', (e) => {
          const li = e.target.closest('.disclosure-item');
          if (!li) return;

          typeUL.querySelectorAll('.disclosure-item.is-selected').forEach(x => x.classList.remove('is-selected'));
          li.classList.add('is-selected');

          current = li.dataset.value || li.textContent.trim();
          resetTable();
          loadPage();

          const det = tableUL.closest('details');
          if (det && !det.open) det.open = true;
        });

        // Догрузка
        tableUL.addEventListener('scroll', () => {
          if (tableUL.scrollTop + tableUL.clientHeight >= tableUL.scrollHeight - 20) {
            loadPage();
          }
        }, { passive: true });

        // Клик по строке -> формуляр
        tableUL.addEventListener('click', (e) => {
          const li = e.target.closest('.disclosure-item');
          if (li) openFormularByLi(li);
        });

        function resetTable() {
          st.offset = 0; st.busy = false; st.done = false;
          tableUL.dataset.loading = '1';
          tableUL.innerHTML = '<li class="disclosure-item"><span>Загрузка…</span><span></span><span></span></li>';
        }

        async function loadPage() {
          if (!current || st.busy || st.done) return;
          st.busy = true;
          try {
            // Ожидаемый ответ: { items: [{id, imo, name, reg}], nextOffset }
            const { items, nextOffset } = await ipcRenderer.invoke('get-vessels-by-builder-country', {
              country: current, offset: st.offset, limit: 200,
            });

            if (!items || !items.length) {
              st.done = true;
              if (st.offset === 0) {
                tableUL.innerHTML = '<li class="disclosure-item"><span>(нет данных)</span><span></span><span></span></li>';
              }
            } else {
              if (tableUL.dataset.loading) { tableUL.dataset.loading = ''; tableUL.innerHTML = ''; }
              appendItems(tableUL, items, 'SeaFleet'); // см. комментарий выше про модель
              st.offset = nextOffset;
            }
          } catch (e) {
            console.error('get-vessels-by-builder-country failed:', e);
            st.done = true;
            if (st.offset === 0) {
              tableUL.innerHTML = '<li class="disclosure-item"><span>Ошибка загрузки</span><span></span><span></span></li>';
            }
          } finally {
            st.busy = false;
          }
        }
      })();
    })(); // конец initFactory

    // ===================== ВКЛАДКИ: ФЛОТ / ЗАВОД / ДВИГАТЕЛЬ =================
    (function initTabs() {
      const tablist = document.querySelector('.tabs[role="tablist"]');
      if (!tablist) return;

      const buttons = Array.from(tablist.querySelectorAll('button.tab[role="tab"][data-tab]'));
      const panels = buttons
        .map(btn => document.getElementById(btn.getAttribute('aria-controls')))
        .filter(Boolean);

      function activate(name, { updateHash = true } = {}) {
        // переключаем кнопки
        for (const btn of buttons) {
          const isActive = btn.dataset.tab === name;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
          btn.tabIndex = isActive ? 0 : -1;
        }
        // переключаем панели
        const targetId = 'tab-' + name;
        for (const p of panels) {
          const on = p.id === targetId;
          p.hidden = !on;
          p.setAttribute('aria-hidden', String(!on));
          p.classList.toggle('active', on);
        }
        // hash + память
        if (updateHash) {
          history.replaceState(null, '', '#' + name);
          localStorage.setItem('activeTab', name);
        }
      }

      // Клик мышью
      tablist.addEventListener('click', (e) => {
        const btn = e.target.closest('button.tab[role="tab"][data-tab]');
        if (!btn) return;
        e.preventDefault();
        activate(btn.dataset.tab);
      });

      // Клавиатура
      tablist.addEventListener('keydown', (e) => {
        const idx = buttons.findIndex(b => b.classList.contains('active'));
        let i = idx;
        if (e.key === 'ArrowRight') { i = (idx + 1) % buttons.length; buttons[i].focus(); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { i = (idx - 1 + buttons.length) % buttons.length; buttons[i].focus(); e.preventDefault(); }
        else if (e.key === 'Home') { buttons[0].focus(); e.preventDefault(); }
        else if (e.key === 'End') { buttons[buttons.length - 1].focus(); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === ' ') {
          const btn = document.activeElement?.closest('button.tab[role="tab"][data-tab]');
          if (btn) activate(btn.dataset.tab);
          e.preventDefault();
        }
      });

      // Реакция на изменение #hash
      window.addEventListener('hashchange', () => {
        const name = location.hash.slice(1);
        if (buttons.some(b => b.dataset.tab === name)) {
          activate(name, { updateHash: false });
        }
      });

      // Старт: hash → localStorage → активная кнопка → первая
      const start =
        (location.hash && location.hash.slice(1)) ||
        localStorage.getItem('activeTab') ||
        buttons.find(b => b.classList.contains('active'))?.dataset.tab ||
        buttons[0]?.dataset.tab;

      if (start) activate(start, { updateHash: false });
    })();
  } // конец init

})(); // конец внешней IIFE
