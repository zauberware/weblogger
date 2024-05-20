const fs = require('fs');
const readline = require('readline');
const readLastLines = require('read-last-lines');

const watchFile = (filePath, type, ws) => {
  let lastPosition = 0;
  const startWatching = () => {
    let buffer = '';
    let timeout = null;
    if (buffer.length < 1) {
      readLastLines
        .read(filePath, 1000)
        .then((lines) => {
          buffer = lines;
          lastPosition = fs.statSync(filePath).size;
          ws.send(JSON.stringify({ type, message: buffer }));
        })
        .catch((err) => {
          console.error(`Error reading file ${filePath}: ${err}`);
        });
    }
    try {
      fs.watch(filePath, (eventType, filename) => {
        if (eventType === 'change') {
          if (timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(() => {
            const rl = readline.createInterface({
              input: fs.createReadStream(filePath, { start: lastPosition }),
            });

            rl.on('line', (line) => {
              lastPosition += Buffer.byteLength(line, 'utf8') + 1; // +1 for the newline character
              ws.send(JSON.stringify({ type, message: line }));
            });

            rl.on('error', (err) => {
              console.error(`Error reading file ${filePath}: ${err}`);
            });
          }, 100); // delay of 100 milliseconds to avoid multiple events
        }
      });
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(`File ${filePath} does not exist. Retrying...`);
        setTimeout(startWatching, 1000); // Retry after 1 second if file does not exist because it will be created by fs.open call
      } else {
        throw err;
      }
    }
  };

  fs.open(filePath, 'a', (err, fd) => {
    if (err) throw err;
    fs.close(fd, (err) => {
      if (err) throw err;
      startWatching();
    });
  });
};

module.exports = watchFile;
