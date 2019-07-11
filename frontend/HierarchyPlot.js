import React, { Component } from 'react';
import type {Theme} from './types';

import * as d3 from 'd3';

const PropTypes = require('prop-types');

const NODE_SIZE = 4;
const ROOT_NODE_SIZE = 10;
const SELECTED_NODE_SIZE = 8;

const STRUCTURE_CHANGE_DURATION = 300;
const SELECTED_CHANGE_DURATION = 200;

const MARGIN = {left: 10, top: 15, right: 10, bottom: 15};

class HierarchyPlot extends Component {
  root = null;
  tree = null;
  selected = null;

  context: {
    theme: Theme,
  };

  componentDidMount() {
    this.tree = d3.tree().nodeSize([NODE_SIZE, NODE_SIZE]);

    this.updateTree();
  }

  componentDidUpdate() {
    this.updateTree();
  }

  updateTree() {
    const {theme} = this.context;
    const {
      width,
      height,
      rootNodeId,
      store,
      typeColors,
      onDataPointClick } = this.props;

    let root = d3.hierarchy(rootNodeId, d => {
      const node = store.get(d);

      if (node !== undefined) {
        const children = node.get('children');
        if (!children || typeof children === 'string' || !children.length) {
          return [];
        } else {
          return children;
        }
      } else {
        return undefined;
      }
    });

    const w = width - MARGIN.left - MARGIN.right;
    const h = height - MARGIN.top - MARGIN.bottom;

    this.tree.size([h, w])

    let layout = this.tree(root);

    let g = d3.select(this.root)
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    let link = g.select('.links').selectAll("path.link")
      .data(layout.links(), function (d) {
        return `${d.source.data}/${d.target.data}`;
      });

    let linkEnter = link.enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", theme.base03)
      .attr("stroke-width", "1px");

    link.merge(linkEnter).transition()
        .attr("d", d3.linkHorizontal()
          .x(function (d) { return d.y; })
          .y(function (d) { return d.x; }))
        .duration(STRUCTURE_CHANGE_DURATION);

    link.exit().remove();

    const nodeColors = d3.schemeCategory10;
    let node = g.select('.nodes').selectAll("g.node")
      .data(root.descendants(), d => d.data);

    var nodeEnter = node.enter().append("g")
      .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
      .attr("class", "node")
      .attr("cursor", "pointer")
      .attr("stroke", theme.special00)
      .attr("pointer-events", "all");

    nodeEnter.append("circle")
      .attr("r", d => (d.data === rootNodeId) ? ROOT_NODE_SIZE : NODE_SIZE)
      .attr("fill", function (d) {
        const node = store.get(d.data);
        const name = node.get('name') + '';
        const idx = typeColors[name];
        if (idx === undefined) {
          return theme.state00;
        }
        return nodeColors[idx];
      })
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on('click', mouseClick);

    node.merge(nodeEnter).transition()
      .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
      .each(function(d) {
        if (d.data == store.selected) {
          selectNode(this);
        } else {
          d3.select(this).attr("stroke-width", "0px").lower();
        }
      })
      .duration(STRUCTURE_CHANGE_DURATION);

    node.exit().each(function (d) {
      if (selected == this) {
        selected = null;
      }
    }).remove();

    function mouseOver(d) {
      d3.select(this).transition()
        .attr("r", SELECTED_NODE_SIZE)
        .duration(SELECTED_CHANGE_DURATION);
    }

    function mouseOut(d) {
      d3.select(this).transition()
        .attr("r", d => (d.data === rootNodeId) ? ROOT_NODE_SIZE : NODE_SIZE)
        .duration(SELECTED_CHANGE_DURATION);
    }

    let selected = null;
    function selectNode(node) {
      d3.select(node)
        .attr("stroke-width", "3px");
      d3.select(node.parentNode).raise();

      const sel = d3.select(selected);
      if (sel) {
        sel.attr("stroke-width", "0px");
      }
      selected = node;
    }

    function mouseClick(d) {
      selectNode(this);
      store.select(d.data);
      onDataPointClick && onDatapointClick(d.data);
    }
  }

  render() {
    const {width, height} = this.props;
    return (
      <svg height={height} width={width}>
        <g ref={e => this.root = e}>
          <g className="links" />
          <g className="nodes" />
        </g>
      </svg>
    );
  }
}

HierarchyPlot.contextTypes = {
  theme: PropTypes.object.isRequired,
};


export default HierarchyPlot;
