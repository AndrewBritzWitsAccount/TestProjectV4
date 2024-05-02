const request = require('supertest');
const app = require('../index');

test('GET / should respond with login page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toEqual(200);
    expect(res.text).toContain('loginPage.html');
});

test('POST /login should log in with correct password', async () => {
    const res = await request(app)
        .post('/login')
        .send({ displayName: 'testUser', password: 'brokenTelephone' });
    expect(res.status).toEqual(302); // Redirect status
    expect(res.header['location']).toEqual('/game');
});

test('POST /login should reject login with incorrect password', async () => {
    const res = await request(app)
        .post('/login')
        .send({ displayName: 'testUser', password: 'wrongPassword' });
    expect(res.status).toEqual(200);
    expect(res.text).toContain('Incorrect password');
});

test('GET /game should respond with game page if logged in', async () => {
    // Simulate a login request to set up the session
    await request(app)
        .post('/login')
        .send({ displayName: 'testUser', password: 'brokenTelephone' });

    // Send a GET request to the /game route
    const res = await agent.get('/game');

    // Assert that the response status code is 200 (OK)
    expect(res.status).toEqual(200);

    // Assert that the response body contains 'gamePage'
    expect(res.text).toContain('gamePage');
});


test('GET /game should redirect to login page if not logged in', async () => {
    const res = await request(app).get('/game');
    expect(res.status).toEqual(302); // Redirect status
    expect(res.header['location']).toEqual('/');
});
