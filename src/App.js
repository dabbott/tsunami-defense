import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import _ from 'lodash'

import Board from './Board'
import Display from './Display'
import GameLoop from './GameLoop'
import Timer from './Timer'
import AStar from './AStar'

const INCOME_DELAY = 1 * 1000
const WATER_ADVANCE_DELAY = 1 * 1000
const BUILDING_WALL = 'WALL'
const BUILDING_SHRINE = 'SHRINE'
const BUILDING_FACTORY = 'FACTORY'
const BUILDING_TYPES = [
  {name: 'Wall', type: BUILDING_WALL, hp: 50, cost: 4, mp: 0},
  {name: 'Shrine', type: BUILDING_SHRINE, hp: 20, cost: 3, mp: 2},
  {name: 'Factory', type: BUILDING_FACTORY, hp: 100, cost: 10, mp: 10},
]

class PurchaseArea extends Component {

  static defaultProps = {
    items: BUILDING_TYPES,
  }

  styles = {
    container: {
      position: 'absolute',
      bottom: 0,
      display: 'flex',
      flexDirection: 'row',
    },
    item: {
      width: 100,
      height: 100,
      backgroundColor: 'lightblue',
      margin: 20,
    },
    selected: {
      backgroundColor: 'lightgreen',
    },
  }

  renderItem = (item, i) => {
    const {name, type} = item
    const {selectedItem, onSelectItem} = this.props

    return (
      <div
        key={i}
        style={{
          ...this.styles.item,
          ...selectedItem && type === selectedItem.type && this.styles.selected,
        }}
        onClick={onSelectItem.bind(null, item)}
      >
        {name}
      </div>
    )
  }

  render() {
    const {items} = this.props

    return (
      <div style={this.styles.container}>
        {items.map(this.renderItem)}
      </div>
    )
  }
}

const getBoard = (rows, columns, buildings) => {
  const board = [];

  for (let r = 0; r < rows; r++) {
    board[r] = []

    for (let c = 0; c < columns; c++) {
      const existingBuilding = buildings
        .find(x => _.isEqual({row: r, column: c}, x.coord))

      board[r][c] = !!existingBuilding
    }
  }

  return board
}

class App extends Component {

  styles = {
    app: {
      backgroundColor: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }
  }

  calculateIncome = () => {
    const {
      money,
      buildings,
    } = this.state

    const income = buildings
      .map(building => building.stats.mp)
      .reduce((a, b) => a + b, 0)

    this.setState({money: money + income})
  }

  moveWater = () => {
    const {
      buildings,
      waters,
      rows,
      columns,
    } = this.state

    const board = getBoard(rows, columns, buildings)

    const paths = waters.map(water => {
      return AStar(
        [water.coord.row, water.coord.column],
        [4, 19],
        board,
        rows,
        columns
      )
      .map(({x, y}) => ({row: x, column: y}))
    })

    waters.forEach((water, i) => {
      const path = paths[i]

      if (path.length >= 2) {
        water.coord = path[1]
      }

      console.log('path', path)
    })

    this.forceUpdate()
  }

  constructor() {
    super()

    GameLoop.add(Timer(this.calculateIncome, INCOME_DELAY))
    GameLoop.add(Timer(this.moveWater, WATER_ADVANCE_DELAY))
    GameLoop.start()

    this.state = {
      columns: 20,
      rows: 5,
      money: 20,
      level: 0,
      selectedPurchase: null,
      buildings: [],
      waters: [
        {coord: {row: 1, column: 2}}
      ],
    }
  }

  onSelectPurchase = (item) =>
    this.setState({selectedPurchase: item})

  onClickSquare = (coord) => {
    const {
      money,
      level,
      buildings,
    } = this.state

    const existingBuilding = buildings
      .find(x => _.isEqual(coord, x.coord))

    if (existingBuilding) {

    } else {
      this.purchaseBuilding(coord)
    }
  }

  purchaseBuilding = (coord) => {
    const {money, buildings, selectedPurchase} = this.state

    if (!selectedPurchase) return

    if (money > selectedPurchase.cost) {
      this.setState({
        money: money - selectedPurchase.cost,
        buildings: [
          ...buildings,
          {stats: selectedPurchase, coord},
        ],
      })
    }
  }

  render() {
    const {
      money,
      level,
      selectedPurchase,
      buildings,
      waters,
      rows,
      columns,
    } = this.state

    return (
      <div style={this.styles.app} className="App">
        <Display
          money={money}
          level={level}
        />
        <PurchaseArea
          selectedItem={selectedPurchase}
          items={BUILDING_TYPES}
          onSelectItem={this.onSelectPurchase}
        />
        <Board
          rows={rows}
          columns={columns}
          buildings={buildings}
          waters={waters}
          onClickSquare={this.onClickSquare}
        />
      </div>
    )
  }
}

export default App
