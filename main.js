// main.js - Versión con errores detallados
console.log('main.js: Script started.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js: DOMContentLoaded fired.');
    
    // Lógica para el botón "Volver Arriba" y resaltado de la navegación
    const backToTopButton = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar nav ul a');

    console.log('main.js: Setting up scroll event listener.');
    window.addEventListener('scroll', () => {
        // Visibilidad del botón "Volver Arriba"
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }

        // Resaltado del enlace de navegación activo
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - sectionHeight / 3) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
    console.log('main.js: Scroll event listener set.');

    // Desplazamiento suave para el botón "Volver Arriba"
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    console.log('main.js: Back to top button event listener set.');

    // Lógica para el manejo de pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0 && tabContents.length > 0) {
        console.log('main.js: Setting up tab event listeners.');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Desactivar todas las pestañas y ocultar todos los contenidos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Activar la pestaña clicada
                button.classList.add('active');

                // Mostrar el contenido correspondiente
                const targetTabId = button.dataset.tab;
                const targetTabContent = document.getElementById(targetTabId);
                if (targetTabContent) {
                    targetTabContent.classList.add('active');
                } else {
                    console.error(`main.js: Tab content with ID '${targetTabId}' not found.`);
                }
            });
        });
        console.log('main.js: Tab event listeners set.');
    } else {
        console.log('main.js: No tab buttons or tab contents found, skipping tab logic setup.');
    }
});
console.log('main.js: Script finished (waiting for DOMContentLoaded).');
