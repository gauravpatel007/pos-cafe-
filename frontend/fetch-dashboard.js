const http = require('http');

http.get('http://localhost:3000/api/reports/dashboard', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Body:", JSON.parse(data));
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
