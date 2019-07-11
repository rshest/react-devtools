import * as d3 from 'd3';

import type Store from './Store';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import decorate from './decorate';
import type {Theme} from './types';

import type {List} from 'immutable';
import styles from './HierarchyPlotView.css';

import HierarchyPlot from './HierarchyPlot';

const UPDATE_PERIOD = 500;

const TYPE_COLORS = {
  "View":	0,
  "RCTView":	0,

  "ScrollView":	1,
  "RCTScrollView":	1,
  "RCTScrollContentView":	1,

  "Text":	2,
  "RCTText":	2,

  "Button":	3,
  "VrButton":	3,
  "OcVrButton":	3,
  "OCButton":	3,

  "GazeView":	4,

  "Container":	5,
  "AppContainer":	5,
  "OCMultiLayerContainer":	5,
  "StaticContainer":	5,
  "OCCenterContainer":	5,

  "Image":	6,
  "RCTImage":	6,
  "TODO_NOT_IMPLEMENTED_YET":	7,
};

const TYPE_COLOR_NAMES = [
  "View",
  "ScrollView",
  "Text",
  "Button",
  "Container",
  "Image",
];

type Props = {
  reload?: () => void,
  roots: List,
  searching: boolean,
  searchText: string,
  store: Store,
  showLegend: boolean,
};

class HierarchyPlotView extends React.Component<Props> {
  timer;

  componentDidMount() {
    // HACK: just pull the data periodically instead of doing it properly
    this.timer = setInterval(() => {
      this.forceUpdate();
    }, UPDATE_PERIOD);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  handleClick = (nodeId) => {
  }

  render() {
    const {roots, showLegend, reload, store} = this.props;

    if (!roots.count()) {
      return null;
    }

    const palette = d3.schemeCategory10;
    return (
      <React.Fragment>
        <AutoSizer>
          {({ height, width }) =>
            <HierarchyPlot
              height={height}
              onDatapointClick={this.handleClick}
              rootNodeId={roots.get(0)}
              store={store}
              typeColors={TYPE_COLORS}
              width={width}
            />
          }
        </AutoSizer>
        {showLegend ?
          <div className={styles.legend}>
            {TYPE_COLOR_NAMES.map(key =>
              <div key={key}>
                <span style={{color: palette[TYPE_COLORS[key]]}}>⬤</span>
                <span className={styles.legendLine}>{key}</span>
              </div>
            )}
          </div> : null}
      </React.Fragment>
    );
  }
}

const WrappedHierarchyPlotView = decorate({
  listeners(props) {
    return ['searchRoots', 'roots'];
  },
  props(store, props) {
    return {
      roots: store.searchRoots || store.roots,
      searching: !!store.searchRoots,
      searchText: store.searchText,
      store: store,
    };
  },
}, HierarchyPlotView);

export default WrappedHierarchyPlotView;
