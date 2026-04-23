const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.upload = async (req, res) => {
  const { client_id, ensaio_id } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhuma foto enviada' });
  }

  try {
    const inserts = files.map(file => [ensaio_id, client_id, file.filename]);
    await db.query('INSERT INTO photos (ensaio_id, client_id, filename) VALUES ?', [inserts]);

    res.json({ message: `${files.length} foto(s) enviada(s) com sucesso` });
  } catch {
    res.status(500).json({ error: 'Erro ao salvar fotos' });
  }
};

exports.getByClient = async (req, res) => {
  const clientId = req.user.role === 'admin' ? req.params.client_id : req.user.id;

  try {
    const [photos] = await db.query(
      `SELECT p.*, s.selected
       FROM photos p
       LEFT JOIN selections s ON p.id = s.photo_id AND s.client_id = ?
       WHERE p.client_id = ?
       ORDER BY p.created_at DESC`,
      [clientId, clientId]
    );

    res.json(photos);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar fotos' });
  }
};

exports.deletePhoto = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT filename FROM photos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    const filePath = path.join(__dirname, '../../uploads', rows[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM photos WHERE id = ?', [id]);

    res.json({ message: 'Foto deletada com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar foto' });
  }
};
