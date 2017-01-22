import React, { Component } from 'react'
import _ from 'lodash'

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

    return `rgb(${r},${g},${b})`
  }

  renderWater = (water, i) => {
    const {squareSize} = this.props
    const {row, column} = water.coord

    const style = {
      position: 'absolute',
      left: column * squareSize,
      top: row * squareSize,
      width: squareSize,
      height: squareSize,
      backgroundColor: 'white',
    }

    return (
      <div key={i} style={style} />
    )
  }

  renderSquare = (row, column) => {
    const {squareSize, onClickSquare, buildings} = this.props

    const style = {
      width: squareSize,
      height: squareSize,
      backgroundColor: this.getBoxColor(),
    }

    const existingBuilding = buildings
      .find(x => _.isEqual({row, column}, x.coord))

    return (
      <div
        key={column}
        style={style}
        onClick={onClickSquare.bind(this, {row, column})}
      >
        {existingBuilding && existingBuilding.stats.name}
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
