import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import _ from 'lodash'

import Board from './Board'
import Display from './Display'
import GameLoop from './GameLoop'
import Timer from './Timer'
import AStar from './AStar'

const INCOME_DELAY = 3 * 1000
const WATER_ADVANCE_DELAY = 1 * 1000
const BUILDING_WALL = 'WALL'
const BUILDING_SHRINE = 'SHRINE'
const BUILDING_FACTORY = 'FACTORY'
const BUILDING_TYPES = [
  {name: 'Sandbag', type: BUILDING_WALL, hp: 4, total: 4, cost: 4, mp: 0, image: 'sandbag.png'},
  {name: 'Shrine', type: BUILDING_SHRINE, hp: 1, total: 1, cost: 3, mp: 1, image: 'shrine.png'},
  // {name: 'Factory', type: BUILDING_FACTORY, hp: 4, total: 4, cost: 20, mp: 10},
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
      alignSelf: 'center',
    },
    item: {
      width: 100,
      height: 100,
      // backgroundColor: 'lightblue',
      margin: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      color: 'white',
    },
    selected: {
      border: '4px solid lightgreen',
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
        <div style={{paddingTop: 6}} />
        <img src={item.image} />
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
      background: 'linear-gradient(to bottom, #5cb4e6, #176bbf)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    path: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: '#a69589',
      justifyContent: 'center',
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

  calculateDamage = () => {
    const {
      waters,
      buildings,
    } = this.state

    buildings.forEach(building => {
      const {stats, coord: buildingCoord} = building

      waters.forEach(water => {
        const {coord: waterCoord} = water

        if (
          (
            Math.abs(buildingCoord.row - waterCoord.row) === 1 &&
            Math.abs(buildingCoord.column - waterCoord.column) === 0
          ) || (
            Math.abs(buildingCoord.row - waterCoord.row) === 0 &&
            Math.abs(buildingCoord.column - waterCoord.column) === 1
          )
        ) {
          water.stats = {...water.stats, hp: water.stats.hp - 0.5}
          building.stats = {...building.stats, hp: building.stats.hp - 0.5}
        }
      })
    })

    this.setState({
      waters: waters.filter(water => water.stats.hp > 0),
      buildings: buildings.filter(building => building.stats.hp > 0),
    })
  }

  startWave = () => {
    const {level} = this.state

    let waterCount = level * 10

    // console.log('startWave', waterCount)

    const timer = Timer((id) => {
      // console.log('running timer', id)
      const {waters} = this.state

      if (level !== this.state.level) return

      if (waterCount > 0) {
        waterCount--

        // console.log('add water', level, this.state.level, waterCount, waters)

        this.setState({
          waters: [...waters, {
            coord: {row: 0, column: 0},
            stats: {hp: 2 + level - 1, total: 2 + level - 1},
          }]
        })
      } else if (this.state.finishedSpawning < level) {
        GameLoop.remove(timer)

        this.setState({
          finishedSpawning: level,
        })
      }
    }, 1000)

    GameLoop.add(timer)
  }

  canBuildAtCoord = (coord) => {
    const {
      buildings,
      waters,
      rows,
      columns,
    } = this.state

    const board = getBoard(rows, columns, buildings)

    board[coord.row][coord.column] = true

    const path = AStar(
      [0, 0],
      [4, 19],
      board,
      rows,
      columns
    )

    // console.log('can build', path)

    return path && path.length > 1
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

      // console.log('path', path)
    })

    this.forceUpdate()
  }

  loseCondition = () => {
    const {
      waters,
      columns,
      level,
      finishedSpawning
    } = this.state

    if (waters.find(water => water.coord.column >= columns - 1)) {
      alert('You Lose!')
      GameLoop.stop()
    }

    if (waters.length === 0 && level === finishedSpawning) {
      console.log('startwave', level, finishedSpawning)

      this.setState({
        level: level + 1,
      })

      this.startWave()
    }
  }

  constructor() {
    super()

    GameLoop.add(Timer(this.moveWater, WATER_ADVANCE_DELAY))
    GameLoop.add(Timer(this.calculateIncome, INCOME_DELAY))
    GameLoop.add(Timer(this.calculateDamage, WATER_ADVANCE_DELAY))
    GameLoop.start()

    this.state = {
      columns: 20,
      rows: 5,
      money: 20,
      level: 1,
      finishedSpawning: 0,
      selectedPurchase: null,
      buildings: [],
      waters: [
        // {coord: {row: 1, column: 2}}
      ],
    }
  }

  componentDidMount() {
    this.startWave()
    GameLoop.add(this.loseCondition)
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

    if (money >= selectedPurchase.cost) {
      if (!this.canBuildAtCoord(coord)) return

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
        <div style={this.styles.path}>
          <Board
            rows={rows}
            columns={columns}
            buildings={buildings}
            waters={waters}
            onClickSquare={this.onClickSquare}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 'calc(50% - 200px)',
            width: 400,
            height: 300,
            backgroundImage: 'url(title.png)',
            backgroundSize: 'contain',
          }}
        />
      </div>
    )
  }
}

export default App
