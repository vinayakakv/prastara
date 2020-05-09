import {visualize_tree} from "../visualize/tree.js";
import {Tree} from "./tree.js"

class TrieNode {
    constructor(char, data) {
        this.char = char;
        this.data = data;
        this.children = {};
    }
}

class Trie {
    constructor(wildcard_char) {
        this.wildcard_char = wildcard_char;
        this.root = new TrieNode("", null);
        this.elements = [];
    }

    insert(key, data) {
        let node = this.root;
        let created = false;
        for (let char of key) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode(char, null);
                created = true;
            }
            node = node.children[char];
        }
        node.data = data;
        if (created)
            this.elements.push(node);
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

    visualize(containerId) {
        visualize_tree(containerId,
            this.root,
            d => {
                if (d && d.children)
                    return Object.values(d.children);
                else
                    return null;
            },
            d => d && d.data && d.data.data && d.data.data.name,
            d => d.target.data.char
        )
    }

    parse(key) {
        // Takes a key as input
        // Returns tree
        // Contains all possible interpretations of key in trie
        let result = new Tree();
        let node = result.root.addChild({
            'node': this.root,
            'value': '',
            'count': -1
        });
        let frontier = [node]; // List of TreeNodes
        for (let [i, char] of key.entries()) {
            let next_frontier = []; // List of TreeNodes
            while (frontier.length) {
                let current_result_node = frontier.shift();  // TreeNode
                let current_node = current_result_node.data['node']; // TrieNode
                //console.log(node_id, current_node)
                let branched = false;
                if (current_node.data) {
                    // branch 1 -- which terminates, and goes back to root
                    // yield (node_id, current_node.data)
                    branched = true;
                    current_result_node.data['value'] = current_node.data;
                    let next_result_node = current_result_node.addChild({
                        'node': this.root.children[char],
                        'value': this.root.children[char].data,
                        'count': i
                    }); // TreeNode
                    // next_node_list.append((self.root, node_id))
                    next_frontier.push(next_result_node);
                    // branch 2 -- which continues, continued after if
                    // node_id = node_id + str(current_node.data)
                }
                let next_node = current_node.children[char];
                if (next_node) {
                    if (branched) {
                        // Now is the branch 2
                        let branch_node = current_result_node.parent.addChild({
                            'node': next_node,
                            'value': next_node.data,
                            'count': i
                        });
                        next_frontier.push(branch_node);
                    } else {
                        current_result_node.data['node'] = next_node;
                        current_result_node.data['value'] = next_node.data;
                        current_result_node.data['count'] = i;
                        next_frontier.push(current_result_node);
                    }
                }
            }
            frontier = next_frontier;
        }
        return result
    }

    get_closest(key, max_distance) {
        /*
        Gets the strings in the trie with d(key, pattern) <= max_distance
        d() is Levenshtein Distance function
         */
        let current_row = [...Array(key.length + 1).keys()];
        let results = [];
        for (let letter of Object.keys(this.root.children)) {
            this.get_closest_recursive(
                this.root.children[letter],
                letter,
                key,
                current_row,
                results,
                max_distance
            );
        }
        return results;
    }

    get_closest_recursive(node, letter, key, previous_row, results, max_distance) {
        let columns = key.length + 1;
        let current_row = [previous_row[0] + 1];
        for (let column = 1; column < columns; column++) {
            let insert_cost = current_row[column - 1] + 1;
            let delete_cost = previous_row[column] + 1;
            let replace_cost = previous_row[column - 1] + (key[column - 1] === letter || letter === this.wildcard_char ? 0 : 1);
            current_row.push(Math.min(insert_cost, delete_cost, replace_cost))
        }
        let current_distance = current_row[current_row.length - 1];
        if (current_distance < max_distance && node.data) {
            results.push([node, current_distance]);
        }
        if (Math.min(...current_row) < max_distance) {
            for (let letter of Object.keys(node.children)) {
                this.get_closest_recursive(
                    node.children[letter],
                    letter,
                    key,
                    current_row,
                    results,
                    max_distance
                );
            }
        }
    }
}

export {Trie}