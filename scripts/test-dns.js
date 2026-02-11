const dns = require('dns');

const hosts = [
    'supabase.co',
    'ubtpfecsjecqtrtnyept.supabase.co',
    'aws-1-ap-south-1.pooler.supabase.com'
];

hosts.forEach(host => {
    dns.lookup(host, (err, address) => {
        if (err) console.log(`[${host}] Failed: ${err.code}`);
        else console.log(`[${host}] Resolved: ${address}`);
    });
});
