const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { adminMiddleware } = require('../middleware/auth');

router.get('/clientes', adminMiddleware, async (req, res) => {
  try {
    const [clients] = await db.query(
      'SELECT id, nome, email, created_at FROM users WHERE role = "client" ORDER BY nome'
    );
    res.json(clients);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

router.post('/clientes', adminMiddleware, async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    await db.query(
      'INSERT INTO users (nome, email, senha, role) VALUES (?, ?, ?, "client")',
      [nome, email, hash]
    );
    res.status(201).json({ message: 'Cliente criado com sucesso' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

router.get('/ensaios/:client_id', adminMiddleware, async (req, res) => {
  try {
    const [ensaios] = await db.query(
      'SELECT * FROM ensaios WHERE client_id = ? ORDER BY created_at DESC',
      [req.params.client_id]
    );
    res.json(ensaios);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar ensaios' });
  }
});

router.post('/ensaios', adminMiddleware, async (req, res) => {
  const { client_id, titulo } = req.body;

  if (!client_id || !titulo) {
    return res.status(400).json({ error: 'Cliente e título são obrigatórios' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO ensaios (client_id, titulo) VALUES (?, ?)',
      [client_id, titulo]
    );
    res.status(201).json({ id: result.insertId, message: 'Ensaio criado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao criar ensaio' });
  }
});

module.exports = router;
