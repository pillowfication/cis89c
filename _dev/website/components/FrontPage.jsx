import React, { Component } from 'react'

// class Block extends Component {
//   componentWillMount () {
//     const s = Math.random() * 10 + 10
//     this.style = {
//       width: s,
//       height: s,
//       left: Math.random() * 100 + '%'
//     }
//   }
//
//   componentDidMount () {
//     setTimeout(() => {
//       this.props.destroyBlock(this.props.id)
//     }, 3000)
//   }
//
//   render () {
//     return <div className='block' style={this.style} />
//   }
// }

export default class FrontPage extends Component {
  // constructor (props) {
  //   super(props)
  //   this.state = {
  //     idCounter: 0,
  //     blocks: []
  //   }
  // }
  //
  // componentDidMount () {
  //   this.idCounter = 0
  //   this.interval = setInterval(this.generateBlock.bind(this), 20)
  // }
  // componentWillUnmount () {
  //   clearInterval(this.interval)
  // }
  //
  // generateBlock () {
  //   this.setState({
  //     blocks: [ ...this.state.blocks, this.idCounter++ ]
  //   })
  // }
  // destroyBlock (id) {
  //   this.state.blocks.splice(this.state.blocks.indexOf(id), 1)
  // }

  render () {
    // const destroyBlock = this.destroyBlock.bind(this)
    return (
      <div id='fp'>
        <div id='fp-head'>
          <div id='class'>CIS89C</div>
          <div id='name'>Markus Tran</div>
        </div>
        <div id='fp-body'>
          {
            // <div id='blocks-container'>
            //   {this.state.blocks.map(id =>
            //     <Block key={id} id={id} destroyBlock={destroyBlock} />
            //   )}
            // </div>
          }
          <div className='floaty-thing'>Assignments</div>
          <div className='floaty-thing'>Exercises</div>
        </div>
      </div>
    )
  }
}
