const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables for JWT secret
dotenv.config();

// We mount the router instead of the whole app to avoid starting the cron daemon in tests
const app = express();
app.use(express.json());
app.use('/api/users', require('../routes/users'));
app.use(express.json());
app.use('/api/users', require('../routes/users'));

describe('User Authentication API Endpoints', () => {

    // Setup connection to a local test database before starting tests
    beforeAll(async () => {
        // Generate an isolated environment
        const testUri = 'mongodb://localhost:27017/warranty-tracker-test';
        await mongoose.connect(testUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    // Drop exactly the test database after each test run to keep them clean
    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    });

    // Disconnect cleanly so Jest doesn't hang
    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    let validToken = '';

    // 1. Registration Test
    it('should successfully register a new user', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                name: 'Test Setup User',
                email: 'jest.test@example.com',
                password: 'Password123!',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('email', 'jest.test@example.com');
    });

    // 2. Login Test
    it('should authenticate the user and return a JWT', async () => {
        // Register first
        await request(app).post('/api/users/register').send({
            name: 'Test Setup User',
            email: 'jest.test@example.com',
            password: 'Password123!',
        });

        // Login
        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: 'jest.test@example.com',
                password: 'Password123!',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
        validToken = response.body.token; // Save for next step
    });

    // 3. Profile Fetch Test
    it('should fetch the profile details using a valid JWT', async () => {
        // First, register and get token manually to make this test completely independent
        const registerResponse = await request(app).post('/api/users/register').send({
            name: 'Profile Fetcher',
            email: 'profile.test@example.com',
            password: 'Password123!',
        });

        const token = registerResponse.body.token;

        // Fetch profile using Bearer Auth
        const response = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Profile Fetcher');
        expect(response.body).toHaveProperty('email', 'profile.test@example.com');
    });

});
