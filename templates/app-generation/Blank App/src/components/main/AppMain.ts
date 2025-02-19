import { Component } from 'bouerjs';
import style from './AppMain.scss';
import html from './AppMain.html';

export default class AppMain extends Component {
  constructor() {
    super(html, [style]);
  }

  data = {
    app: 'Bouer'
  };
}