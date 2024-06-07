document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: '2bhsgufb74q393d610m3bi7t5d',
            code: code,
            redirect_uri: 'http://localhost:3000/callback'
        });

        axios.post('https://fit5225-pixtag43.auth.us-east-1.amazoncognito.com/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(response => {
            const { id_token } = response.data;
            document.cookie = `id_token=${id_token}; path=/;`;
            window.location.href = '/dashboard.html';
        }).catch(error => {
            console.error('Error during token exchange:', error.response ? error.response.data : error.message);
            alert('Authentication failed. Please try again.');
        });
    }
});
