"use client"

import React, { useLayoutEffect, useState } from "react";

import IsoTopeGrid from "react-isotope";

import cardsLayout from "./cardsLayout.json";
import filtersjson from "./filters.json";

export default function App() {
  // Local state for managing filtering logic
  // useLayoutEffect(

  // )
  const [filters, updateFilters] = useState(filtersjson);

  // Filter change handler
  const onFilter = event => {
    const {
      target: { value, checked }
    } = event;

    updateFilters(state =>
      state.map(f => {
        if (f.label === value) {
          return {
            ...f,
            isChecked: checked
          };
        }

        return f;
      })
    );
  };

  return (
    <div className="App">
      {/*Filter component*/}
      <div className="filter-container">
        {filters.map(f => (
          <div className="filter" key={`${f.label}_key`}>
            <input
              id={f.label}
              type="checkbox"
              value={f.label}
              onChange={onFilter}
              checked={f.isChecked}
            />
            <label htmlFor={f.label}>{f.label}</label>
          </div>
        ))}
      </div>

      <div className="container">
        <IsoTopeGrid
          gridLayout={cardsLayout} // gridlayout of cards
          noOfCols={3} // number of columns show in one row
          unitWidth={200} // card width of 1 unit
          unitHeight={100} // card height of 1 unit
          filters={filters} // list of selected filters
        >
          {cardsLayout.map(card => (
            <div key={card.id} className={card.filter[0]}>
              {card.id}
            </div>
          ))}
        </IsoTopeGrid>
      </div>
    </div>
  );
}