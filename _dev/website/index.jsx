import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'

import './main.scss'

import HelloWorld from './components/HelloWorld.jsx'

class App extends Component {
  render () {
    return (
      <div id='app'>
        <HelloWorld />
      </div>
    )
  }
}

ReactDOM.render(
  <BrowserRouter>
    <Route path='/' component={App} />
  </BrowserRouter>,
  document.getElementById('app-container')
)
