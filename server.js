// 普通的单文件上传
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

const app = express()

const PORT = 3000

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        // 解决中文乱码问题
        file.originalname = Buffer.from(file.originalname, "latin1").toString(
            "utf8"
        );
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

app.post('/upload', upload.single('file'), (req, res) => {
    res.send('File uploaded successfully')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})