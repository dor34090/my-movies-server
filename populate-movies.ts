import axios from 'axios';
import getPool from './db';

// OMDB API interface
interface OMDBMovie {
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Director: string;
  imdbID: string;
  Response: string;
}

// Popular movie titles to search for
const popularMovies = [
  'The Shawshank Redemption',
  'The Godfather',
  'The Dark Knight',
  'Pulp Fiction',
  'Forrest Gump',
  'Inception',
  'The Matrix',
  'Goodfellas',
  'The Lord of the Rings: The Fellowship of the Ring',
  'Star Wars: Episode IV - A New Hope',
  'Interstellar',
  'The Avengers',
  'Titanic',
  'Jurassic Park',
  'Avatar',
  'The Lion King',
  'Gladiator',
  'Saving Private Ryan',
  'The Departed',
  'Fight Club',
  'The Silence of the Lambs',
  'Schindler\'s List',
  'Casablanca',
  'Gone with the Wind',
  'Lawrence of Arabia'
];

async function fetchMovieFromOMDB(title: string): Promise<OMDBMovie | null> {
  try {
    // You'll need to get a free API key from http://www.omdbapi.com/apikey.aspx
    const API_KEY: string = "8652d67";
    
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      console.log('⚠️  Please set OMDB_API_KEY in your .env file');
      console.log('   Get a free API key from: http://www.omdbapi.com/apikey.aspx');
      return null;
    }

    const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`);
    
    if (response.data.Response === 'True') {
      return response.data as OMDBMovie;
    } else {
      console.log(`❌ Movie not found: ${title}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching ${title}:`, error);
    return null;
  }
}

function mapOMDBToMovie(omdbMovie: OMDBMovie) {
  return {
    title: omdbMovie.Title,
    year: omdbMovie.Year,
    runtime: omdbMovie.Runtime,
    genre: omdbMovie.Genre,
    director: omdbMovie.Director
  };
}

async function insertMovie(movie: any): Promise<boolean> {
  try {
    // First check if movie already exists
    const checkQuery = 'SELECT id FROM movies WHERE title = $1';
    const checkResult = await getPool().query(checkQuery, [movie.title]);
    
    if (checkResult.rows.length > 0) {
      console.log(`⚠️  Skipped (duplicate): ${movie.title}`);
      return false;
    }

    // Insert the movie
    const insertQuery = `
      INSERT INTO movies (title, year, runtime, genre, director)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const values = [
      movie.title,
      movie.year,
      movie.runtime,
      movie.genre,
      movie.director
    ];

    const result = await getPool().query(insertQuery, values);
    
    if (result.rows.length > 0) {
      console.log(`✅ Added: ${movie.title} (${movie.year})`);
      return true;
    } else {
      console.log(`❌ Failed to insert: ${movie.title}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error inserting ${movie.title}:`, error);
    return false;
  }
}

async function populateMovies() {
  console.log('🎬 Starting to populate movies database...\n');
  
  let successCount = 0;
  let totalCount = 0;

  for (const movieTitle of popularMovies) {
    console.log(`🔍 Fetching: ${movieTitle}`);
    
    const omdbMovie = await fetchMovieFromOMDB(movieTitle);
    
    if (omdbMovie) {
      const movie = mapOMDBToMovie(omdbMovie);
      const inserted = await insertMovie(movie);
      
      if (inserted) {
        successCount++;
      }
    }
    
    totalCount++;
    
    // Add a small delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n🎉 Completed! Added ${successCount}/${totalCount} movies to the database.`);
  
  // Close the database connection
  await getPool().end();
}

// Run the population script
if (require.main === module) {
  populateMovies().catch(console.error);
}

export { populateMovies };
