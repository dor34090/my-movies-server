import { query } from "../../db";

export class UserService {
    constructor() {}

    public async getUserById(id: number) {
        return await query('SELECT * FROM users WHERE id = $1', [id])
    }

    public async getUserByUsername(username: string) {
        return await query('SELECT * FROM users WHERE username = $1', [username])
    }

    public async addUser(username: string) {
        const existingUser = await this.getUserByUsername(username)
        if (existingUser.rowCount > 0) {
            throw new Error('User already exists')
        }
        return await query('INSERT INTO users (username) VALUES ($1) RETURNING *', [username])
    }

    public async getOrCreateUser(username: string): Promise<number> {
        const existingUser = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rowCount > 0) {
            return existingUser.rows[0].id;
        }
            
        // User doesn't exist, create new user
        const newUser = await query('INSERT INTO users (username) VALUES ($1) RETURNING *', [username]);
        return newUser.rows[0].id;
    }
}
