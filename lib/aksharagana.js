import {Trie} from './trie.js'
import 'https://code.jquery.com/jquery-3.4.1.js';
import {AksharaTokenizerKannada} from 'https://cdn.jsdelivr.net/gh/vinayakakv/akshara_tokenizer@1.0.1/akshara_tokenizer.js'
import {Gaussian} from "./utils.js";
import {FuzzySet} from "./fuzzy.js";

class AksharaGanaIdentifier {
    constructor(chandas_file_path, bit_level = true) {
        this.trie = new Trie();
        this.tokenizer = new AksharaTokenizerKannada();
        $.getJSON(chandas_file_path).then(data => {
            data.forEach(chandas => {
                let pattern = null;
                if (bit_level)
                    pattern = this.tokenizer.tokenize(chandas['pattern']).map(
                        token => {
                            if (token['vyamjana'] === 'ಲ')
                                return 'U';
                            else if (token['vyamjana'] === 'ಗ')
                                return '—';
                            else
                                return ['ನ', 'ಸ', 'ಜ', 'ಯ', 'ಭ', 'ರ', 'ತ', 'ಮ']
                                    .indexOf(token['vyamjana'])
                                    .toString(2)
                                    .padStart(3, '0')
                                    .replace(/1/g, '—')
                                    .replace(/0/g, 'U');
                        }
                    ).join('');
                else
                    pattern = this.tokenizer.tokenize(chandas['pattern']).map(x => x['vyamjana']);
                this.trie.insert(pattern, {
                    name: chandas["child_chandas"],
                    parent: chandas["parent_chandas"],
                    pattern: chandas["pattern"],
                    bit_pattern: pattern,
                    matraCount: chandas["characters"],
                    yatiPosition: chandas["yati"],
                    mention: chandas["chandombudi_source"]
                });
            });
        })
    }

    identify(pattern, max_distance) {
        let result_obj = {};
        let distribution = Gaussian(0, max_distance);
        let lines = [];
        let line = '';
        for (let char of pattern) {
            if (char === '\n') {
                lines.push(line);
                line = '';
            } else {
                line += char;
            }
        }
        if (line)
            lines.push(line);
        result_obj["total_lines"] = lines.length;
        result_obj["lines"] = lines;
        result_obj["max_distance"] = max_distance;
        result_obj["analysis"] = [];
        for (let granularity = 1; granularity <= lines.length; granularity *= 2) {
            let analysis_obj = {
                "granularity": granularity,
                "lines_set": [],
            };
            for (let i = 0; i < lines.length; i += granularity) {
                let current_lines = lines.slice(i, i + granularity).join('');
                let neighbors = this.trie.get_closest(current_lines, max_distance);
                let fuzzy_set = new FuzzySet();
                for (let entry of neighbors) {
                    let neighbour = entry[0];
                    let distance = entry[1];
                    fuzzy_set.add(`${neighbour["bit_pattern"]}=${neighbour["name"]}`, distribution(distance))
                }
                analysis_obj["lines_set"].push(fuzzy_set);
            }
            analysis_obj["intersection"] = analysis_obj["lines_set"][0];
            for (let i = 1; i < analysis_obj["lines_set"].length; i++) {
                analysis_obj["intersection"] = analysis_obj["intersection"].intersection(analysis_obj["lines_set"][i])
            }
            result_obj["analysis"].push(analysis_obj);
        }
        console.log(result_obj);
        return result_obj;
    }
}

export {AksharaGanaIdentifier}