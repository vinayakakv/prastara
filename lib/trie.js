import {visualize} from "./tree_visualize.js";
import {Tree} from "./tree.js"

class TrieNode {
    constructor(char, data) {
        this.char = char;
        this.data = data;
        this.children = {};
    }
}

class Trie {
    constructor() {
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

    visualize(containerId) {
        visualize(containerId,
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

        function update(source) {
            const duration = d3.event && d3.event.altKey ? 2500 : 250;
            const nodes = root.descendants().reverse();
            const links = root.links();
            // Compute the new tree layout.
            tree(root);
            let x_min = Infinity, x_max = -x_min;
            root.each(d => {
                if (d.x > x_max) x_max = d.x;
                if (d.x < x_min) x_min = d.x;
            });
            let y_min = Infinity, y_max = -y_min;
            root.each(d => {
                if (d.y > y_max) y_max = d.y;
                if (d.y < y_min) y_min = d.y;
            });
            const height = x_max - x_min + margin.top + margin.bottom;
            const width = y_max - y_min + margin.left + margin.right;
            const transition = svg.transition()
                .duration(duration)
                .attr("viewBox", [-margin.left, x_min - margin.top, width, height])
                .attr("width", width)
                .attr("height", height)
                .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));
            // Update the nodes…
            const node = gNode.selectAll("g")
                .data(nodes, d => d.id);
            // Enter any new nodes at the parent's previous position.
            const nodeEnter = node.enter().append("g")
                .attr("transform", d => `translate(${source.y0},${source.x0})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .on("click", d => {
                    d.children = d.children ? null : d._children;
                    update(d);
                });
            nodeEnter.append("circle")
                .attr("r", 4)
                .attr("fill", d => d.data.data ? "#555" : "#999")
                .attr("stroke-width", 10);
            nodeEnter.append("text")
                .attr("dy", "0.31em")
                .attr("x", d => d._children ? -6 : 6)
                .attr("text-anchor", d => d._children ? "end" : "start")
                .text(d => d && d.data && d.data.data && d.data.data.name)
                .clone(true).lower()
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .attr("stroke", "white");
            // Transition nodes to their new position.
            const nodeUpdate = node.merge(nodeEnter).transition(transition)
                .attr("transform", d => `translate(${d.y},${d.x})`)
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);
            // Transition exiting nodes to the parent's new position.
            const nodeExit = node.exit().transition(transition).remove()
                .attr("transform", d => `translate(${source.y},${source.x})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0);
            // Update the links…
            const link = gLink.selectAll("path")
                .data(links, d => d.target.id);
            // Enter any new links at the parent's previous position.
            const linkEnter = link.enter().append("path")
                .attr("d", d => {
                    const o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                })
                .attr("id", (d, i) => 'edgePath_' + i);

            const edgeLabels = gEdgeLabels.selectAll("textPath").data(links);
            edgeLabels.enter().append("textPath")
                .attr("href", (d, i) => '#edgePath_' + i)
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .attr("startOffset", "40%")
                .text(d => d.target.data.char);

            edgeLabels.exit().remove();
            // Transition links to their new position.
            link.merge(linkEnter).transition(transition)
                .attr("d", diagonal);
            // Transition exiting nodes to the parent's new position.
            link.exit().transition(transition).remove()
                .attr("d", d => {
                    const o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                });
            // Stash the old positions for transition.
            root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        update(root);
    }
}

export {Trie}