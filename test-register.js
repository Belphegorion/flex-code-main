const testData = {
  name: "Test User",
  email: "test@example.com",
  phone: "+1234567890",
  password: "Test123!",
  role: "worker"
};

fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
