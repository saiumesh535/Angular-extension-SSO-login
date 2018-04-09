const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const app = express();

const credentials = {
  client: {
    id: process.env.APP_ID,
    secret: process.env.APP_PASSWORD,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};

const oauth2 = require('simple-oauth2').create(credentials);

function getAuthUrl(chromeExtentionURI) {
  const returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES,
    state: chromeExtentionURI,
  });
  console.log(`Generated auth url: ${returnVal}`);
  return returnVal;
}

async function getTokenFromCode(auth_code) {
  console.log("code is ", auth_code);
  let result = await oauth2.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: process.env.REDIRECT_URI,
    scope: 'openid profile'
  });
  console.log("result is ",result);
  const token = oauth2.accessToken.create(result);
  console.log("token is ",token)
  return token.token.id_token;
}

app.get('/login', (req,res) => {
  /* let's create redirect URL for third party login */
  console.log("hey!", req.query.redirectURI);
  return res.redirect(getAuthUrl(req.query.redirectURI));
})

app.get('/authorize', async (req,res) => {
  // Get auth code
  const code = req.query.code;
  // If code is present, use it
  if (code) {
    let token;
    let details;

    try {
      token = await getTokenFromCode(code);
      details = await jwt.decode(token);
      console.log(`${req.query.state}?email=${details.name}`);
      return res.redirect(`${req.query.state}?token=${details.code}`)
      return res.send(details.name);
      
    } catch (error) {
      res.render({error: { title: 'Error', message: 'Error exchanging code for token', error: error }});
    }
  } else {
    // Otherwise complain
    res.json({error: 'missing code'});
  }
})

http.createServer(app).listen(3000, () => {
  console.log('hey!');
})