import {Trie} from './trie.js'
import 'https://code.jquery.com/jquery-3.4.1.js';
import {AksharaTokenizerKannada} from 'https://cdn.jsdelivr.net/gh/vinayakakv/akshara_tokenizer@1.0.1/akshara_tokenizer.js'

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
                                return '0';
                            else if (token['vyamjana'] === 'ಗ')
                                return '1';
                            else
                                return [
                                    'ನ',
                                    'ಸ',
                                    'ಜ',
                                    'ಯ',
                                    'ಭ',
                                    'ರ',
                                    'ತ',
                                    'ಮ'].indexOf(token['vyamjana']).toString(2).padStart(3, '0');
                        }
                    ).join('');
                else
                    pattern = this.tokenizer.tokenize(chandas['pattern']).map(x=>x['vyamjana']);
                this.trie.insert(pattern, {
                    name: chandas["child_chandas"],
                    parent: chandas["parent_chandas"],
                    pattern: chandas["pattern"],
                    matraCount: chandas["characters"],
                    yatiPosition: chandas["yati"],
                    mention: chandas["chandombudi_source"]
                });
            });
        })
    }

    identify(pattern) {
        return this.trie.get(pattern);
    }
}

export {AksharaGanaIdentifier}