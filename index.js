const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const app = express();

app.listen(3000, () => {
    console.log('Access via localhost');
    console.log('Listening to port 3000');
});

app.use(express.static('public/css'));
app.use(express.static('public/html'));
app.use(bodyParser.urlencoded({ extended: true}));

app.post('/chat', (req, res) => {
    if (req.body.name && req.body.message) {
        const line = `${req.body.name};${req.body.message}\n`;

        fs.appendFile('public/data/chat.csv', line, 'utf8', (err) => {
            if (err) throw err;
            console.log('@file chat.csv: new data added.');

            fs.readFile(`public/html/chat_confirm.html`, 'utf8', (err, data) => {
                if (err) throw err;
                res.send(data);
            });
        });
    }
});

app.get('/chat', (req, res) => {
    const page = fs.readFileSync('public/html/chat.html', 'utf8');
    const chat = fs.readFileSync('public/data/chat.csv', 'utf8');
    let chatHtml = '';

    for (const line of chat.split('\n')) {
        if (line) {
            const linePart = line.split(';');

            chatHtml += `<div><h3>${linePart[0]}</h3><p>${linePart[1]}</p></div>`;
        }
    }

    res.send(page.replace('<!--placeholder-->', chatHtml));
});

app.get('/chat/:id', (req, res) => {
    fs.readFile('public/data/chat.csv', 'utf8', (err, data) => {
       if (err) {
           res.status(404).send('Sorry no messages stored.');
       } else {
           const lines = data.split('\n');

           if (req.params.id > 0 && req.params.id <= lines.length) {
               const line = lines[req.params.id-1];
               const elements = line.split(';');

               if (elements[1] !== undefined) {
                   const obj = {name: elements[0], age: elements[1]};
                   res.send(JSON.stringify(obj));
               } else {
                   const obj = {error: 'empty message' };
                   res.send(JSON.stringify(obj));
               }
           } else {
               res.send('error');
           }
       }
    });
});
