import {Trie} from './data_structures/trie.js'
import 'https://code.jquery.com/jquery-3.4.1.js';
import {Gaussian} from "./data_structures/utils.js";
import {FuzzySet} from "./data_structures/fuzzy.js";

class MatraGanaIdentifier {
    constructor(chandas_file_path) {
        this.data = [];
        $.getJSON(chandas_file_path).then(data => {
            data.forEach(chandas => {
                let sum = chandas["pattern"]
                    .replace(/\n/g, '|')
                    .split("|")
                    .map(x => parseInt(x))
                    .reduce((x, y) => x + y);
                this.data.push({
                    "name": chandas["name"],
                    "total_matra": sum,
                    "lines": chandas["pattern"]
                        .split('')
                        .filter(x => x === '\n')
                        .length,
                    "pattern": chandas["pattern"]
                        .split("\n")
                        .map(line => line
                            .split('|')
                            .map(x => parseInt(x))
                        ),
                });
            })
        });
        this.data = this.data.sort((a, b) => a["total_marta"] - b["total_marta"]);
    }

    find_chandas(total_matra, max_distance) {
        return this.data
            .filter(x => Math.abs(x["total_matra"] - total_matra) < max_distance)
            .map(x => [x, Math.abs(x["total_matra"] - total_matra)]
            );
    }

    try_division(line, pattern) {
        /*
        line is a list of laghu and gurus
        pattern is a list of list of integers
         */
        let target = pattern.flat();
        let end = 0;
        let divisions = [];
        for (let number of target) {
            let start = end;
            let sum = 0;
            while (sum < number && end < line.length) {
                sum += line[end++];
            }
            if (sum > number)
                end--;
            divisions.push({
                "start": start,
                "end": end < line.length ? end - 1 : line.length,
                "diff": number - sum
            });
        }
        if (end < line.length - 1) {
            let remaining = 0;
            let end_position = end;
            while (end < line.length) {
                remaining += line[end++];
            }
            divisions.push({
                "start": end_position,
                "end": end - 1,
                "diff": remaining
            });
        }
        return divisions;
    }

    identify(pattern, max_distance) {
        let result_obj = {};
        let distribution = Gaussian(0, max_distance);
        let lines = [];
        let line = '';
        let sum = (x, y) => x + y;
        for (let char of pattern) {
            if (char === '\n') {
                lines.push(line);
                line = [];
            } else {
                line += char;
            }
        }
        if (line)
            lines.push(line);
        let line_sums = lines
            .map(line => line
                .split('')
                .map(x => x === 'U' ? 1 : 2)
                .reduce(sum)
            );
        result_obj["total_lines"] = lines.length;
        result_obj["max_distance"] = max_distance;
        result_obj["lines"] = lines;
        result_obj["line_sums"] = line_sums;
        result_obj["analysis"] = [];
        for (let granularity = lines.length; granularity > 0; granularity = Math.floor(granularity / 2)) {
            let analysis_obj = {
                "granularity": granularity,
                "lines_set": [],
                "splits": []
            };
            for (let i = 0; i < lines.length; i += granularity) {
                let current_lines = lines
                    .slice(i, i + granularity)
                    .map(line => line.split('')
                        .map(x => x === 'U' ? 1 : 2)
                    ).flat();
                let current_lines_sum = current_lines.reduce(sum);
                let neighbors = this.find_chandas(current_lines_sum, max_distance);
                let fuzzy_set = new FuzzySet();
                let splits = [];
                for (let entry of neighbors) {
                    let neighbour = entry[0];
                    let distance = entry[1];
                    let split = this.try_division(current_lines, neighbour["pattern"]);
                    splits.push(split);
                    fuzzy_set.add(`${neighbour["name"]}`, distribution(distance));
                }
                analysis_obj["lines_set"].push(fuzzy_set);
                analysis_obj["splits"].push(splits);
            }
            analysis_obj["intersection"] = analysis_obj["lines_set"].reduce((x, y) => x.intersection(y));
            result_obj["analysis"].push(analysis_obj);
        }
        return result_obj;
    }
}

export {MatraGanaIdentifier}