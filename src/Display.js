import React, { Component } from 'react'
import _ from 'lodash'

export default class Display extends Component {

  styles = {
    text: {
      color: 'white',
      position: 'absolute',
      top: 40,
      left: 40,
    }
  }

  static defaultProps = {
    money: 0,
    level: 0,
  }

  render() {
    const {money, level} = this.props

    return (
      <div style={this.styles.text}>
        <div>Money: {money}</div>
        <div>Level: {level}</div>
      </div>
    )
  }
}
