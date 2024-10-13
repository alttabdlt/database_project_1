"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var fs_1 = require("fs");
var csv_parse_1 = require("csv-parse");
var dbConfig = {
    host: 'localhost',
    user: 'postgres',
    password: 'axel',
    database: 'nba_stats',
    port: 5432,
};
function parseNumeric(value) {
    if (value === '' || value.toLowerCase() === 'nan') {
        return null;
    }
    var parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}
function setupDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var client, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new pg_1.default.Client(dbConfig);
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 12, 13, 15]);
                    // Create players table
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS players (\n        id SERIAL PRIMARY KEY,\n        player_name VARCHAR(255) UNIQUE,\n        college VARCHAR(255),\n        country VARCHAR(255)\n      )\n    ")];
                case 3:
                    // Create players table
                    _a.sent();
                    // Create teams table
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS teams (\n        id SERIAL PRIMARY KEY,\n        team_abbreviation VARCHAR(3) UNIQUE,\n        team_name VARCHAR(255)\n      )\n    ")];
                case 4:
                    // Create teams table
                    _a.sent();
                    // Create player_seasons table (modified)
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS player_seasons (\n        id SERIAL PRIMARY KEY,\n        player_id INTEGER REFERENCES players(id),\n        team_id INTEGER REFERENCES teams(id),\n        season VARCHAR(7),\n        age FLOAT,\n        player_height FLOAT,\n        player_weight FLOAT,\n        draft_year INT,\n        draft_round INT,\n        draft_number INT,\n        gp INT,\n        pts FLOAT,\n        reb FLOAT,\n        ast FLOAT,\n        net_rating FLOAT,\n        oreb_pct FLOAT,\n        dreb_pct FLOAT,\n        usg_pct FLOAT,\n        ts_pct FLOAT,\n        ast_pct FLOAT,\n        UNIQUE (player_id, season)\n      )\n    ")];
                case 5:
                    // Create player_seasons table (modified)
                    _a.sent();
                    // Create franchises table
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS franchises (\n        id SERIAL PRIMARY KEY,\n        franchise_name VARCHAR(255) UNIQUE,\n        league VARCHAR(10)\n      )\n    ")];
                case 6:
                    // Create franchises table
                    _a.sent();
                    // Create team_stats table (modified)
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS team_stats (\n        id SERIAL PRIMARY KEY,\n        franchise_id INTEGER REFERENCES franchises(id),\n        from_year INTEGER,\n        to_year INTEGER,\n        years INTEGER,\n        games INTEGER,\n        wins INTEGER,\n        losses INTEGER,\n        win_loss_percentage FLOAT,\n        playoffs INTEGER,\n        division_titles INTEGER,\n        conference_titles INTEGER,\n        championships INTEGER\n      )\n    ")];
                case 7:
                    // Create team_stats table (modified)
                    _a.sent();
                    // Create nba_salaries table (unchanged)
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS nba_salaries (\n        id SERIAL PRIMARY KEY,\n        rank INTEGER,\n        name VARCHAR(255),\n        position VARCHAR(10),\n        team VARCHAR(255),\n        salary NUMERIC,\n        season INTEGER\n      )\n    ")];
                case 8:
                    // Create nba_salaries table (unchanged)
                    _a.sent();
                    // Import and process data
                    return [4 /*yield*/, processPlayerSeasons(client)];
                case 9:
                    // Import and process data
                    _a.sent();
                    return [4 /*yield*/, processTeamStats(client)];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, importCSV(client, '/path/to/nba-salaries.csv', 'nba_salaries')];
                case 11:
                    _a.sent();
                    console.log('Data import and processing completed');
                    return [3 /*break*/, 15];
                case 12:
                    err_1 = _a.sent();
                    console.error('Error during setup:', err_1);
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, client.end()];
                case 14:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
