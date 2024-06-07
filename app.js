const express = require('express');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.static('public'));

app.use('/api', createProxyMiddleware({
    target: 'https://hc2ynd7hpb.execute-api.us-east-1.amazonaws.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/dev'  // Ensure this matches your API path
    }
}));

app.use('/delete-api', createProxyMiddleware({
    target: 'https://7eygjd65b8.execute-api.us-east-1.amazonaws.com',
    changeOrigin: true,
    pathRewrite: {
        '^/delete-api': '/dev'  // Ensure this matches your API path
    }
}));

app.get('/login', (req, res) => {
    res.redirect(`https://fit5225-pixtag43.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=2bhsgufb74q393d610m3bi7t5d&redirect_uri=http://localhost:3000/callback`);
});

app.get('/signup', (req, res) => {
    res.redirect(`https://fit5225-pixtag43.auth.us-east-1.amazoncognito.com/signup?response_type=code&client_id=2bhsgufb74q393d610m3bi7t5d&redirect_uri=http://localhost:3000/callback`);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: '2bhsgufb74q393d610m3bi7t5d',
        code: code,
        redirect_uri: 'http://localhost:3000/callback'
    });

    try {
        const response = await axios.post(
            'https://fit5225-pixtag43.auth.us-east-1.amazoncognito.com/oauth2/token',
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { id_token } = response.data;
        res.cookie('id_token', id_token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during token exchange:', error.response ? error.response.data : error.message);
        res.send('Authentication failed. Please try again.');
    }
});

app.get('/dashboard', (req, res) => {
    const idToken = req.cookies.id_token;
    if (idToken) {
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        res.redirect('/signup');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('id_token');
    res.redirect(`https://fit5225-pixtag43.auth.us-east-1.amazoncognito.com/logout?client_id=2bhsgufb74q393d610m3bi7t5d&logout_uri=http://localhost:3000`);
});

app.get('/', (req, res) => {
    const idToken = req.cookies.id_token;
    if (idToken) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(__dirname + '/public/index.html');
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
