import { query } from "../../db";
import { UserService } from "../users/users.service";
import { Movie } from "./movies.interface";
import { UserActionType } from "./user-actions.interface";

export class MoviesService {
    private userService: UserService;
    constructor() {
        this.userService = new UserService();
    }

   

    /**
     * Get all movies
     */
    public async getAllMovies(): Promise<Movie[]> {
        const result = await query('SELECT * FROM movies ORDER BY created_at DESC');
        return result.rows;
    }

    /**
     * Get movie by ID
     */
    public async getMovieById(id: number): Promise<Movie | null> {
        const result = await query('SELECT * FROM movies WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    /**
     * Add a new movie
     */
    public async addMovie(movie: Omit<Movie, 'id'>, username: string): Promise<Movie> {
        const userId = await this.userService.getOrCreateUser(username);
        
        const result = await query(
            `INSERT INTO movies (title, year, runtime, genre, director) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [movie.title, movie.year, movie.runtime, movie.genre, movie.director]
        );
        
        const newMovie = result.rows[0];
        
        // Log the create action
        await query(
            `INSERT INTO user_actions (user_id, movie_id, action) 
             VALUES ($1, $2, $3)`,
            [userId, newMovie.id, UserActionType.INSERT]
        );
        
        return newMovie;
    }

    /**
     * Edit an existing movie
     */
    public async editMovie(id: number, movie: Partial<Omit<Movie, 'id'>>, username: string): Promise<Movie | null> {
        const userId = await this.userService.getOrCreateUser(username);
        
        const existingMovie = await this.getMovieById(id);
        if (!existingMovie) {
            throw new Error('Movie not found');
        }

        const result = await query(
            `UPDATE movies 
             SET title = $1, year = $2, runtime = $3, genre = $4, director = $5 
             WHERE id = $6 
             RETURNING *`,
            [
                movie.title || existingMovie.title,
                movie.year || existingMovie.year,
                movie.runtime || existingMovie.runtime,
                movie.genre || existingMovie.genre,
                movie.director || existingMovie.director,
                id
            ]
        );
        
        const updatedMovie = result.rows[0];
        
        // Log the edit action
        await query(
            `INSERT INTO user_actions (user_id, movie_id, action) 
             VALUES ($1, $2, $3)`,
            [userId, id, UserActionType.UPDATE]
        );
        
        return updatedMovie;
    }

    /**
     * Delete a movie
     */
    public async deleteMovie(id: number, username: string): Promise<boolean> {
        const userId = await this.userService.getOrCreateUser(username);
        
        const existingMovie = await this.getMovieById(id);
        if (!existingMovie) {
            throw new Error('Movie not found');
        }
        
        // Log the delete action before deleting
        await query(
            `INSERT INTO user_actions (user_id, movie_id, action) 
             VALUES ($1, $2, $3)`,
            [userId, id, UserActionType.DELETE]
        );
        
        const result = await query('DELETE FROM movies WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    /**
     * Get all favorite movies for a user
     */
    public async getAllFavourites(username: string): Promise<Movie[]> {
        const userId = await this.userService.getOrCreateUser(username);
        const result = await query(
            `SELECT m.* FROM movies m
             JOIN user_favourites uf ON m.id = uf.movie_id
             WHERE uf.user_id = $1
             ORDER BY uf.created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    /**
     * Search within favorite movies for a user
     */
    public async searchFavourites(username: string, searchTerm: string): Promise<Movie[]> {
        const userId = await this.userService.getOrCreateUser(username);
        const result = await query(
            `SELECT m.* FROM movies m
             JOIN user_favourites uf ON m.id = uf.movie_id
             WHERE uf.user_id = $1
             AND (m.title ILIKE $2 OR m.director ILIKE $2 OR m.genre ILIKE $2)
             ORDER BY uf.created_at DESC`,
            [userId, `%${searchTerm}%`]
        );
        return result.rows;
    }

    /**
     * Add a movie to user's favorites
     */
    public async addToFavourites(username: string, movieId: number): Promise<boolean> {
        const userId = await this.userService.getOrCreateUser(username);
        
        try {
            await query(
                `INSERT INTO user_favourites (user_id, movie_id) 
                 VALUES ($1, $2)`,
                [userId, movieId]
            );
            
            // Log the favorite action
            await query(
                `INSERT INTO user_actions (user_id, movie_id, action) 
                 VALUES ($1, $2, $3)`,
                [userId, movieId, UserActionType.FAVORITE]
            );
            
            return true;
        } catch (error: any) {
            // Handle duplicate favorite (unique constraint violation)
            if (error.code === '23505') {
                return false; // Already favorited
            }
            throw error;
        }
    }

    /**
     * Remove a movie from user's favorites
     */
    public async removeFromFavourites(username: string, movieId: number): Promise<boolean> {
        const userId = await this.userService.getOrCreateUser(username);
        
        const result = await query(
            `DELETE FROM user_favourites 
             WHERE user_id = $1 AND movie_id = $2`,
            [userId, movieId]
        );
        
        if (result.rowCount > 0) {
            // Log the unfavorite action
            await query(
                `INSERT INTO user_actions (user_id, movie_id, action) 
                 VALUES ($1, $2, $3)`,
                [userId, movieId, UserActionType.UNFAVORITE]
            );
            return true;
        }
        
        return false; // Was not favorited
    }

    /**
     * Check if a movie is favorited by a user
     */
    public async isMovieFavorited(username: string, movieId: number): Promise<boolean> {
        const userId = await this.userService.getOrCreateUser(username);
        
        const result = await query(
            `SELECT 1 FROM user_favourites 
             WHERE user_id = $1 AND movie_id = $2`,
            [userId, movieId]
        );
        
        return result.rowCount > 0;
    }

    /**
     * Search movies by title, director, or genre
     */
    public async searchMovies(searchTerm: string): Promise<Movie[]> {
        const result = await query(
            `SELECT * FROM movies 
             WHERE title ILIKE $1 OR director ILIKE $1 OR genre ILIKE $1 
             ORDER BY created_at DESC`,
            [`%${searchTerm}%`]
        );
        return result.rows;
    }
}