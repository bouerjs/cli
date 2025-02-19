import Bouer from 'bouerjs';
import AppMain from './components/main/AppMain';

import './index.html';
import './main.scss';

new Bouer('#app', {
  data: {
    // Props
    version: '3.0.0',
  },
  components: [
    AppMain,
  ],
});