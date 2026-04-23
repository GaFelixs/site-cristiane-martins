const db = require('../config/db');

exports.toggle = async (req, res) => {
  const { photo_id } = req.body;
  const client_id = req.user.id;

  try {
    const [existing] = await db.query(
      'SELECT id FROM selections WHERE client_id = ? AND photo_id = ?',
      [client_id, photo_id]
    );

    if (existing.length > 0) {
      await db.query(
        'DELETE FROM selections WHERE client_id = ? AND photo_id = ?',
        [client_id, photo_id]
      );
      res.json({ selected: false });
    } else {
      await db.query(
        'INSERT INTO selections (client_id, photo_id) VALUES (?, ?)',
        [client_id, photo_id]
      );
      res.json({ selected: true });
    }
  } catch {
    res.status(500).json({ error: 'Erro ao salvar seleção' });
  }
};

exports.getByClient = async (req, res) => {
  const clientId = req.params.client_id;

  try {
    const [selections] = await db.query(
      `SELECT p.id, p.filename, p.created_at
       FROM selections s
       JOIN photos p ON s.photo_id = p.id
       WHERE s.client_id = ?
       ORDER BY p.created_at ASC`,
      [clientId]
    );

    res.json(selections);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar seleções' });
  }
};
