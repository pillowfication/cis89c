import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'

import './assets/css/main.scss'
import './node_modules/pf-konami'

import FrontPage from './components/FrontPage.jsx'

class App extends Component {
  render () {
    return (
      <FrontPage />
    )
  }
}

ReactDOM.render(
  <BrowserRouter>
    <Route path='/' component={App} />
  </BrowserRouter>,
  document.getElementById('app')
)
