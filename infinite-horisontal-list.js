console.log('here1');
let React = require('react');
let {ReCom} = require('recom');
let _ = require('lodash');
//let ReactDOM = require('react-dom');

function throttle(fn, time) {
  let lastCall = 0;
  time = time || 500;
  let args, tis;
  let scheduled = false;
  function run() {
    scheduled = false;
    lastCall = Date.now();
    fn.apply(tis, args);
  }
  return function() {
    args = _.slice(arguments);
    tis = this;
    if (!scheduled) {
      scheduled = true;
      setTimeout(run, Math.max(0, time + lastCall - Date.now()));
    }
  };
}

class InfiniteHorisontalList extends ReCom {

  constructor(props, context) {
    super(props);
    this.prevStart = 0;
    this.offset = 0;
    this.throttleSet = throttle((k, v) => this.set(k, v));
  }

  render() {
    let path = this.props.path;
    let elemWidth = this.props.elemWidth;
    let entryStyle = {display: 'inline-block', width: elemWidth};
    let divProps = Object.assign({}, this.props);
    delete divProps.path;
    delete divProps.elemWidth;
    delete divProps.generator;
    let elemCount = window.innerWidth / elemWidth;
    let start = Math.max((this.get(path, 0) - 2 * elemCount) | 0, 0);
    if (start !== this.prevStart) {
      let delta = start - this.prevStart;
      this.elem.scrollLeft -= delta * elemWidth;
      this.offset += delta;
    }
    this.prevStart = start;

    return (
      <div
        {...divProps}
        style={{
          whiteSpace: 'nowrap',
          width: '100%',
          display: 'inline-block',
          overflowY: 'hidden',
          overflowX: 'auto'
        }}
        onScroll={e => {
          this.elem = e.target;
          this.throttleSet(
            path,
            this.offset + e.target.scrollLeft / this.props.elemWidth
          );
        }}>
        {_.range(start, start + 5 * elemCount).map(i => (
          <div style={entryStyle}>{this.props.generator(i)}</div>
        ))}
      </div>
    );
  }
}

let resultStyle = {
  display: 'inline-block',
  width: 120,
  verticalAlign: 'top',
  marginRight: 20,
  lineHeight: '10px',
  height: 140,
  fontSize: 10,
  whiteSpace: 'nowrap',
  overflow: 'hidden'
};

class Result extends ReCom {
  constructor(props, context) {
    super(props);
  }

  render() {
    let n = this.props.n;
    let o = this.get(['results', (n / 10) | 0, n % 10]);
    if (!o) {
      return <div key={n} style={resultStyle} />;
    } else {
      return (
        o &&
        <div
          key={n}
          onMouseEnter={() => this.set('ui.currentResult', n)}
          style={resultStyle}>
          <div><strong>{o.TITLE[0]} &nbsp;</strong></div>
          <div><em>{(o.CREATOR || []).join(' & ')} &nbsp;</em></div>
          <br />
          <img
            src={'https:' + o.coverUrlThumbnail}
            alt=""
            style={{
              height: 50,
              width: 35,
              border: '1px solid black',
              float: 'left'
            }}
          />
          <img
            src=""
            alt="Ny forside (TODO)"
            style={{
              height: 100,
              width: 70,
              border: '1px solid black',
              float: 'right'
            }}
          />
        </div>
      );
    }
  }
}

export default class Results extends ReCom {

  constructor(props, context) {
    super(props);
  }

  render() {
    return (
      <div
        style={{
          //padding: '0px 0px 10px 30px'
        }}>

        {this.get('ui.searchError') &&
          <div
            style={{
              display: 'inline-block',
              textAlign: 'left'
            }}>
            <h3>Error</h3>
            <pre>{String(this.get('ui.searchError'))}</pre>
          </div>}
        <InfiniteHorisontalList
          path={'ui.resultScroll'}
          elemWidth={140}
          generator={i => (
            <div><small>{i + 1}.</small><br /><Result n={i} /></div>
          )}
        />
      </div>
    );
  }
}

/*
exports.main = () => {
  ReactDOM.render( <h1>Hello</h1>, document.getElementById('app')
  );
}
console.log('here');
*/
