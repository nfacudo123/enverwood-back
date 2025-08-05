const {
  crearTiempoRetiro,
  listarTiempoRetiro,
  editarTiempoRetiro,
  eliminarTiempoRetiro
} = require('../services/tiempoRetiro.service');

const crear = async (req, res) => {
  try {
    const nuevo = await crearTiempoRetiro(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('❌ Error al crear tiempo de retiro:', err);
    res.status(500).json({ error: 'Error al crear tiempo de retiro' });
  }
};

const listar = async (_req, res) => {
  try {
    const lista = await listarTiempoRetiro();
    res.json(lista);
  } catch (err) {
    console.error('❌ Error al listar tiempos de retiro:', err);
    res.status(500).json({ error: 'Error al listar tiempos' });
  }
};

const editar = async (req, res) => {
  try {
    const actualizado = await editarTiempoRetiro(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    console.error('❌ Error al editar tiempo de retiro:', err);
    res.status(500).json({ error: 'Error al editar' });
  }
};

const eliminar = async (req, res) => {
  try {
    const eliminado = await eliminarTiempoRetiro(req.params.id);
    res.json({ message: 'Eliminado correctamente', eliminado });
  } catch (err) {
    console.error('❌ Error al eliminar tiempo de retiro:', err);
    res.status(500).json({ error: 'Error al eliminar' });
  }
};

module.exports = { crear, listar, editar, eliminar };
