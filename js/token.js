async function getToken() {
    try {
        const response = await fetch('http://localhost:8080/Web/Services/index.php/Authentication/Authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": "user", "password": "password" })
        });

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching token:', error);
    }
}

getToken();
