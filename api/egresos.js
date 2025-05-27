async function cargarEgresosPorFecha(fecha) {
  try {
    const res = await fetch(`/api/egresos?fecha=${fecha}`);
    const data = await res.json();
    egresos = data || [];
    renderEgresos();
    calcularTotalDepositar();
  } catch (error) {
    console.error('Error al cargar egresos:', error);
  }
}

async function guardarEgresoServidor(egreso, fecha) {
  try {
    await fetch('/api/egresos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...egreso, fecha }),
    });
  } catch (error) {
    console.error('Error al guardar egreso:', error);
  }
}
