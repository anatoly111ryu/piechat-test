import './Chart.scss';
import React, { Component } from 'react';

export default class myChart extends Component {
  constructor(props) {
    super(props);
    this.changeAmount = this.changeAmount.bind(this);
    this.state = {
                  data: [10, 20, 15]
                  };
  }
  changeAmount(sort) {
    let newVal = this.state.data;
    newVal[sort] = newVal[sort]+1;
    this.setState({data: newVal});
  }
  render() {
    var colors = ['#f0ad4e', '#3d8af7', '#ff3823'];
    return (
      <div id="mainView">
        <div className="static">
          <div>
            <Pie
              data={ this.state.data }
              radius={ 250 }
              hole={ 0 }
              colors={ colors }
              labels={ true }
              percent={ true }
              strokeWidth={ 3 }
              stroke={ '#fff' }
            />
          </div>
          <div className="mybtn">
            <div className="mybtns" style={{background: '#f0ad4e'}} onClick={() => this.changeAmount(0)}>+</div>
            <div className="mybtns" style={{background: '#3d8af7'}} onClick={() => this.changeAmount(1)}>+</div>
            <div className="mybtns" style={{background: '#ff3823'}} onClick={() => this.changeAmount(2)}>+</div>
          </div>
        </div>
      </div>
    )
  }
}


function getAnglePoint(startAngle, endAngle, radius, x, y) {
  var x1, y1, x2, y2;

  x1 = x + radius * Math.cos(Math.PI * startAngle / 180);
  y1 = y + radius * Math.sin(Math.PI * startAngle / 180);
  x2 = x + radius * Math.cos(Math.PI * endAngle / 180);
  y2 = y + radius * Math.sin(Math.PI * endAngle / 180);

  return { x1, y1, x2, y2 };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var Pie = React.createClass({

  render: function () {
    var colors = this.props.colors,
      colorsLength = colors.length,
      labels = this.props.labels,
      hole = this.props.hole,
      radius = this.props.radius,
      diameter = radius * 2,
      self = this,
      sum, startAngle, d = null;

    sum = this.props.data.reduce(function (carry, current) { return carry + current }, 0);
    startAngle = 0;


    return (
      <svg width={ diameter } height={ diameter } viewBox={ '0 0 ' + diameter + ' ' + diameter } xmlns="http://www.w3.org/2000/svg" version="1.1">
        { this.props.data.map(function (slice, sliceIndex) {
          var angle, nextAngle, percent;

          nextAngle = startAngle;
          angle = (slice / sum) * 360;
          percent = (slice / sum) * 100;
          startAngle += angle;

          return <Slice
            key={ sliceIndex }
            value={ slice }
            percent={ self.props.percent }
            percentValue={ percent.toFixed(1) }
            startAngle={ nextAngle }
            angle={ angle }
            radius={ radius }
            hole={ radius - hole }
            trueHole={ hole }
            showLabel= { labels }
            fill={ colors[sliceIndex % colorsLength] }
            stroke={ self.props.stroke }
            strokeWidth={ self.props.strokeWidth }
          />
        }) }

      </svg>
    );
  }
});

var Slice = React.createClass({
  getInitialState: function () {
    return {
      path: '',
      x: 0,
      y: 0
    };
  },
  componentWillReceiveProps: function () {
    this.setState({ path: '' });
    this.animate();
  },
  componentDidMount: function () {
    this.animate();
  },
  animate: function () {
    this.draw(0);
  },
  draw: function (s) {
    if (!this.isMounted()) {
      return;
    }

    var p = this.props, path = [], a, b, c, self = this, step;

    step = p.angle / (37.5 / 2);

    if (s + step > p.angle) {
      s = p.angle;
    }

    // Get angle points
    a = getAnglePoint(p.startAngle, p.startAngle + s, p.radius, p.radius, p.radius);
    b = getAnglePoint(p.startAngle, p.startAngle + s, p.radius - p.hole, p.radius, p.radius);

    path.push('M' + a.x1 + ',' + a.y1);
    path.push('A'+ p.radius +','+ p.radius +' 0 '+ (s > 180 ? 1 : 0) +',1 '+ a.x2 + ',' + a.y2);
    path.push('L' + b.x2 + ',' + b.y2);
    path.push('A'+ (p.radius- p.hole) +','+ (p.radius- p.hole) +' 0 '+ (s > 180 ? 1 : 0) +',0 '+ b.x1 + ',' + b.y1);

    // Close
    path.push('Z');

    this.setState({ path: path.join(' ') });

    if (s < p.angle) {
      setTimeout(function () { self.draw(s + step) } , 16);
    } else if (p.showLabel) {
      c = getAnglePoint(p.startAngle, p.startAngle + (p.angle / 2), (p.radius / 2 + p.trueHole / 2), p.radius, p.radius);

      this.setState({
        x: c.x2,
        y: c.y2
      });
    }
  },
  render: function () {


    return (
      <g overflow="hidden">
        <path
          d={ this.state.path }
          fill={ this.props.fill }
          stroke={ this.props.stroke }
          strokeWidth={ this.props.strokeWidth ? this.props.strokeWidth : 3 }
           />
        { this.props.showLabel && this.props.percentValue > 5 ?
          <text x={ this.state.x } y={ this.state.y } fill="#fff" textAnchor="middle">
            { this.props.percent ? this.props.percentValue + '%' : this.props.value }
          </text>
        : null }
      </g>
    );
  }
})
