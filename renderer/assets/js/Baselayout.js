// renderer/assets/js/Baselayout.js
(function () {
    async function loadLayout() {
      if (window.__layoutLoaded) return;          // защита от двойного запуска
      window.__layoutLoaded = true;
  
      const pageContainer = document.getElementById('page-content');
      if (!pageContainer) return;
  
      // 1) вырежем extra-узел из уникального контента
      const pageTitle = pageContainer.dataset.title || document.title || 'Верхняя панель';
      const extraNode = pageContainer.querySelector('[data-top-extra]');
      let extraHTML = '';
      if (extraNode) {
        extraHTML = extraNode.innerHTML;
        extraNode.remove();                       // <-- вырезаем, чтобы не дублировать
      }
      const uniqueHTML = pageContainer.innerHTML; // уже без extra-узла
  
      // 2) подгружаем базовый лэйаут (лежит рядом со страницей)
      const res = await fetch('base.html', { cache: 'no-store' });
      if (!res.ok) {
        console.error('Не удалось загрузить base.html:', res.status, res.statusText);
        return;
      }
      const layoutHtml = await res.text();
  
      // 3) вставляем лэйаут и подставляем слоты
      document.body.innerHTML = layoutHtml;
      document.title = pageTitle;
  
      const titleEl   = document.getElementById('page-title');
      const contentEl = document.getElementById('content');
      const extraHost = document.getElementById('top-extra');
  
      if (titleEl)   titleEl.textContent = pageTitle;
      if (contentEl) contentEl.innerHTML = uniqueHTML;
      if (extraHost) extraHost.innerHTML = extraHTML;
  
      // 4) интерактив: меню и тема
      wireSidebar();
      wireThemeToggle();
      document.dispatchEvent(new CustomEvent('layout:ready', { detail: { pageTitle } }));
    }
  
    function wireSidebar() {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.overlay');
      const btn     = document.getElementById('sidebar-toggle');
      if (!sidebar || !overlay || !btn) return;
  
      btn.addEventListener('click', () => {
        const isActive = sidebar.classList.toggle('active');
        overlay.classList.toggle('active', isActive);
        btn.setAttribute('aria-label', isActive ? 'Закрыть меню' : 'Открыть меню');
        btn.textContent = isActive ? '✖' : '☰';
      });
  
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        btn.setAttribute('aria-label', 'Открыть меню');
        btn.textContent = '☰';
      });
    }
  
    function updateThemeButton(mode, btn) {
      if (!btn) return;
      if (mode === 'dark')  { btn.textContent = '🌙'; btn.title = 'Тёмная тема'; }
      else if (mode === 'light') { btn.textContent = '🌞'; btn.title = 'Светлая тема'; }
      else { btn.textContent = '🌗'; btn.title = 'Авто (по системе)'; }
    }
    function applyTheme(mode, btn) {
      const b = document.body;
      if (mode === 'dark') b.setAttribute('data-theme','dark');
      else if (mode === 'light') b.setAttribute('data-theme','light');
      else b.removeAttribute('data-theme'); // system
      localStorage.setItem('theme', mode);
      updateThemeButton(mode, btn);
    }
    function wireThemeToggle() {
      const btn = document.getElementById('theme-toggle');
      const saved = localStorage.getItem('theme') || 'system';
      applyTheme(saved, btn);
      btn?.addEventListener('click', () => {
        const current = localStorage.getItem('theme') || 'system';
        const next = current === 'system' ? 'dark' : (current === 'dark' ? 'light' : 'system');
        applyTheme(next, btn);
      });
    }
  
    document.addEventListener('DOMContentLoaded', loadLayout);
  })();
  