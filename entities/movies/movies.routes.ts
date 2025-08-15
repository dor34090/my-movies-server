import * as express from "express"
import createMoviesController from "./movies.controller"

export const defineMoviesRoutes = (
    app: express.Application,
) => {
    const moviesController = createMoviesController()
    app.get("/getAllMovies", moviesController.getAllMovies)
    app.get("/getMovieById/:id", moviesController.getMovieById)
    app.post("/addMovie", moviesController.addMovie)
    app.put("/editMovie/:id", moviesController.editMovie)
    app.delete("/deleteMovie/:id", moviesController.deleteMovie)
    app.get("/getAllFavourites", moviesController.getAllFavourites)
    app.get("/searchFavourites", moviesController.searchFavourites)
    app.post("/addToFavourites/:movieId", moviesController.addToFavourites)
    app.delete("/removeFromFavourites/:movieId", moviesController.removeFromFavourites)
    app.get("/isMovieFavorited/:movieId", moviesController.isMovieFavorited)
    app.get("/searchMovies", moviesController.searchMovies)
}