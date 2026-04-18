const testData = {
  name: "New Test User",
  email: `test${Date.now()}@example.com`,
  phone: "+1234567890",
  password: "Test123!",
  role: "worker"
};

console.log('Testing registration with:', testData.email);

fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => {
  console.log('Registration Response:', data);
  if (data.accessToken) {
    console.log('✅ SUCCESS: User registered and received tokens');
  } else {
    console.log('❌ FAILED:', data.message);
  }
})
.catch(err => console.error('Error:', err));
