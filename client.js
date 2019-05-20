const net = require('net');

let socket = net.createConnection({port: 5000}, () => {
    console.log('Connected');
});

socket.setEncoding('utf8');

socket.on("data", (data) => {
    console.log(data);
});
socket.on('end', () => {
    console.log('Server disconnected.');
    socket.end();
});
socket.on('error', (err) => {
    console.log('An error occurred.');
    socket.end();
    throw(err);
});

const userInput = process.stdin;
userInput.setEncoding('utf8');
userInput.on('data', (data) => {
    socket.write(data);
});