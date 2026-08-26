// só o basico é o essencial!
document.addEventListener('DOMContentLoaded', () => {
    const btnInfo = document.getElementById('btnInfo');
    const textoInfo = document.getElementById('textoInfo');

    if (btnInfo && textoInfo) {
        btnInfo.addEventListener('click', () => {
            // Alterna entre mostrar e esconder a caixa de texto
            if (textoInfo.style.display === 'none' || textoInfo.style.display === '') {
                textoInfo.style.display = 'block';
            } else {
                textoInfo.style.display = 'none';
            }
        });
    }
});﻿
