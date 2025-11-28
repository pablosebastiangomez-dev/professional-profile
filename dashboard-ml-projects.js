console.log('dashboard-ml-projects.js: Script started.');

    // Función para realizar la simulación de predicción
    function simulatePrediction() {
        const antiguedad = document.getElementById('antiguedad').value;
        const uso_servicio = document.getElementById('uso_servicio').value;
        const factura_promedio = document.getElementById('factura_promedio').value;
        const resultDiv = document.getElementById('prediction_result');

        // Normalizar los valores de entrada a un rango de 0-1
        const antiguedad_norm = (parseFloat(antiguedad) - 1) / (72 - 1);
        const uso_servicio_norm = parseFloat(uso_servicio) / 500;
        const factura_promedio_norm = (parseFloat(factura_promedio) - 10) / (200 - 10);

        // Fórmula básica para calcular la probabilidad de abandono
        let churnProbability = (
            (1 - antiguedad_norm) * 0.5 + // Clientes más nuevos, más probabilidad de abandono
            uso_servicio_norm * 0.2 + // Más uso, un poco más de probabilidad (ej. problemas de servicio)
            factura_promedio_norm * 0.3 // Factura más alta, más probabilidad
        );

        let probability = Math.max(0, Math.min(1, churnProbability)); // Asegura que esté entre 0 y 1
        probability = (probability * 100).toFixed(2);

        let message;
        let color = 'var(--text-primary)';
        if (probability > 80) {
            message = `¡ALTO RIESGO! Probabilidad de abandono: ${probability}%`;
            color = 'var(--color-red)';
        } else if (probability > 40) {
            message = `RIESGO MODERADO. Probabilidad de abandono: ${probability}%`;
            color = '#ffc107'; // Amarillo
        } else {
            message = `BAJO RIESGO. Probabilidad de abandono: ${probability}%`;
            color = 'var(--color-green)';
        }

        resultDiv.innerHTML = message;
        resultDiv.style.color = color;
    }

    // Ejecuta la predicción inicial al cargar
    document.addEventListener('DOMContentLoaded', simulatePrediction);

    // Asigna listeners a los campos de entrada para actualización dinámica
    document.getElementById('antiguedad').addEventListener('input', simulatePrediction);
    document.getElementById('uso_servicio').addEventListener('input', simulatePrediction);
    document.getElementById('factura_promedio').addEventListener('input', simulatePrediction);
    
    // Asigna listener al botón (redundante si ya es dinámico, pero puede servir como trigger manual)
    document.getElementById('predict_button').addEventListener('click', simulatePrediction);
