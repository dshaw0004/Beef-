// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // if you later host frontend separately, this helps
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/health', (req, res) => res.json({ ok: true, time: Date.now() }));

app.get('/api/items', async (req, res) => {
try {
const items = await db.listItems();
res.json(items);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to list items' });
}
});

app.post('/api/items', async (req, res) => {
try {
const { title, description } = req.body;
if (!title || title.trim() === '') {
return res.status(400).json({ error: 'title is required' });
}
const created = await db.createItem({ title: title.trim(), description: description || '' });
res.status(201).json(created);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to create item' });
}
});

app.put('/api/items/:id', async (req, res) => {
try {
const id = Number(req.params.id);
const { title, description } = req.body;
if (!title || title.trim() === '') {
return res.status(400).json({ error: 'title is required' });
}
const updated = await db.updateItem(id, { title: title.trim(), description: description || '' });
if (!updated) return res.status(404).json({ error: 'Item not found' });
res.json(updated);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to update item' });
}
});

app.delete('/api/items/:id', async (req, res) => {
try {
const id = Number(req.params.id);
const changes = await db.deleteItem(id);
if (!changes) return res.status(404).json({ error: 'Item not found' });
res.json({ deleted: true });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to delete item' });
}
});

// Fallback to index.html for SPA routes (if you add client-side routing later)
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start
(async () => {
try {
await db.init();
app.listen(PORT, () => {
console.log(Server running on http://localhost:${PORT});
});
} catch (err) {
console.error('Failed to initialize database', err);
process.exit(1);
}
})();
