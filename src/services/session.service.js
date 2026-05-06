import userService from './user.service.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { generateToken, verifyToken } from '../utils/jwt.js';

const isDuplicatedEmailError = (error) => {
  return error?.code === 11000 && (error?.keyPattern?.email || error?.keyValue?.email);
};

class SessionService {
  sanitizeUser(user) {
    if (!user) return null;

    const { password, ...safeUser } = user;
    return safeUser;
  }

  createTokenPayload(user) {
    return {
      id: user._id,
      email: user.email,
      role: user.role,
    };
  }

    // Registra un nuevo usuario
    async register (userData){
        // Validacion de campos obligatorios
        const {first_name, last_name, email, password} = userData;
        const normalizedEmail = email?.trim().toLowerCase();
        // Si faltan campos obligatorios, lanza error 400
        if(!first_name || !last_name || !normalizedEmail || !password) {
            const error = new Error ('Incomplete values');
            error.statusCode = 400;
            throw error;
        }
        // Valida si el email ya existe
        const existingUser = await userService.getUserByEmail(normalizedEmail);
        // Si el email ya existe, lanza error 400
        if(existingUser){
            const error = new Error ('User already exists');
            error.statusCode = 400;
            throw error;
        }
        // Crea el hash de la contraseña
        const hashedPassword = await createHash(password);
        let user;

        try {
            // Crea el usuario con el hash de la contraseña
            user = await userService.createUser({
                ...userData,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'user',
            });
        } catch (error) {
            if (isDuplicatedEmailError(error)) {
                const duplicatedError = new Error('User already exists');
                duplicatedError.statusCode = 400;
                throw duplicatedError;
            }

            throw error;
        }

        return this.sanitizeUser(user);
    }

    // Loguea un usuario existente
    async login (credentials) {
        const {email, password} = credentials;
        const normalizedEmail = email?.trim().toLowerCase();
        // Validacion de campos obligatorios
        if (!normalizedEmail || !password) {
            const error = new Error('Incomplete credentials Email and password are required');
            error.statusCode = 400;
            throw error;
        }
        // Busca el usuario por email
        const user = await userService.getUserByEmail(normalizedEmail);
        // Si no existe el usuario, lanza error 401
        if(!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        // Valida la contraseña
        const isPasswordValid = await isValidPassword(password, user.password);
        // Si la contraseña no es valida, lanza error 401
        if(!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Crea el token
        const token = generateToken(this.createTokenPayload(user));
        // Retorna el token y el usuario sanitizado
        return {
            token,
            user: this.sanitizeUser(user),   
        };
    }

    // Devuelve el usuario actual
    async current(token){
        // Si no hay token, lanza error 401
        if(!token) {
            const error = new Error( 'Token not provided');
            error.statusCode = 401;
            throw error;
        }
        let payload;
        try{
            payload = verifyToken(token);
        }
        catch(error){
            const authError = new Error ('Invalid token');
            authError.statusCode = 401;
            throw authError;
        }

        const user = await userService.getUserById(payload.id);

        if(!user){
            const error = new Error ( 'User not found');
            error.statusCode = 404;
            throw error;
        }
        return user;
    }



}

export default new SessionService();
