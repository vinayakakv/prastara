class TrieNode {
    constructor(char, data) {
        this.char = char;
        this.data = data;
        this.children = {};
    }
}

class Trie {
    constructor(){
        this.root = new TrieNode("", null);
    }
    
    insert(key, data) {
        let node = this.root;
        for (let char of key) {
            if (!node.children[char])
                node.children[char] = new TrieNode(char, null);
            node = node.children[char];
        }
        node.data = data;
    }

    get(key) {
        let node = this.root;
        for (let char of key) {
            node = node.children[char];
            if (!node)
                return null;
        }
        return node.data;
    }
}

export {Trie}