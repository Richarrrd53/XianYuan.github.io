const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const multer = require('multer');
const hostname = '127.0.0.1';
const port = 3000;
const moment = require('moment'); 
const SocketServer = require('ws').Server;
const storage = multer.diskStorage({
  destination: './public/data/marquee_img_input', // 相對路徑，相對於伺服器程式碼
  filename: function (req, file, cb) {
    // 產生唯一檔案名稱，避免重複
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.post('/uploadFromDevice', upload.single('image'), (req, res) => {
  if (!req.file) {
      return res.json({ success: false, message: '沒有選擇檔案' });
  }

  console.log('檔案已儲存：', req.file.path);
  res.json({ success: true, message: '檔案上傳成功', filename: req.file.filename });
});

app.post('/uploadFromDeviceText', upload.single('text'), (req, res) => {
  if (!req.file) {
      return res.json({ success: false, message: '沒有選擇檔案' });
  }

  console.log('檔案已儲存：', req.file.path);
  res.json({ success: true, message: '檔案上傳成功', filename: req.file.filename });
});

// 新增刪除檔案的路由
app.delete('/deleteImage/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/data/marquee_img_input', filename);

  console.log("嘗試刪除檔案:", filePath); // 輸出完整路徑

  if (!fs.existsSync(filePath)) {
      console.error("檔案不存在:", filePath);
      return res.status(404).json({ success: false, message: '找不到檔案' }); // 回傳 404 Not Found
  }

  fs.unlink(filePath, (err) => {
      if (err) {
          console.error('刪除檔案錯誤:', err);
          return res.status(500).json({ success: false, message: '刪除檔案失敗：' + err.message });
      }
      console.log(`檔案 ${filename} 已成功刪除`);
      res.json({ success: true, message: '檔案刪除成功' });
  });
});

app.delete('/deleteText/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/data', filename);

  console.log("嘗試刪除檔案:", filePath); // 輸出完整路徑

  if (!fs.existsSync(filePath)) {
      console.error("檔案不存在:", filePath);
      return res.status(404).json({ success: false, message: '找不到檔案' }); // 回傳 404 Not Found
  }

  fs.unlink(filePath, (err) => {
      if (err) {
          console.error('刪除檔案錯誤:', err);
          return res.status(500).json({ success: false, message: '刪除檔案失敗：' + err.message });
      }
      console.log(`檔案 ${filename} 已成功刪除`);
      res.json({ success: true, message: '檔案刪除成功' });
  });
});


// 設定靜態檔案目錄
app.use(express.static(path.join(__dirname, 'public')));

// 設定根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.use(express.json());

app.get('/get-image-list', (req, res) => {
  const imageDir = path.join(__dirname, 'public/data/marquee_img_input'); // 圖片資料夾路徑
  fs.readdir(imageDir, (err, files) => {
      if (err) {
          console.error('讀取圖片資料夾錯誤:', err);
          return res.status(500).json({ error: '無法讀取圖片列表' });
      }

      const imageFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext); // 過濾圖片檔案
      });

      res.json({ images: imageFiles });
  });
});

app.get('/getImageInfo', async (req, res) => {
  const imageName = req.query.imageName;
  const filePath = './public/data/marquee_img_input/'+imageName;

  try {
    const stats = await fs.promises.stat(filePath);
    res.json({
        size: stats.size,
        createdDate: stats.birthtime.toISOString()
    });
} catch (error) {
    console.error(error);
    res.status(500).send('Error fetching image info');
}
});

app.get('/get-marquee-data', (req, res) => {
  const filePath = './public/data/marquee_table_number.txt';
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error("Error reading file:", err);
          return res.status(500).send('Error reading file');
      }
      res.send(data);
  });
});

app.get('/get-marquee-color', (req, res) => {
  const filePath = './public/data/marquee_color_code.txt';
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error("Error reading file:", err);
          return res.status(500).send('Error reading file');
      }
      res.send(data);
  });
});

app.get('/get-image-data', (req, res) => {
  const filePath = './public/data/marquee_img_index.txt';
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error("Error reading file:", err);
          return res.status(500).send('Error reading file');
      }
      res.send(data);
  });
});

app.post('/save-marquee-data', (req, res) => {
    const newText = req.body.data;
    fs.chmod('./public/data/marquee_table_number.txt',0o777, (err) => {
      if (err) throw err;
    //console.log('File permissions changed successfully.');
});
    fs.writeFile('./public/data/marquee_table_number.txt', newText, (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Error updating file: ' + err.message);
        } else {
            res.send('寫入成功');
        }
    });
    
});

app.post('/save-marquee-color', (req, res) => {
  const newText = req.body.data;
  fs.chmod('./public/data/marquee_color_code.txt',0o777, (err) => {
    if (err) throw err;
  //console.log('File permissions changed successfully.');
});
  fs.writeFile('./public/data/marquee_color_code.txt', newText, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send('Error updating file: ' + err.message);
      } else {
          res.send('寫入成功');
      }
  });
  
});

app.post('/save-image-data', (req, res) => {
  const newText = req.body.data;
  fs.chmod('./public/data/marquee_img_index.txt',0o777, (err) => {
    if (err) throw err;
  //console.log('File permissions changed successfully.');
});
  fs.writeFile('./public/data/marquee_img_index.txt', newText, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send('Error updating file: ' + err.message);
      } else {
          res.send('寫入成功');
      }
  });
  
});

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Server running at http://${hostname}:${port}/`);
});

//將 express 交給 SocketServer 開啟 WebSocket 的服務
const wss = new SocketServer({ server })
//當有 client 連線成功時
wss.on('connection', ws => {
  console.log('Client connected');
  // 當收到client消息時
  ws.on('message', data => {
    // 收回來是 Buffer 格式、需轉成字串
    data = data.toString();
    console.log(data); // 可在 terminal 看收到的訊息

    /// 發送消息給client 
    ws.send(data);

    /// 發送給所有client： 
    let clients = wss.clients  //取得所有連接中的 client
    clients.forEach(client => {
        client.send(data);  // 發送至每個 client
    });
  });
  // 當連線關閉
  ws.on('close', () => {
    console.log('Connection closed. Reconnecting...');
  });
})