function processPlayerSeasons(client) {
    return __awaiter(this, void 0, void 0, function () {
        var fileStream, parser, csvStream, _a, csvStream_1, csvStream_1_1, row, playerResult, playerId, teamResult, teamId, e_1_1;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    fileStream = fs_1.default.createReadStream('/path/to/all_seasons_1.csv');
                    parser = (0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true });
                    csvStream = fileStream.pipe(parser);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 9, 10, 15]);
                    _a = true, csvStream_1 = __asyncValues(csvStream);
                    _e.label = 2;
                case 2: return [4 /*yield*/, csvStream_1.next()];
                case 3:
                    if (!(csvStream_1_1 = _e.sent(), _b = csvStream_1_1.done, !_b)) return [3 /*break*/, 8];
                    _d = csvStream_1_1.value;
                    _a = false;
                    row = _d;
                    return [4 /*yield*/, client.query('INSERT INTO players (player_name, college, country) VALUES ($1, $2, $3) ON CONFLICT (player_name) DO UPDATE SET player_name = EXCLUDED.player_name RETURNING id', [row.player_name, row.college, row.country])];
                case 4:
                    playerResult = _e.sent();
                    playerId = playerResult.rows[0].id;
                    return [4 /*yield*/, client.query('INSERT INTO teams (team_abbreviation, team_name) VALUES ($1, $2) ON CONFLICT (team_abbreviation) DO UPDATE SET team_abbreviation = EXCLUDED.team_abbreviation RETURNING id', [row.team_abbreviation, row.team_name])];
                case 5:
                    teamResult = _e.sent();
                    teamId = teamResult.rows[0].id;
                    // Insert player_season
                    return [4 /*yield*/, client.query("\n      INSERT INTO player_seasons (\n        player_id, team_id, season, age, player_height, player_weight,\n        draft_year, draft_round, draft_number, gp, pts, reb, ast,\n        net_rating, oreb_pct, dreb_pct, usg_pct, ts_pct, ast_pct\n      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)\n      ON CONFLICT (player_id, season) DO UPDATE SET\n        team_id = EXCLUDED.team_id,\n        age = EXCLUDED.age,\n        player_height = EXCLUDED.player_height,\n        player_weight = EXCLUDED.player_weight,\n        gp = EXCLUDED.gp,\n        pts = EXCLUDED.pts,\n        reb = EXCLUDED.reb,\n        ast = EXCLUDED.ast,\n        net_rating = EXCLUDED.net_rating,\n        oreb_pct = EXCLUDED.oreb_pct,\n        dreb_pct = EXCLUDED.dreb_pct,\n        usg_pct = EXCLUDED.usg_pct,\n        ts_pct = EXCLUDED.ts_pct,\n        ast_pct = EXCLUDED.ast_pct\n    ", [
                            playerId, teamId, row.season, parseFloat(row.age), parseFloat(row.player_height),
                            parseFloat(row.player_weight), parseInt(row.draft_year), parseInt(row.draft_round),
                            parseInt(row.draft_number), parseInt(row.gp), parseFloat(row.pts), parseFloat(row.reb),
                            parseFloat(row.ast), parseFloat(row.net_rating), parseFloat(row.oreb_pct),
                            parseFloat(row.dreb_pct), parseFloat(row.usg_pct), parseFloat(row.ts_pct),
                            parseFloat(row.ast_pct)
                        ])];
                case 6:
                    // Insert player_season
                    _e.sent();
                    _e.label = 7;
                case 7:
                    _a = true;
                    return [3 /*break*/, 2];
                case 8: return [3 /*break*/, 15];
                case 9:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 15];
                case 10:
                    _e.trys.push([10, , 13, 14]);
                    if (!(!_a && !_b && (_c = csvStream_1.return))) return [3 /*break*/, 12];
                    return [4 /*yield*/, _c.call(csvStream_1)];
                case 11:
                    _e.sent();
                    _e.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 14: return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
function processTeamStats(client) {
    return __awaiter(this, void 0, void 0, function () {
        var fileStream, parser, csvStream, _a, csvStream_2, csvStream_2_1, row, franchiseResult, franchiseId, e_2_1;
        var _b, e_2, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    fileStream = fs_1.default.createReadStream('/path/to/team_stats.csv');
                    parser = (0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true });
                    csvStream = fileStream.pipe(parser);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 8, 9, 14]);
                    _a = true, csvStream_2 = __asyncValues(csvStream);
                    _e.label = 2;
                case 2: return [4 /*yield*/, csvStream_2.next()];
                case 3:
                    if (!(csvStream_2_1 = _e.sent(), _b = csvStream_2_1.done, !_b)) return [3 /*break*/, 7];
                    _d = csvStream_2_1.value;
                    _a = false;
                    row = _d;
                    return [4 /*yield*/, client.query('INSERT INTO franchises (franchise_name, league) VALUES ($1, $2) ON CONFLICT (franchise_name) DO UPDATE SET franchise_name = EXCLUDED.franchise_name RETURNING id', [row.Franchise, row.Lg])];
                case 4:
                    franchiseResult = _e.sent();
                    franchiseId = franchiseResult.rows[0].id;
                    // Insert team_stats
                    return [4 /*yield*/, client.query("\n      INSERT INTO team_stats (\n        franchise_id, from_year, to_year, years, games, wins, losses,\n        win_loss_percentage, playoffs, division_titles, conference_titles, championships\n      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)\n    ", [
                            franchiseId, parseInt(row.From.split('-')[0]), parseInt(row.To.split('-')[0]),
                            parseInt(row.Yrs), parseInt(row.G), parseInt(row.W), parseInt(row.L),
                            parseFloat(row['W/L%']), parseInt(row.Plyfs), parseInt(row.Div),
                            parseInt(row.Conf), parseInt(row.Champ)
                        ])];
                case 5:
                    // Insert team_stats
                    _e.sent();
                    _e.label = 6;
                case 6:
                    _a = true;
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _e.trys.push([9, , 12, 13]);
                    if (!(!_a && !_b && (_c = csvStream_2.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _c.call(csvStream_2)];
                case 10:
                    _e.sent();
                    _e.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function importCSV(client, filePath, tableName) {
    return __awaiter(this, void 0, void 0, function () {
        var fileStream, parser, csvStream, _a, csvStream_3, csvStream_3_1, row, columns, values, placeholders, query, e_3_1;
        var _b, e_3, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    fileStream = fs_1.default.createReadStream(filePath);
                    parser = (0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true });
                    csvStream = fileStream.pipe(parser);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 7, 8, 13]);
                    _a = true, csvStream_3 = __asyncValues(csvStream);
                    _e.label = 2;
                case 2: return [4 /*yield*/, csvStream_3.next()];
                case 3:
                    if (!(csvStream_3_1 = _e.sent(), _b = csvStream_3_1.done, !_b)) return [3 /*break*/, 6];
                    _d = csvStream_3_1.value;
                    _a = false;
                    row = _d;
                    columns = Object.keys(row);
                    values = Object.values(row);
                    placeholders = values.map(function (_, index) { return "$".concat(index + 1); }).join(', ');
                    query = "\n      INSERT INTO ".concat(tableName, " (").concat(columns.join(', '), ")\n      VALUES (").concat(placeholders, ")\n    ");
                    return [4 /*yield*/, client.query(query, values)];
                case 4:
                    _e.sent();
                    _e.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_3_1 = _e.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _e.trys.push([8, , 11, 12]);
                    if (!(!_a && !_b && (_c = csvStream_3.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _c.call(csvStream_3)];
                case 9:
                    _e.sent();
                    _e.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
setupDatabase();
