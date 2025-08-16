import { Request, Response } from 'express';
import { MoviesService } from "./movies.service";
import { Movie } from "./movies.interface";

const createMoviesController = () => {
    const moviesService = new MoviesService();
    
    const moviesController = {
        // Get all movies
        async getAllMovies(req: Request, res: Response) {
            try {
                const movies = await moviesService.getAllMovies();
                res.json(movies);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Get movie by ID
        async getMovieById(req: Request, res: Response) {
            try {
                const id = parseInt(req.params.id);
                const movie = await moviesService.getMovieById(id);
                
                if (!movie) {
                    return res.status(404).json({ error: 'Movie not found' });
                }
                
                res.json(movie);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Add new movie
        async addMovie(req: Request, res: Response) {
            try {
                const { username, ...movieData } = req.body;
                
                if (!username) {
                    return res.status(400).json({ error: 'Username is required' });
                }
                
                const movie = await moviesService.addMovie(movieData, username);
                res.status(201).json(movie);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Edit movie
        async editMovie(req: Request, res: Response) {
            try {
                const id = parseInt(req.params.id);
                const { username, ...movieData } = req.body;
                
                if (!username) {
                    return res.status(400).json({ error: 'Username is required' });
                }
                
                const movie = await moviesService.editMovie(id, movieData, username);
                
                if (!movie) {
                    return res.status(404).json({ error: 'Movie not found' });
                }
                
                res.json(movie);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Delete movie
        async deleteMovie(req: Request, res: Response) {
            try {
                const id = parseInt(req.params.id);
                const { username } = req.body;
                
                if (!username) {
                    return res.status(400).json({ error: 'Username is required' });
                }
                
                const deleted = await moviesService.deleteMovie(id, username);
                
                if (!deleted) {
                    return res.status(404).json({ error: 'Movie not found' });
                }
                
                res.json({ message: 'Movie deleted successfully' });
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Get user's favorite movies
        async getAllFavourites(req: Request, res: Response) {
            try {
                const { username } = req.query;
                
                if (!username || typeof username !== 'string') {
                    return res.status(400).json({ error: 'Username is required' });
                }
                
                const favorites = await moviesService.getAllFavourites(username);
                res.json(favorites);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Search within user's favorites
        async searchFavourites(req: Request, res: Response) {
            try {
                const { username, searchTerm } = req.query;
                
                if (!username || typeof username !== 'string') {
                    return res.status(400).json({ error: 'Username is required' });
                }
                
                if (!searchTerm || typeof searchTerm !== 'string') {
                    return res.status(400).json({ error: 'Search term is required' });
                }
                
                const favorites = await moviesService.searchFavourites(username, searchTerm);
                res.json(favorites);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Add movie to favorites
        async addToFavourites(req: Request, res: Response) {
            try {
                const movieId = parseInt(req.params.movieId);
                const { username } = req.body;
                
                if (!username) {
                    return res.status(400).json({ error: 'Username is required' });
                }
                
                await moviesService.addToFavourites(username, movieId);
                
                // Always return success - if it was already favorited, that's fine
                res.json({ message: 'Movie added to favorites' });
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Remove movie from favorites
        async removeFromFavourites(req: Request, res: Response) {
            try {
                const movieId = parseInt(req.params.movieId);
                const { username } = req.body;
                
                if (!username) {
                    return res.status(400).json({ error: 'Username is required' });
                }
                
                const removed = await moviesService.removeFromFavourites(username, movieId);
                
                if (!removed) {
                    return res.status(404).json({ error: 'Movie not in favorites' });
                }
                
                res.json({ message: 'Movie removed from favorites' });
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Check if movie is favorited
        async isMovieFavorited(req: Request, res: Response) {
            try {
                const movieId = parseInt(req.params.movieId);
                const { username } = req.query;
                
                if (!username || typeof username !== 'string') {
                    return res.status(400).json({ error: 'Username is required' });
                }
                
                const isFavorited = await moviesService.isMovieFavorited(username, movieId);
                res.json({ isFavorited });
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        },

        // Search all movies
        async searchMovies(req: Request, res: Response) {
            try {
                const { searchTerm } = req.query;
                
                if (!searchTerm || typeof searchTerm !== 'string') {
                    return res.status(400).json({ error: 'Search term is required' });
                }
                
                const movies = await moviesService.searchMovies(searchTerm);
                res.json(movies);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        }
    };
    
    return moviesController;
};

export default createMoviesController;