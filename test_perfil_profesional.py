# Contenido de test_perfil_profesional.py
import requests

# URL de tu perfil
URL_PERFIL = "https://pablosebastiangomez-dev.github.io/professional-profile/"

def test_01_pagina_carga_correctamente():
    """Verifica que la página responde con código de estado 200 (OK)."""
    respuesta = requests.get(URL_PERFIL)
    assert respuesta.status_code == 200

def test_02_contiene_nombre_clave():
    """Verifica que tu nombre aparezca en el contenido de la página."""
    respuesta = requests.get(URL_PERFIL)
    # Convertimos el contenido a minúsculas para una búsqueda sin distinción
    contenido = respuesta.text.lower()
    
    # Reemplaza "Pablo Sebastian Gómez" con tu nombre real
    assert "pablo sebastian gómez" in contenido 

def test_03_contiene_enlace_github():
    """Verifica que la página contenga el enlace a tu GitHub."""
    respuesta = requests.get(URL_PERFIL)
    contenido = respuesta.text
    
    # Verifica la existencia de un enlace (puedes ajustar el texto si es necesario)
    assert 'href="https://github.com/pablosebastiangomez-dev"' in contenido
