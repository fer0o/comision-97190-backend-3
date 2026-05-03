import sessionService from '../services/session.service.js';

const handleSessionError = (error, res) => {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500
        ? 'Internal server error'
        : error.message;

    res.status(statusCode).json({
        status: 'error',
        message,
    })
};

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')){ 
        return authHeader.split(' ')[1];
    }
    return req.cookies?.token;
};


export const register = async (req, res) => {
    try{
        const user = await sessionService.register(req.body);

        res.status(201).json({
            status: 'success',
            payload: user,

        });
    } catch (error) {
        handleSessionError(error, res);
    };
};

export const login = async (req, res) => {
    try{
        const payload = await sessionService.login(req.body);

        res.cookie ('token', payload.token,{
            httpOnly: true,
            maxAge: 60 * 60 * 1000, // 1 hora
        });

        res.status(200).json({
            status: 'success',
            payload,
        });
    } catch (error){
        handleSessionError(error, res);
    };
};

export const current = async (req, res) =>{
    try{
        const token = getTokenFromRequest(req);
        const user = await sessionService.current(token);
        
        res.status(200).json({
            status: 'success',
            payload: user,
        });
    }
    catch (error){
        handleSessionError(error, res);
    }
};
