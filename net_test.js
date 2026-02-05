const net = require('net');

const hosts = [
    'clusterfsd-shard-00-00.pm9uodc.mongodb.net',
    'clusterfsd-shard-00-01.pm9uodc.mongodb.net',
    'clusterfsd-shard-00-02.pm9uodc.mongodb.net'
];
const port = 27017;

hosts.forEach(host => {
    const socket = new net.Socket();
    console.log(`Checking connection to ${host}:${port}...`);

    socket.setTimeout(5000);

    socket.connect(port, host, () => {
        console.log(`SUCCESS: Connected to ${host}`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`FAILED: ${host} - ${err.message}`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`TIMEOUT: ${host}`);
        socket.destroy();
    });
});
