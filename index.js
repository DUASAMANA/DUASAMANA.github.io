const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const sharp = require('sharp');

const app = express();
const port = 3000;

// Set up storage with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .jpeg, .jpg and .png files are allowed!'));
        }
    }
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Use file-based SQLite database
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS wishes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, wish TEXT, image_path TEXT)");
});

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { name, wish } = req.body;
        const imagePath = `uploads/${req.file.filename}`;
        const resizedImagePath = `uploads/resized-${req.file.filename}`;

        // Resize image
        await sharp(req.file.path)
            .resize({  width: 300, height: 300})
            .toFile(resizedImagePath);

        // Save wish to the database
        db.run('INSERT INTO wishes (name, wish, image_path) VALUES (?, ?, ?)', [name, wish, resizedImagePath], function (err) {
            if (err) {
                return res.status(500).send('Failed to save wish');
            }
            res.status(200).send('Wish uploaded successfully');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to upload wish');
    }
});

app.get('/wishes', (req, res) => {
    db.all('SELECT * FROM wishes', [], (err, rows) => {
        if (err) {
            return res.status(500).send('Failed to retrieve wishes');
        }
        res.json(rows);
    });
});

app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM wishes WHERE id = ?', id, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Failed to delete wish.');
            return;
        }
        res.status(200).send('Wish deleted successfully.');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
