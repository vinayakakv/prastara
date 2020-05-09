import {visualize_tree} from "../visualize/tree.js";

class TreeNode {
    constructor(data) {
        this.data = data;
        this.parent = null;
        this.children = [];
    }

    addChild(data) {
        let child = new TreeNode(data);
        child.parent = this;
        this.children.push(child);
        return child;
    }
}

class Tree {
    constructor() {
        this.root = new TreeNode(null);
    }

    visualize(containerId, node_label_function) {
        visualize_tree(containerId,
            this.root,
            d => d ? d.children : null,
            node_label_function
        )
    }
}

export {Tree, TreeNode}