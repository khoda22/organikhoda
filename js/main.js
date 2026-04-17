function navigateTo(pageId) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    // Mostrar la solicitada
    document.getElementById(pageId).classList.remove('hidden');
    window.scrollTo(0,0);
}

// Iniciar en la página 1
document.addEventListener('DOMContentLoaded', () => navigateTo('page-1'));