const http = require('http');

http.get('http://localhost:3000/api/transactions', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    const parsed = JSON.parse(data);
    console.log("Returned txns:", parsed.length);
    if (parsed.length > 0) {
      console.log("First txn:", parsed[0]);
    }
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
