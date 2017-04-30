const spdy = require('spdy');
const fs = require('fs');
const express = require('express');

const app = express();

const options = {
  key: fs.readFileSync(__dirname + '/cert/private.key'),
  cert: fs.readFileSync(__dirname + '/cert/certificate.pem')
};

app.get('/data', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('NOT FROM PUSH');
});

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}
 
app.get('/', (req, res) => {
  const stream = res.push('/data', {
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'text/plain',
      'cache-control': 'max-age=3000'
    }
  });

  let pushErrored = false;

  stream.on('error', err => {
    pushErrored = true;
    console.log('Push error', err);
  });

  stream.on('data', chunk => {
    console.log('Push data', chunk);
  });

  stream.on('end', () => {
    console.log('Push end');
  });

  (async () => {
    for (let i = 0; i < 4; i++) {
      if (pushErrored) break;
      stream.write(Math.random().toString() + '\n');
      await wait(1000);
    }
    stream.end();
  })();

  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'no-store');
  res.send(`<!DOCTYPE html>
    <p><button>Fetch</button> <a href="/">Reload</a></p>
    <script>
      document.querySelector('button').onclick = () => {
        fetch('/data', {
          credentials: 'include'
        }).then(r => r.text()).then(text => console.log(text)).catch(err => console.log('failed', err));
      };
    </script>
  `);
});

const server = spdy.createServer(options, app);

server.listen(3001);