function visualize_tree(containerId,
                        root,
                        child_function,
                        node_label_function,
                        edge_label_function = null,
                        dx = 15,
                        dy = 150) {
    let tree = d3.tree().nodeSize([dx, dy]);
    let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
    let hierarchy = d3.hierarchy(root, child_function);
    let margin = ({top: 10, right: 120, bottom: 10, left: 40});
    root = hierarchy;
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        // if (d.depth && d.data.name.length !== 7) d.children = null;
    });
    const svg = d3.select(containerId)
        .style("overflow", "scroll")
        .html("")
        .append("svg")
        .style("font", "12px sans-serif")
        .style("user-select", "none");
    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);
    const gNode = svg.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");
    const gEdgeLabels = svg.append("text");

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
            .attr("r", d => d.data.data ? 8 : 4)
            .attr("fill", d => d.data.data ? "#555" : "#999")
            .attr("stroke-width", 10);
        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -10 : 10)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .text(node_label_function)
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
        if (edge_label_function) {
            const edgeLabels = gEdgeLabels.selectAll("textPath").data(links);
            edgeLabels.enter().append("textPath")
                .attr("href", (d, i) => '#edgePath_' + i)
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .attr("startOffset", "40%")
                .text(edge_label_function);
            edgeLabels.exit().remove();
        }
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

export {visualize_tree}