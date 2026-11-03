const authService = require('./auth.service');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

class AuthController {
    async register(req, res, next) {
        try {
            const { name, username, password, role, phone } = req.body;
            const { user, token } = await authService.register({ name, username, password, role, phone });

            res.cookie('token', token, cookieOptions);
            res.json({
                success: true,
                message: 'Account registered successfully',
                role: user.role,
                user,
                token
            });
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const { user, token } = await authService.login({ username, password });

            res.cookie('token', token, cookieOptions);
            res.json({
                success: true,
                message: 'Authentication successful',
                role: user.role,
                user,
                token
            });
        } catch (err) {
            next(err);
        }
    }

    async me(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }
            const user = await authService.getProfile(req.user.userId);
            res.json({
                success: true,
                user
            });
        } catch (err) {
            next(err);
        }
    }

    async logout(req, res) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.json({
            success: true,
            message: 'Session closed successfully'
        });
    }
}

module.exports = new AuthController();
