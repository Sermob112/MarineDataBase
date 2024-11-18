document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.overlay');

    toggleButton.addEventListener('click', () => {
        const isActive = sidebar.classList.toggle('active');
        overlay.classList.toggle('active', isActive);

        // Изменяем положение кнопки
        if (isActive) {
            toggleButton.style.left = '190px';
            toggleButton.textContent = '⟨';
        } else {
            toggleButton.style.left = '20px';
            toggleButton.textContent = '⟩';
        }
    });

    // Закрытие сайдбара при клике на затемнение
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        toggleButton.style.left = '20px';
        toggleButton.textContent = '⟩';
    });
});