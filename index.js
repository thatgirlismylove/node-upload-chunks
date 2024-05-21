// 断点续传的后端 node 实现
const express = require('express');
const multer = require('multer');
const cors = require('cors')

const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors()) // 允许跨域

// 配置存储选项
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 如果没有 uplaods 文件夹，则创建文件夹
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    }
});

const upload = multer({ storage });

// 解析 JSON 和 URL 编码数据
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 处理文件上传
app.post('/upload', upload.single('file'), (req, res) => {
    const { filename, chunkNumber, totalChunks } = req.body;
    if (!filename || chunkNumber === undefined || totalChunks === undefined) {
        return res.status(400).send('Filename, chunkNumber or totalChunks is missing');
    }

    const tempFilePath = path.join(__dirname, 'uploads', `${filename}.part${chunkNumber}`);
     // 在将磁盘中上传的 原生 chunk 名称更改为 filename.part0
     // xxxx 变更为 xxx.part0
    fs.renameSync(req.file.path, tempFilePath);

    // 合并文件逻辑
    if (Number(chunkNumber) + 1 === Number(totalChunks)) {
        const finalFilePath = path.join(__dirname, 'uploads', filename);
        const writeStream = fs.createWriteStream(finalFilePath);
        for (let i = 0; i < totalChunks; i++) {
            const chunkPath = path.join(__dirname, 'uploads', `${filename}.part${i}`);
            const data = fs.readFileSync(chunkPath); // 读取 chunk 文件
            writeStream.write(data);
            fs.unlinkSync(chunkPath); // 逐一删除 chunk 文件
        }
        writeStream.end();
    }

    res.send('Chunk uploaded successfully');
});

const PORT = 9000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});