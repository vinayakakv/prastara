function prastara(tokens) {
    let mapper = (token, index, tokens) => {
        let value = '';
        if (token['virama']) {
            value = '';
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
    let aksharas = tokens.filter(x => x['is_akshara']);
    let prastara = aksharas.map(mapper);
    let prastara_index = 0;
    let result = [];
    for (let token of tokens) {
        if (token['is_akshara'])
            result.push(prastara[prastara_index++]);
        else if (token['content'].includes("\n"))
            result.push("\n");
        else
            result.push("");
    }
    return result;
}

export {prastara}
