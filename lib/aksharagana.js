import {Trie} from './data_structures/trie.js'
import 'https://code.jquery.com/jquery-3.4.1.js';
import {AksharaTokenizerKannada} from './akshara_tokenizer/akshara_tokenizer.js'
import {Gaussian} from "./data_structures/utils.js";
import {FuzzySet} from "./data_structures/fuzzy.js";
import {DisjointSet} from "./data_structures/disjoint_set.js";

class AksharaGanaIdentifier {
    constructor(chandas_file_path, bit_level = true) {
        this.trie = new Trie('.');
        this.tokenizer = new AksharaTokenizerKannada(true);
        $.getJSON(chandas_file_path).then(data => {
            data.forEach(chandas => {
                let tokens = this.tokenizer.tokenize(chandas['pattern']);
                let bit_pattern = tokens.map(
                    token => {
                        if (!token["is_akshara"])
                            if (token["content"].includes("."))
                                return token["content"].split('').filter(x => x === '.').join('');
                            else
                                return '';
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
                let pattern = tokens.map(token => {
                    if (!token["is_akshara"] && token["content"].includes("."))
                        return token["content"].split('').filter(x => x === '.');
                    else
                        return token["vyamjana"]
                }).flat().filter(Boolean);
                this.trie.insert(bit_level ? bit_pattern : pattern, {
                    name: chandas["child_chandas"],
                    type: chandas["type"],
                    char_count: chandas["characters"],
                    parent: chandas["parent_chandas"],
                    pattern: chandas["pattern"],
                    bit_pattern: bit_pattern,
                    yati_position: chandas["yati"],
                    mention: chandas["chandombudi_source"]
                });
            });
        })
    }

    get_graph() {
        let G = {
            nodes: [],
            links: []
        };
        let current_distance = 1;
        let set = new DisjointSet(x => `${x.data["name"]}:${x.data["bit_pattern"]}`);
        this.trie.elements.forEach(x => set.makeSet(x));
        while (set.forestSets !== 1) {
            let visited = [];
            while (visited.length !== this.trie.elements.length) {
                let unvisited = this.trie.elements.find(x => !visited.includes(x));
                let frontier = unvisited ? [unvisited] : [];
                while (frontier.length !== 0) {
                    let current_node = frontier.shift();
                    if (visited.includes(current_node))
                        continue;
                    visited.push(current_node);
                    if (!G.nodes.includes(current_node))
                        G.nodes.push(current_node);
                    let neighbors = this.trie.get_closest(current_node.data["bit_pattern"], current_distance + 1);
                    for (let entry of neighbors) {
                        let neighbour = entry[0];
                        let distance = entry[1];
                        if (distance === current_distance) {
                            if (!set.areConnected(current_node, neighbour)) {
                                G.links.push({
                                    source: `${current_node.data["name"]}:${current_node.data["bit_pattern"]}`,
                                    target: `${neighbour.data["name"]}:${neighbour.data["bit_pattern"]}`,
                                    weight: current_distance
                                });
                                frontier.push(neighbour);
                                set.union(current_node, neighbour);
                            }
                        }
                    }
                }
            }
            current_distance++;
        }
        return G;
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
                    let neighbour = entry[0].data;
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