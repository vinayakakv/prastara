import { AksharaTokenizerKannada } from 'https://cdn.jsdelivr.net/gh/vinayakakv/akshara_tokenizer@1.0.1/akshara_tokenizer.js'

function prastara(string) {
	let tokenizer = new AksharaTokenizerKannada();
	let tokens = tokenizer.tokenize(string);
	let aksharas = [];
	let mapper = (token, index, tokens) => {
		let value = '';
		let current_akshara = token['akshara'];
		if (index + 1 < tokens.length && (tokens[index + 1]['samyukta'] || tokens[index + 1]['virama'])) {
			value = '—';
			if (tokens[index + 1]['virama'])
				current_akshara += tokens[index + 1]['akshara'];
		}
		else if (token['virama']) {
			value = '';
			current_akshara = '';
		}
		else if (token['yogawaha'])
			value = '—';
		else if (token['svara'])
			value = ['ಅ', 'ಇ', 'ಉ', 'ಋ', 'ಌ', 'ಎ', 'ಒ'].includes(token['svara']) ? 'U' : '—';
		else if (token['vyamjana'])
			value = (!token['gunita'] || ['\u0cbf', '\u0cc1', '\u0cc3', '\u0cc6', '\u0cca', '\u0ce2'].includes(token['gunita'])) ? 'U' : '—';
		return [value, current_akshara];
	}
	let result = tokens.map(mapper).filter(pair => pair[0]);
	return {
		"prastara": result.map(pair => pair[0]),
		"akshara": result.map(pair => pair[1])
	}
}

export { prastara }
