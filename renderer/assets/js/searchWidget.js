;(() => {
    function injectBaseCSS() {
      if (document.getElementById('__search_widget_styles')) return;
      const css = `
        .search-bar { position: relative; }
        #search-suggest.search-suggest{
          position:absolute; top:100%; left:0; right:0;
          max-height:260px; overflow-y:auto;
          background:var(--panel,#fff); border:1px solid #ccc; border-radius:6px;
          margin:4px 0 0; padding:0; z-index:50;
          box-shadow:0 8px 20px rgba(0,0,0,.08);
        }
        .search-suggest .suggest-table{ width:100%; border-collapse:collapse; }
        .search-suggest thead th{
          position: sticky; top:0; background:var(--panel,#fff);
          font-weight:600; font-size:12px; text-align:left;
          padding:8px 10px; border-bottom:1px solid #ddd;
        }
        .search-suggest tbody tr.suggest-row{
          cursor:pointer;
        }
        .search-suggest tbody tr.suggest-row[aria-selected="true"],
        .search-suggest tbody tr.suggest-row:hover{
          background:rgba(0,0,0,.06);
        }
        .search-suggest td{
          padding:8px 10px; font-size:14px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .suggest-col-reg{ width: 28%; }
        .suggest-col-imo{ width: 18%; }
        .suggest-col-name{ width: 54%; }
      `;
      const el = document.createElement('style');
      el.id = '__search_widget_styles';
      el.textContent = css;
      document.head.appendChild(el);
    }
  
    function debounce(fn, ms=200){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }
  
    /**
     * Инициализация виджета поиска
     * @param {Object} opts
     * @param {string} opts.input
     * @param {string} opts.suggest
     * @param {string} [opts.tableScroll]
     * @param {string} [opts.resultInfo]
     * @param {number} [opts.minChars=2]
     * @param {number} [opts.limit=12]
     * @param {number} [opts.debounceMs=200]
     * @param {Function} opts.triggerSearch  - async (query) => void
     * @param {Function} [opts.fetchCounts]  - async (query) => ({totalRecords, filteredCount})
     * @param {string} [opts.ipcSuggest='search-ship-suggest']
     */
    function mountSearchWidget(opts){
      const {
        input, suggest, tableScroll, resultInfo,
        minChars = 2, limit = 12, debounceMs = 200,
        triggerSearch, fetchCounts,
        ipcSuggest = 'search-ship-suggest',
        onPick, //
      } = opts || {};
  
      if (!input || !suggest || typeof triggerSearch !== 'function') {
        console.error('[searchWidget] required options missing');
        return;
      }
  
      injectBaseCSS();
  
      const { ipcRenderer } = require('electron');
      const $input   = document.querySelector(input);
      const $suggest = document.querySelector(suggest);
      const $scroll  = tableScroll ? document.querySelector(tableScroll) : null;
      const $info    = resultInfo ? document.querySelector(resultInfo) : null;
  
      if (!$input || !$suggest){
        console.warn('[searchWidget] selectors not found yet, delay init');
        return;
      }
  
      let open = false;
      let activeIndex = -1;
      let lastQuery = '';
  
      function clearSuggest(){
        $suggest.innerHTML = '';
        open = false;
        activeIndex = -1;
      }
  
      function renderSuggestTable(rows){
        if (!rows || !rows.length){ clearSuggest(); return; }
        const thead = `
          <thead>
            <tr>
              <th class="suggest-col-reg">Рег. №</th>
              <th class="suggest-col-imo">IMO</th>
              <th class="suggest-col-name">Название</th>
            </tr>
          </thead>`;
        const tbody = `
          <tbody>
            ${rows.map((r)=>`
              <tr class="suggest-row" data-id="${r.id}" data-model="${r.model}"
                  data-reg="${r.reg_number||''}" data-imo="${r.imo_number||''}" data-name="${r.vessel_name||''}"
                  role="option" aria-selected="false">
                <td title="${r.reg_number||''}">${r.reg_number||'—'}</td>
                <td title="${r.imo_number||''}">${r.imo_number||'—'}</td>
                <td title="${r.vessel_name||''}">${r.vessel_name||'—'}</td>
              </tr>
            `).join('')}
          </tbody>`;
        $suggest.innerHTML = `<table class="suggest-table">${thead}${tbody}</table>`;
        open = true;
        activeIndex = rows.length ? 0 : -1;
        updateActiveRow();
      }
  
      async function requestSuggest(q){
        try{
          const items = await ipcRenderer.invoke(ipcSuggest, { q, limit });
          renderSuggestTable(items);
        }catch(e){
          console.error('[searchWidget] suggest fail', e);
          clearSuggest();
        }
      }
  
      async function doSearch(q){
        lastQuery = q;
        // Подсказки не скрываем здесь — скрываем только по Enter/клику/Esc,
        // чтобы пользователь мог выбрать из выпадающего списка.
        if ($info) $info.textContent = '';
        await triggerSearch(q);
        if (fetchCounts){
          try {
            const { totalRecords, filteredCount } = await fetchCounts(q);
            if ($info) $info.textContent = `Найдено ${filteredCount} из ${totalRecords} записей.`;
          } catch(e){ console.error('[searchWidget] counts fail', e); }
        }
      }
  
      const onInput = debounce(async (ev) => {
        const q = ev.target.value.trim();
        lastQuery = q;
  
        if (q.length >= minChars){
          await requestSuggest(q);
        } else {
          clearSuggest();
        }
      }, debounceMs);
  
      $input.addEventListener('input', onInput);
  
      // Клик по подсказке (табличная строка)
      $suggest.addEventListener('click', async (e)=>{
        const tr = e.target.closest('tr.suggest-row');
        if (!tr) return;
      
        // если передан onPick — навигируем в формуляр
        if (typeof onPick === 'function') {
          clearSuggest();
          await onPick({
            id: Number(tr.dataset.id),
            model: tr.dataset.model || 'MarinFleet',
            reg: tr.dataset.reg || '',
            imo: tr.dataset.imo || '',
            name: tr.dataset.name || '',
          });
          return;
        }
      
        // иначе — прежнее поведение (подставить текст и запустить поиск)
        const text = (tr.dataset.name || tr.dataset.imo || tr.dataset.reg || '').trim();
        $input.value = text;
        clearSuggest();
        await doSearch(text);
      });
  
      // Навигация по подсказкам: ↑ ↓ Enter Esc
      $input.addEventListener('keydown', async (e)=>{
        if (!open) {
          if (e.key === 'Enter') { // запуск поиска по текущему вводу
            e.preventDefault();
            clearSuggest();
            await doSearch($input.value.trim());
          }
          return;
        }
        const rows = Array.from($suggest.querySelectorAll('tr.suggest-row'));
        if (!rows.length) return;
  
        if (e.key === 'ArrowDown'){
          e.preventDefault();
          activeIndex = (activeIndex + 1) % rows.length;
          updateActiveRow();
        } else if (e.key === 'ArrowUp'){
          e.preventDefault();
          activeIndex = (activeIndex - 1 + rows.length) % rows.length;
          updateActiveRow();
        } else if (e.key === 'Enter'){
          e.preventDefault();
          const tr = rows[activeIndex] || rows[0];
          if (tr){
            const text = (tr.dataset.name || tr.dataset.imo || tr.dataset.reg || '').trim();
            $input.value = text;
            clearSuggest();
            await doSearch(text);
          }
        } else if (e.key === 'Escape'){
          clearSuggest();
        }
      });
  
      function updateActiveRow(){
        const rows = Array.from($suggest.querySelectorAll('tr.suggest-row'));
        rows.forEach((el,i)=>{
          el.setAttribute('aria-selected', String(i===activeIndex));
          if (i===activeIndex){
            el.scrollIntoView({ block: 'nearest' });
          }
        });
      }
  
      // Скрыть при клике «вне»
      document.addEventListener('click', (e)=>{
        if (!e.target.closest(suggest) && !e.target.closest(input)) clearSuggest();
      });
  
      // Скрыть при прокрутке таблицы
      $scroll?.addEventListener('scroll', clearSuggest, { passive: true });
  
      // Публичный API
      return {
        refresh: () => (lastQuery ? doSearch(lastQuery) : doSearch('')),
        clear: () => { $input.value=''; clearSuggest(); doSearch(''); }
      };
    }
  
    // Экспорт
    window.mountSearchWidget = mountSearchWidget;
  })();
  