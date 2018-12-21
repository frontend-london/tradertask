import React, { Component } from 'react';
import * as api from '../../api';
import InstrumentsRow from './row';
import Pagination from "react-js-pagination";

class Instruments extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      days: [], 
      activePage: 1,
      sortBy: 'currency', 
      currentDate: null, 
      minDate: null,
      maxDate: null,
      sortUp: false, 
      search: null
    };
    this.fetchUpdates();
  }

  formatDate(date) {
    return date.toISOString().slice(0,10);
  }

  getPrevDay(date) {    
    let prev  = new Date(date);
    prev.setDate(prev.getDate() - 1);
    return this.formatDate(prev);
  }
  
  getNextDay(date) {
    let next  = new Date(date);
    next.setDate(next.getDate() + 1);
    return this.formatDate(next);
  }

  compareChanges = (a, b) => {
    let result = false;
    switch (this.state.sortBy) {
      case 'currency':
        result = a.currency - b.currency;
        break;
      case 'rate':
        result = a.rate - b.rate;
        break;
      case 'change':
        result = a.perChange - b.perChange;
        break;
      default:
        break;
    }

    return result;
      
  }

  getChanges = ()  => {
    let prevDate = this.getPrevDay(this.state.currentDate),
      prevDay = this.state.days[prevDate],
      search = this.state.search,
      currDay = this.state.days[this.state.currentDate],
      changes = [];

    if (prevDay) {
      Object.keys(prevDay.rates).forEach((currency,index) => {
        let rate = currDay.rates[currency],
          change = rate - prevDay.rates[currency],
          perChange = (change / prevDay.rates[currency]) * 100,
          classNameId = Math.min(Math.round(Math.abs(perChange)), 8),
          className = 'price ' + ((change > 0) ? 'price-up--' + classNameId : (change < 0) ? 'price-down--' + classNameId : '');
          
          if (!search || search.split(',').find((el) => {
            return currency.includes(el);
          })) {
            changes.push({className, currency, rate, change, perChange});  
          }
      });

      changes.sort(this.compareChanges);
      if (this.state.sortUp) {
        changes.reverse();   
      }
    }
    return changes;
  }

  async fetchUpdates() {
    let days = await api.get('currencies.json', this.handleFetchUpdatesError);  
    this.setState({ days: days, currentDate: Object.keys(days)[1] });
  }

  handleFetchUpdatesError = (err) => {
    console.info('Error', err);
  }

  handlePrevDayClick = (e) => {
    e.preventDefault();
    this.setState({currentDate: this.getPrevDay(this.state.currentDate)});
  }

  handleNextDayClick = (e) => {
    e.preventDefault();
    this.setState({currentDate: this.getNextDay(this.state.currentDate)});
  }

  handleHeaderClick = (e, header) => {
    e.preventDefault();
    if (header === this.state.sortBy) {
      this.setState({sortUp: !this.state.sortUp});
    } else {
      this.setState({sortBy: header});
    }
  }

  getHeaderClassName = (header) => {
    let className = '';
    if (this.state.sortBy === header) {
      className = 'active';

      if (this.state.sortUp) {
        className+= ' up';
      }
    } 
    return className;
  }

  handleCurrencyNameChange = (e) => {
    this.setState({activePage: 1, search: e.currentTarget.value.toUpperCase()})
  }

  handlePageChange = (page) => {
    this.setState({activePage: page})
  }

  render() {
    const currenciesPerPage = 20;
    let changes = this.getChanges();

    return (
      <div>
        <h2>Currencies on {this.state.currentDate}</h2>
        <div className="search">
          <form>
            <label className="sr-only" htmlFor="currencyName">Find currency</label>
            <input type="text" className="form-control mb-2 mr-sm-2 currencyName" id="currencyName" placeholder="E.g. GBP,PLN" onChange={this.handleCurrencyNameChange} />
          </form>
        </div>
        <nav className="dayNav" role="group" aria-label="Change date">
          {this.state.currentDate !== Object.keys(this.state.days)[1] && (
            <button type="button" className="btn btn-primary" onClick={this.handlePrevDayClick}>&larr; Previous day</button>
          )}
          {this.state.currentDate !== Object.keys(this.state.days)[Object.keys(this.state.days).length - 1] && (
            <button type="button" className="btn btn-primary" onClick={this.handleNextDayClick}>Next day &rarr;</button>
          )}
        </nav>
        <table>
          <thead>
            <tr>
              <th className={this.getHeaderClassName('currency')} onClick={(e) => this.handleHeaderClick(e, 'currency')}>Currency</th>
              <th className={this.getHeaderClassName('rate')} onClick={(e) => this.handleHeaderClick(e, 'rate')}>Price</th>
              <th className={this.getHeaderClassName('change')} onClick={(e) => this.handleHeaderClick(e, 'change')}>Change</th>
            </tr>
          </thead>
          <tbody>
            {changes.slice(currenciesPerPage * (this.state.activePage - 1), currenciesPerPage * this.state.activePage).map((row, i) => 
              <InstrumentsRow
                row={row}
                key={row.currency}
              />
            )}
          </tbody>
          {(changes.length > currenciesPerPage) && (
            <tfoot>
              <tr>
                <td colspan="3">
                  <nav className="currencies-pages">
                    <Pagination
                      activePage={this.state.activePage}
                      itemsCountPerPage={currenciesPerPage}
                      totalItemsCount={changes.length}
                      pageRangeDisplayed={5}
                      onChange={(pageNumber) => this.handlePageChange(pageNumber)}
                      hideDisabled={true}
                      nextPageText="&raquo;"
                      prevPageText="&laquo;"
                      hideFirstLastPages={true}
                      itemClass="page-item"
                      linkClass="page-link"
                      innerClass="pagination justify-content-center"
                    />
                  </nav>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    )
  }
}

export default Instruments;