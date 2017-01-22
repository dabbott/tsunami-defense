import React, { Component } from 'react'
import _ from 'lodash'

import Healthbar from './Healthbar'

export default class Board extends Component {

  static defaultProps = {
    rows: 4,
    columns: 20,
    squareSize: 50,
    buildings: [],
    waters: [],
    onClickSquare: () => {},
  }

  styles = {
    board: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
    },
    waters: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
  }

  getBoxColor = () => {
    const r = 30
    const g = 40
    const b = (Math.random() * 50 + 100) | 0

    return `rgba(${r},${g},${b},0.3)`
  }

  renderWater = (water, i) => {
    const {squareSize} = this.props
    const {coord: {row, column}, stats: {hp, total}} = water

    const style = {
      color: 'white',
      position: 'absolute',
      left: column * squareSize,
      top: row * squareSize,
      width: squareSize,
      height: squareSize,
      background: 'url(water.png)',
    }

    return (
      <div key={i} style={style}>
        <Healthbar
          hp={hp}
          total={total}
        />
      </div>
    )
  }

  renderSquare = (row, column) => {
    const {squareSize, onClickSquare, buildings} = this.props

    const existingBuilding = buildings
      .find(x => _.isEqual({row, column}, x.coord))

    const style = {
      width: squareSize,
      height: squareSize,
      color: 'white',
      background: existingBuilding && existingBuilding.stats.image
        ? `url(${existingBuilding.stats.image}), #a69589`
        : 'url(ground.png)',
      position: 'relative',
    }

    return (
      <div
        key={column}
        style={style}
        onClick={onClickSquare.bind(this, {row, column})}
      >
        {existingBuilding &&
          <Healthbar
            hp={existingBuilding.stats.hp}
            total={existingBuilding.stats.total}
          />
        }
      </div>
    )
  }

  renderRow = (row) => {
    const {columns} = this.props

    return (
      <div key={row} style={this.styles.row}>
        {_.range(columns).map(this.renderSquare.bind(this, row))}
      </div>
    )
  }

  render() {
    const {rows, waters} = this.props

    return (
      <div style={this.styles.board}>
        {_.range(rows).map(this.renderRow)}
        <div style={this.styles.waters}>
          {waters.map(this.renderWater)}
        </div>
      </div>
    )
  }
}
