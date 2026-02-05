const dns = require('dns');
const fs = require('fs');

try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('Using Google DNS...');
} catch (e) { }

const hostname = 'clusterfsd.pm9uodc.mongodb.net';

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
    if (err) {
        console.error('SRV Resolve Error:', err.code);
        process.exit(1);
    } else {
        const connectionString = 'mongodb://Neelesh:28122005@' + addresses.map(a => `${a.name}:${a.port}`).join(',') + '/scms?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=ClusterFSD';
        fs.writeFileSync('resolved_string.txt', connectionString);
        console.log('SUCCESS: Connection string written to resolved_string.txt');
        process.exit(0);
    }
});
