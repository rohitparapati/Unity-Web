const { signupUser, loginUser, registerServiceProvider, forgotPassword, otherservices } = require('./controller');
const { User, ServiceProvider, Other } = require('./config');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { sendConfirmationEmail } = require('./confirmationmail');

jest.mock('./config', () => ({
    User: jest.fn(() => ({
        save: jest.fn()
    })),
    ServiceProvider: jest.fn(() => ({
        save: jest.fn()
    })),
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

    describe('signupUser', () => {
        it('should create a new user successfully', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    email: 'testuser@example.com',
                    password: 'password123'
                }
            };
            const res = {
                send: jest.fn()
            };
    
            User.findOne = jest.fn().mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedpassword');
            const saveMock = jest.fn().mockResolvedValue({});
            User.mockImplementation(() => ({
                save: saveMock
            }));
    
            await signupUser(req, res);
    
            expect(User.findOne).toHaveBeenCalledWith({ email: 'testuser@example.com' });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(saveMock).toHaveBeenCalled();
            expect(sendConfirmationEmail).toHaveBeenCalledWith('testuser@example.com', 'testuser');
            expect(res.send).toHaveBeenCalledWith("<script>alert('User created successfully, you can now login.'); window.location='/';</script>");
        });
    
        it('should return 409 if email already in use', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    email: 'testuser@example.com',
                    password: 'password123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            User.findOne = jest.fn().mockResolvedValue({ email: 'testuser@example.com' });
    
            await signupUser(req, res);
    
            expect(User.findOne).toHaveBeenCalledWith({ email: 'testuser@example.com' });
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.send).toHaveBeenCalledWith("Email already in use. Please choose a different email.");
        });
    
        it('should return 500 if password hashing fails', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    email: 'testuser@example.com',
                    password: 'password123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            User.findOne = jest.fn().mockResolvedValue(null);
            bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));
    
            await signupUser(req, res);
    
            expect(User.findOne).toHaveBeenCalledWith({ email: 'testuser@example.com' });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("An error occurred while creating your account.");
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
            const saveMock = jest.fn().mockResolvedValue({});
            ServiceProvider.mockImplementation(() => ({
                save: saveMock
            }));
    
            await registerServiceProvider(req, res);
    
            expect(ServiceProvider.findOne).toHaveBeenCalledWith({ email: 'serviceprovider@example.com' });
            expect(saveMock).toHaveBeenCalled();
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
            const saveMock = jest.fn().mockRejectedValue(new Error('Database save failed'));
            ServiceProvider.mockImplementation(() => ({
                save: saveMock
            }));
    
            await registerServiceProvider(req, res);
    
            expect(ServiceProvider.findOne).toHaveBeenCalledWith({ email: 'serviceprovider@example.com' });
            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("An error occurred while registering the service provider.");
        });
    });
});