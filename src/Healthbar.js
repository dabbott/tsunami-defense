import React, { Component } from 'react'
import _ from 'lodash'

export default class Healthbar extends Component {

  styles = {
    bar: {
      position: 'absolute',
      top: 2,
      left: 2,
      width: 30,
      height: 6,
      border: '1px solid white',
      boxSizing: 'border-box',
    },
  }

  static defaultProps = {
    hp: 0,
    total: 10,
  }

  render() {
    const {hp, total} = this.props

    const percent = hp / total * 100
    const color = percent > 60
      ? 'lightgreen'
      : percent > 25
      ? 'yellow'
      : 'red'

    const style = {
      height: '100%',
      width: `${percent}%`,
      backgroundColor: color,
    }

    return (
      <div style={this.styles.bar}>
        <div style={style} />
      </div>
    )
  }
}
