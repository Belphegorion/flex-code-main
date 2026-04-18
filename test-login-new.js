const loginData = {
  email: "test1771438275115@example.com",
  password: "Test123!"
};

console.log('Testing login with:', loginData.email);

fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
})
.then(res => res.json())
.then(data => {
  console.log('Login Response:', data);
  if (data.accessToken) {
    console.log('✅ SUCCESS: User logged in and received tokens');
  } else {
    console.log('❌ FAILED:', data.message);
  }
})
.catch(err => console.error('Error:', err));
