import * as d3 from 'd3';

function someFunction(q, filter) {
  var tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const drag = simulation => {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  const color = d => {
    if (d.type === 'comp') return 'rgb(197, 231, 237)';
    return 'grey';
    // const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return d => scale(d.type);
  };

  // const height = 1000;
  // const width = 1000;

  var width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  var height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  if (width > height) height = width;

  d3.selectAll('svg').remove();

  const div = d3
    .select('body')
    .append('div')
    .attr('class', 'load')
    .html('Loading...');

  d3.json('https://or.app.vis.one/' + q).then(function(data) {
    div.remove();
    // filter out nodes will low number of connection
    if (filter) {
      data.nodes = data.nodes.filter(x => x.count > filter);

      const nodeIds = data.nodes.map(x => x.id);

      data.edges = data.edges.filter(
        x => nodeIds.includes(x.source) && nodeIds.includes(x.target)
      );
    }

    const links = data.edges.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const simulation = d3
      .forceSimulation(nodes)
      .velocityDecay(0.8)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(20)
          .strength(1)
      )
      .force('collide', d3.forceCollide())
      .force('charge', d3.forceManyBody().strength(-10))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3
      .select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.3)
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg
      .append('g')
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', x => 3 + Math.sqrt(x.count))
      .attr('fill', color)
      .on('mouseover.tooltip', function(d) {
        tooltip
          .transition()
          .duration(300)
          .style('opacity', 0.8);
        tooltip
          .html(d.name)
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 10 + 'px');
      })
      // .on('mouseover.fade', fade(0.1))
      .on('mouseout.tooltip', function() {
        tooltip
          .transition()
          .duration(100)
          .style('opacity', 0);
      })
      // .on('mouseout.fade', fade(1))
      .on('mousemove', function() {
        tooltip
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 10 + 'px');
      })
      .call(drag(simulation));

    // node.append('title').text(d => d.name);

    const factor = 1;

    simulation.on('tick', () => {
      link
        .attr('x1', d => Math.min(Math.max(0, d.source.x), width))
        .attr('y1', d => d.source.y * factor)
        .attr('x2', d => Math.min(Math.max(0, d.target.x), width))
        .attr('y2', d => d.target.y * factor);

      node.attr('cx', d => d.x).attr('cy', d => d.y * factor);
    });

    // invalidation.then(() => simulation.stop());

    return svg.node();
  });
  // - - - - - - - - - -
}

export default someFunction;
