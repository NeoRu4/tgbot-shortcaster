package lab.controller;

import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import lab.domain.Movie;
import lab.dto.MovieSearchDto;
import lab.service.MovieSearcherService;
import lab.service.dataset.MovieImporterService;

import javax.validation.Valid;
import java.util.List;

@Controller("/")
public class MovieController {

    protected final MovieImporterService movieImporterService;
    protected final MovieSearcherService movieSearcherService;

    public MovieController(MovieImporterService movieImporterService,
                           MovieSearcherService movieSearcherService) {

        this.movieImporterService = movieImporterService;
        this.movieSearcherService = movieSearcherService;
    }

    @Get
    @Produces(MediaType.APPLICATION_JSON)
    public String index() {
        return "Hello World";
    }

    @Post(value = "/list")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public List<Movie> list(@Body @Valid MovieSearchDto params) {
        try {
            return movieSearcherService.searchMoviesByParams(params);
        } catch (Exception exception) {
            exception.printStackTrace();
        };
        return null;
    }

    @Get(value = "/import", produces = MediaType.APPLICATION_JSON)
    public String importMovies() {
        try {
            this.movieImporterService.makeNewDataSet();
            this.movieImporterService.importMovies();
        } catch (Exception exception) {
            exception.printStackTrace();
            return exception.getMessage();
        }
        return "Imported";
    }
}


