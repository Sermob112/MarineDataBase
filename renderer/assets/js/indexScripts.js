document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const shipTable = document.querySelector('#ship-table');

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        toggleButton.textContent = sidebar.classList.contains('hidden') ? '⟩' : '⟨';

        // Обновление состояния таблицы
        if (sidebar.classList.contains('hidden')) {
            shipTable.style.marginLeft = '20px';
            shipTable.style.width = 'calc(100% - 40px)';
        } else {
            shipTable.style.marginLeft = '260px';
            shipTable.style.width = 'calc(100% - 260px)';
        }
    });
});
