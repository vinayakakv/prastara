function prastara(tokens) {
    let mapper = (token, index, tokens) => {
        let value = '';
        if (!token['is_akshara'] || token['virama']) {

        } else if (index + 1 < tokens.length && (tokens[index + 1]['samyukta'] || tokens[index + 1]['virama'])) {
            value = '—';
        } else if (token['yogawaha'])
            value = '—';
        else if (token['svara'])
            value = ['ಅ', 'ಇ', 'ಉ', 'ಋ', 'ಌ', 'ಎ', 'ಒ'].includes(token['svara']) ? 'U' : '—';
        else if (token['vyamjana'])
            value = (!token['gunita'] || ['\u0cbf', '\u0cc1', '\u0cc3', '\u0cc6', '\u0cca', '\u0ce2'].includes(token['gunita'])) ? 'U' : '—';
        return value;
    };
    return tokens.map(mapper);
}

export {prastara}
