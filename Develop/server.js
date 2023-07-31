const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.port || 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for home page
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET Route for api page
app.get('/api/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/db/db.json'))
);

// POST route for adding notes
app.post('/api/notes', (req, res) => {
  const newNote = req.body;

  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading', err);
      return res.status(500).json({ error: 'Failed to read.' });
    }

    let notes = JSON.parse(data);
    newNote.id = Date.now().toString();
    notes.push(newNote);

    fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(notes), (err) => {
      if (err) {
        console.error('Error writing', err);
        return res.status(500).json({ error: 'Failed to save.' });
      }
      res.json(newNote);
    });
  });
});

// DELETE Route for deleting a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const idToDelete = req.params.id;

  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading', err);
      return res.status(500).json({ error: 'Failed to read.' });
    }

    let notes = JSON.parse(data);

    // Find the index of the note with the given ID
    const noteIndexToDelete = notes.findIndex((note) => note.id === idToDelete);

    if (noteIndexToDelete === -1) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    // Remove the note from the notes array
    notes.splice(noteIndexToDelete, 1);

    fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(notes), (err) => {
      if (err) {
        console.error('Error writing', err);
        return res.status(500).json({ error: 'Failed to delete.' });
      }
      res.json({ message: 'Note deleted.' });
    });
  });
});

// GET wildcard route
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
