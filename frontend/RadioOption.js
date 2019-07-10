/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

import type {Theme} from './types';
import Hoverable from './Hoverable';
import SvgIcon from './SvgIcon';

import React from 'react';

const CHART_RADIO_LABEL_WIDTH_THRESHOLD = 650;

type RadioOptionProps = {|
  icon: string,
  isChecked: boolean,
  isDisabled: boolean,
  label: string,
  isHovered: boolean,
  onChange: Function,
  onMouseEnter: Function,
  onMouseLeave: Function,
  theme: Theme,
  width: number,
|};

const RadioOption = Hoverable(({
  icon,
  isChecked,
  isDisabled = false,
  isHovered,
  label,
  onChange,
  onMouseEnter,
  onMouseLeave,
  theme,
  width,
}: RadioOptionProps) => (
  <label
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{
      color: isHovered ? theme.state06 : 'inherit',
      marginRight: '0.5rem',
      cursor: 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      pointerEvents: isDisabled ? 'none' : 'auto',
    }}
    title={label}
  >
    <input
      disabled={isDisabled}
      type="radio"
      checked={isChecked}
      onChange={onChange}
    />
    <SvgIcon
      path={icon}
      style={{
        flex: '0 0 1rem',
        width: '1rem',
        height: '1rem',
        fill: 'currentColor',
        display: 'inline',
        verticalAlign: 'sub',
        margin: '0 0.25rem',
      }}
     />
    {width >= CHART_RADIO_LABEL_WIDTH_THRESHOLD && (
      <span>{label}</span>
    )}
  </label>
));

export default RadioOption;
