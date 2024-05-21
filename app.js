const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 使用 cors 和 body-parser 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 配置存储选项
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    const { filename, chunkNumber, totalChunks } = req.body;

    console.log('Received chunk:', { filename, chunkNumber, totalChunks });

    const uploadDir = path.join(__dirname, 'uploads');
    const uploadedChunks = fs.readdirSync(uploadDir)
        .filter(name => name.startsWith(filename))
        .length;

    if (uploadedChunks == totalChunks) {
        const filePath = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(filePath);

        for (let i = 0; i < totalChunks; i++) {
            const chunkPath = path.join(uploadDir, `${filename}.part${i}`);
            const data = fs.readFileSync(chunkPath);
            writeStream.write(data);
            fs.unlinkSync(chunkPath);
        }

        writeStream.end();
        writeStream.on('finish', () => {
            res.send('Upload complete');
        });
    } else {
        res.send('Chunk uploaded');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
