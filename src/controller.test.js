const {loginUser ,registerServiceProvider} = require('./controller');
const { User, ServiceProvider, Other } = require('./config');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

jest.mock('./config', () => ({
    User: function () { return { save: jest.fn() } }, // Mocking the save method
    ServiceProvider: jest.fn(),
    Other: {
        find: jest.fn(),
        distinct: jest.fn()
    }
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

jest.mock('./confirmationmail', () => ({
    sendConfirmationEmail: jest.fn()
}));

jest.mock('nodemailer', () => ({
    createTransport: () => ({
        sendMail: jest.fn()
    })
}));

describe('Controller', () => {
    let transporter;
    beforeEach(() => {
        jest.clearAllMocks();
        transporter = require('nodemailer').createTransport();
    });

    describe('loginUser', () => {
        it('should log in a user successfully', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    password: 'password123'
                }
            };
            const res = {
                render: jest.fn(),
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            User.findOne = jest.fn().mockResolvedValue({ name: 'testuser', password: 'hashedpassword' });
            bcrypt.compare.mockResolvedValue(true);
    
            await loginUser(req, res);
    
            expect(User.findOne).toHaveBeenCalledWith({ name: 'testuser' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(res.render).toHaveBeenCalledWith('home');
        });
    
        it('should return 404 if username not found', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    password: 'password123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            User.findOne = jest.fn().mockResolvedValue(null);
    
            await loginUser(req, res);
    
            expect(User.findOne).toHaveBeenCalledWith({ name: 'testuser' });
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith("<script>alert('Username not found. Please try again.'); window.location='/login';</script>");
        });
    
        it('should return 401 if password is incorrect', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    password: 'password123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            User.findOne = jest.fn().mockResolvedValue({ name: 'testuser', password: 'hashedpassword' });
            bcrypt.compare.mockResolvedValue(false);
    
            await loginUser(req, res);
    
            expect(User.findOne).toHaveBeenCalledWith({ name: 'testuser' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith("<script>alert('Password is incorrect. Please try again.'); window.location='/login';</script>");
        });
    });
    describe('registerServiceProvider', () => {
        it('should register a new service provider successfully', async () => {
            const req = {
                body: {
                    businessname: 'Test Business',
                    email: 'serviceprovider@example.com',
                    typeofservice: 'plumbing',
                    availability: '9am-5pm',
                    location: 'Test Location',
                    contact: '1234567890',
                    experience: 5
                }
            };
            const res = {
                send: jest.fn(),
                status: jest.fn().mockReturnThis()
            };
    
            ServiceProvider.findOne = jest.fn().mockResolvedValue(null);
            ServiceProvider.prototype.save = jest.fn().mockResolvedValue({});
    
            await registerServiceProvider(req, res);
    
            expect(ServiceProvider.findOne).toHaveBeenCalledWith({ email: 'serviceprovider@example.com' });
            expect(ServiceProvider.prototype.save).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith("<script>alert('Registered successfully'); window.location='/login';</script>");
        });
    
        it('should return 409 if email already in use', async () => {
            const req = {
                body: {
                    businessname: 'Test Business',
                    email: 'serviceprovider@example.com',
                    typeofservice: 'plumbing',
                    availability: '9am-5pm',
                    location: 'Test Location',
                    contact: '1234567890',
                    experience: 5
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            ServiceProvider.findOne = jest.fn().mockResolvedValue({ email: 'serviceprovider@example.com' });
    
            await registerServiceProvider(req, res);
    
            expect(ServiceProvider.findOne).toHaveBeenCalledWith({ email: 'serviceprovider@example.com' });
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.send).toHaveBeenCalledWith("Email already in use. Please choose a different email.");
        });
    
        it('should return 500 if saving service provider to database fails', async () => {
            const req = {
                body: {
                    businessname: 'Test Business',
                    email: 'serviceprovider@example.com',
                    typeofservice: 'plumbing',
                    availability: '9am-5pm',
                    location: 'Test Location',
                    contact: '1234567890',
                    experience: 5
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            ServiceProvider.findOne = jest.fn().mockResolvedValue(null);
            ServiceProvider.prototype.save = jest.fn().mockRejectedValue(new Error('Database save failed'));
    
            await registerServiceProvider(req, res);
    
            expect(ServiceProvider.findOne).toHaveBeenCalledWith({ email: 'serviceprovider@example.com' });
            expect(ServiceProvider.prototype.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("An error occurred while registering the service provider.");
        });
    });
    
    
});
