import React, { Component } from 'react';

class InstrumentsRow extends Component {

  formatChange(change) {
    var pow = Math.pow(10, 6);
    return +(Math.round(change * pow) / pow);
  }

  handleCurrencyClick = (e) => {
    e.preventDefault();
    this.props.handleShowCurrencyDetails(this.props.row.currency);
  }

  render() {
    const { row } = this.props;
    return (
      <tr data-testid="row" onClick={this.handleCurrencyClick}>
        <td className="symbol">
          <img className="flag" src={`images/flags/${row.currency}.png`} alt={row.currency} />
          {row.currency}
        </td>
        <td>{row.rate}</td>
        <td className={row.className}>{this.formatChange(row.perChange)}%</td>
      </tr>
    )
  }
}

export default InstrumentsRow;