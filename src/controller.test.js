const {loginUser } = require('./controller');
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
    
    
});
