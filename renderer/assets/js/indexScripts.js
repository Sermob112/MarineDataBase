// renderer/assets/js/indexScripts.js
// Путевые условия: постраничная подгрузка + шапки колонок
// Грузовая база: раскрывающийся список "Тип → Категория" (пока статический набор)
(function () {
  if (window.__indexPageInit) return;
  window.__indexPageInit = true;

  // ждём, пока Baselayout подменит body
  if (window.__layoutLoaded) init();
  else document.addEventListener('layout:ready', init, { once: true });

  function $(sel) { return document.querySelector(sel); }

  async function init() {
    const { ipcRenderer } = require('electron');

    // ---------- ПУТЕВЫЕ УСЛОВИЯ ----------
    const BUCKETS = {
      sea:      { ulSel: '#route-sea-list',      label: 'Морские'   },
      river:    { ulSel: '#route-river-list',    label: 'Речные'    },
      riverSea: { ulSel: '#route-riversea-list', label: 'Река-море' }
    };

    // навешиваем хедеры (IMO | Название | Рег.№) и ленивую загрузку
    const state = {};
    for (const [key, cfg] of Object.entries(BUCKETS)) {
      const ul = $(cfg.ulSel);
      if (!ul) continue;

      // вставим "шапку" перед списком
      injectHeader(ul);

      state[key] = { ul, offset: 0, busy: false, done: false };

      // бесконечная прокрутка
      ul.addEventListener('scroll', () => {
        if (ul.scrollTop + ul.clientHeight >= ul.scrollHeight - 20) {
          loadPage(key);
        }
      }, { passive: true });

      // при первом раскрытии — загрузим 1-ю страницу
      const details = ul.closest('details');
      if (details) {
        details.addEventListener('toggle', () => {
          if (details.open && state[key].offset === 0 && !state[key].busy) {
            loadPage(key);
          }
        });
      }
    }

    // проставим счётчики в summary
    try {
      const facets = await ipcRenderer.invoke('get-index-facets');
      if (facets?.route) {
        setSummaryCount('#route-group details:nth-child(1) > summary', 'Морские',   facets.route.sea?.count ?? 0);
        setSummaryCount('#route-group details:nth-child(2) > summary', 'Речные',    facets.route.river?.count ?? 0);
        setSummaryCount('#route-group details:nth-child(3) > summary', 'Река-море', facets.route.riverSea?.count ?? 0);
      }
    } catch (e) {
      console.error('get-index-facets failed:', e);
    }

    // функция дорисовки строк (3 колонки)
    function appendItems(ul, items) {
      const frag = document.createDocumentFragment();
      for (const it of (items || [])) {
        const li = document.createElement('li');
        li.className = 'disclosure-item';
        li.dataset.id = it.id;

        frag.appendChild(buildRow(it.imo, it.name, it.reg, li));
      }
      ul.appendChild(frag);
    }

    function buildRow(imo, name, reg, liEl) {
      const li = liEl || document.createElement('li');
      li.className = 'disclosure-item';

      const c1 = document.createElement('span');
      c1.className = 'disclosure-item__imo';
      c1.textContent = imo ?? '—';

      const c2 = document.createElement('span');
      c2.className = 'disclosure-item__name';
      c2.textContent = name ?? '—';

      const c3 = document.createElement('span');
      c3.className = 'disclosure-item__reg';
      c3.textContent = reg ?? '—';

      li.append(c1, c2, c3);
      return li;
    }

    function injectHeader(ul) {
      // хедер как "липкая" строка над UL
      const head = document.createElement('div');
      head.className = 'disclosure-head';
      head.innerHTML = `
        <span class="disclosure-item__imo">IMO</span>
        <span class="disclosure-item__name">Название</span>
        <span class="disclosure-item__reg">Рег. №</span>
      `;
      // вставим прямо перед UL
      const parent = ul.parentElement;
      parent.insertBefore(head, ul);
    }

    function setSummaryCount(selector, label, count) {
      const s = $(selector);
      if (s) s.textContent = `${label} (${count})`;
    }

    async function loadPage(bucket) {
      const st = state[bucket];
      if (!st || st.busy || st.done) return;

      st.busy = true;
      const ul = st.ul;

      try {
        if (st.offset === 0 && !ul.dataset.loading) {
          ul.dataset.loading = '1';
          ul.innerHTML = '<li class="disclosure-item"><span>Загрузка…</span><span></span><span></span></li>';
        }

        const { items, nextOffset } = await ipcRenderer.invoke('get-route-page', {
          bucket, offset: st.offset, limit: 200
        });

        if (!items || !items.length) {
          st.done = true;
          if (st.offset === 0) {
            ul.innerHTML = '<li class="disclosure-item"><span>(нет данных)</span><span></span><span></span></li>';
          }
        } else {
          if (ul.dataset.loading) { ul.dataset.loading = ''; ul.innerHTML = ''; }
          appendItems(ul, items);
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

    // ---------- ГРУЗОВАЯ БАЗА (Тип → Категория) ----------
    // статический набор, чтобы вернуть UI (позже подключим из БД)
    const cargoData = {
      'Сухогрузы': [
        'Навалочные (Bulk carrier)',
        'Генеральные (Break-bulk)',
        'Лесовозы',
        'Рефрижераторные',
        'Контейнеровозы',
        'RO-RO (сухогрузные)'
      ],
      'Наливные': [
        'Нефтеналивные (Crude)',
        'Продуктовозы (Product)',
        'Химовозы',
        'Газовозы LNG',
        'Газовозы LPG'
      ],
      'Пассажирские': [
        'Круизные',
        'Паромы (Ferry)',
        'Высокоскоростные (HSC)'
      ],
      'RO-RO / Ро-пакс': [
        'Автомобилевозы (Car carrier)',
        'Ро-пакс (грузопассажирские)',
        'Трейлеровозы'
      ],
      'Специальные / Служебные': [
        'Буксиры',
        'Снабжение (PSV/OSV)',
        'Научно-исследовательские',
        'Рыбопромысловые',
        'Дноуглубительные (земснаряды)',
        'Кабелеукладчики'
      ]
    };

    function renderList(ul, items){
      ul.innerHTML = '';
      const frag = document.createDocumentFragment();
      (items || []).forEach(txt => {
        const li = document.createElement('li');
        li.className = 'disclosure-item';
        // для единообразия сетки 3-колонки: кладём в среднюю колонку
        li.append(
          document.createElement('span'),
          Object.assign(document.createElement('span'), { textContent: txt }),
          document.createElement('span')
        );
        frag.appendChild(li);
      });
      ul.appendChild(frag);
    }
    function makeSingleSelectable(ul, onChange){
      ul.addEventListener('click', (e)=>{
        const li = e.target.closest('.disclosure-item');
        if (!li) return;
        ul.querySelectorAll('.disclosure-item.is-selected').forEach(x => x.classList.remove('is-selected'));
        li.classList.add('is-selected');
        onChange?.(li.textContent.trim());
      });
    }

    const typeUL = document.getElementById('cargo-type-list');
    const catUL  = document.getElementById('cargo-category-list');

    if (typeUL && catUL) {
      renderList(typeUL, Object.keys(cargoData));
      renderList(catUL, []);

      makeSingleSelectable(typeUL, (typeName) => {
        const cats = cargoData[typeName] || [];
        renderList(catUL, cats);
        const det = catUL.closest('details');
        if (cats.length && det && !det.open) det.open = true;
      });

      makeSingleSelectable(catUL, (cat) => {
        // тут можно дернуть фильтр по базе по выбранному типу/категории
        // console.log('Cargo selected:', cat);
      });
    }

    // внутри init() после того как создал state и loaders для sea/river/riverSea:
    function onRowClick(e){
      const li = e.target.closest('.disclosure-item');
      if (!li || !li.dataset.id) return;
      openFormular(li.dataset.id);
    }
    Object.values(state).forEach(({ ul }) => {
      ul.addEventListener('click', onRowClick);
    });

    // переход в формуляр
    async function openFormular(shipId) {
      try {
        const { ipcRenderer } = require('electron');
        await ipcRenderer.invoke('load-ship-details', Number(shipId));
        // переходим на страницу формуляра
        window.location.href = 'shipFormular.html';
      } catch (err) {
        console.error('openFormular failed', err);
      }
    }

  }
})();
