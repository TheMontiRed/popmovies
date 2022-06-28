import { ResultsModel } from "./movies/Results.model";

export class MoviesModel {
    page: number;
    results: ResultsModel;
    total_pages: number;
    total_results: number;
}