const http = require('http');

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World!');
});

const PORT = 5001;
server.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
