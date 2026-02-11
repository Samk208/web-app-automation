const net = require('net');
const client = new net.Socket();
const host = '62.84.185.148';
const port = 5432;

console.log(`Connecting to ${host}:${port}...`);
client.setTimeout(5000); // 5s timeout

client.connect(port, host, function () {
    console.log('Connected! Port is open.');
    client.destroy();
});

client.on('error', function (err) {
    console.error('Connection failed:', err.message);
    const dns = require('dns');
    dns.lookup(host, (err, address) => {
        if (err) console.error('DNS Lookup failed:', err.code);
        else console.log('DNS resolved to:', address);
    });
});

client.on('timeout', () => {
    console.log('Connection timed out');
    client.destroy();
});
