import React from 'react';

function InstrumentsHeader(props) {
  const { currentDate, handleCurrentDateChange, days } = props
  return (
    <header className="header">
      <label htmlFor="currenciesDate" className="headerTitle">Currencies on</label>
      <select id="currenciesDate" value={currentDate} className="currentDate custom-select" onChange={handleCurrentDateChange}>
        {Object.keys(days).slice(1).map((row, i) =>
          <option key={row}>{row}</option>
        )}
      </select>
    </header>
  )
}

export default InstrumentsHeader;