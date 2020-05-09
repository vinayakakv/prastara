function visualize_graph(data,
                         container_id,
                         node_label,
                         link_label,
                         node_id) {
    let drag = simulation => {

        function drag_started(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function drag_ended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", drag_started)
            .on("drag", dragged)
            .on("end", drag_ended);
    };

    let color = () => {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return d => scale(d.group);
    };

    let height = 600;
    let width = window.innerWidth;

    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(node_id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    const svg = d3.select(container_id)
        .html("")
        .append("svg")
        .style("overflow", "scroll")
        .attr("viewBox", [0, 0, width, height]);
    //.attr("width", width)
    //.attr("height", height);

    let g = svg.append("g")
        .attr("class", "everything");

    let zoom_handler = d3.zoom()
        .on("zoom", e => g.attr("transform", d3.event.transform));

    zoom_handler(svg);

    const link = g.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 1)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => d.weight ? d.weight : 1);

    link.append("title")
        .text(link_label);

    const node = g.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", color)
        .call(drag(simulation));

    node.append("title")
        .text(node_label);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    return svg.node();

}

export {visualize_graph}