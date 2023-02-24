import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import ReactDOM from "react-dom";

import GarageImage from "./assets/garage.png";
import ConstructionImage from "./assets/newConstruction.png";

const DESIGN_COST = 10_000;
const TITLE_24_COST = 500;
const UTILIES_COST = 20_000;

const HILLSIDE_RATE = 1.25;

const INITIAL_AREA_COST = 350;
const ADDL_AREA_COST = 300;
const INITAL_AREA_CUTOFF = 500;
const LOW_HIGH_RANGE = 0.15;

const TYPES = {
  garage_studio: {
    name: "Garage conversion studio",
    area: 400,
    permit: 3000,
    engineering: 1000,
    solar: 0,
    discountRate: 0.65,
    contingencyRate: 0.2,
    survey: 0,
    img: GarageImage,
  },
  detached_studio: {
    name: "Detached new build studio",
    area: 400,
    permit: 4000,
    engineering: 1500,
    solar: 10000,
    discountRate: 1,
    contingencyRate: 0.1,
    survey: 2000,
    img: ConstructionImage,
  },
  detached_1br: {
    name: "Detached new build 1 bedroom",
    area: 600,
    permit: 5000,
    engineering: 2000,
    solar: 15000,
    discountRate: 1,
    contingencyRate: 0.1,
    survey: 2000,
    img: ConstructionImage,
  },
  detached_2br: {
    name: "Detached new build 2 bedroom",
    area: 750,
    permit: 6000,
    engineering: 2500,
    solar: 17500,
    discountRate: 1,
    contingencyRate: 0.1,
    survey: 2000,
    img: ConstructionImage,
  },
  detached_3br: {
    name: "Detached new build 3 bedroom",
    area: 900,
    permit: 8000,
    engineering: 3000,
    solar: 20000,
    discountRate: 1,
    contingencyRate: 0.1,
    survey: 2000,
    img: ConstructionImage,
  },
};

const DOLLAR_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
function Dollars({ amount }) {
  return DOLLAR_FORMATTER.format(amount);
}

class Viewer extends React.Component {
  render() {
    const type = TYPES[this.props.type];
    const area = type.area;
    const surveyCost = type.survey;
    const permitCost = type.permit;
    const engineeringCost = type.engineering;
    const solarCost = type.solar;
    const contingencyRate = type.contingencyRate;

    const initialArea = Math.min(area, INITAL_AREA_CUTOFF);
    const addlArea = Math.max(area - INITAL_AREA_CUTOFF, 0);

    let mid =
      (initialArea * INITIAL_AREA_COST + addlArea * ADDL_AREA_COST) *
      type.discountRate;
    let low = mid * (1 - LOW_HIGH_RANGE);
    let high = mid * (1 + LOW_HIGH_RANGE);

    if (this.props.utilities) {
      low += UTILIES_COST;
      mid += UTILIES_COST;
      high += UTILIES_COST;
    }

    if (this.props.hillside) {
      low *= HILLSIDE_RATE;
      mid *= HILLSIDE_RATE;
      high *= HILLSIDE_RATE;
    }

    const designCost = DESIGN_COST * (this.props.hillside ? HILLSIDE_RATE : 1);

    const sharedCosts =
      surveyCost +
      designCost +
      permitCost +
      engineeringCost +
      TITLE_24_COST +
      solarCost;

    const lowContingency = low * contingencyRate;
    const midContingency = mid * contingencyRate;
    const highContingency = high * contingencyRate;

    const lowTotal = sharedCosts + low + lowContingency;
    const midTotal = sharedCosts + mid + midContingency;
    const highTotal = sharedCosts + high + highContingency;

    return (
      <div className="viewer">
        <div className="results-description">
          We estimate that your project will cost{" "}
          <strong>
            <Dollars amount={midTotal} />
          </strong>{" "}
          with a likely range of <Dollars amount={lowTotal} /> to{" "}
          <Dollars amount={highTotal} />.
        </div>
        <div className="results-explanation">
          Below is a detailed breakdown of this estimate. You can change the ADU
          details to see how the estimate changes.
        </div>
        <div className="viewer-options">
          <div>
            <span className="viewer-option-label">ADU Type:</span>
            <select
              onChange={(e) => this.props.updateType(e.target.value)}
              autoFocus={true}
              value={this.props.type}
            >
              {Object.keys(TYPES).map((type) => {
                return (
                  <option key={type} value={type}>
                    {TYPES[type].name}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="viewer-option-label" htmlFor="utilities-picker">
              Include separate water and gas?
            </label>
            <select
              id="utilities-picker"
              onChange={(e) =>
                this.props.updateUtilities(e.target.value == "true")
              }
              value={this.props.utilities}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>
          <div>
            <label className="viewer-option-label" htmlFor="hillside-picker">
              Is home located on hillside?
            </label>
            <select
              id="hillside-picker"
              onChange={(e) =>
                this.props.updateHillside(e.target.value == "true")
              }
              value={this.props.hillside}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>
        </div>
        <table className="cost-table">
          <thead>
            <tr>
              <td></td>
              <td>Low estimate</td>
              <td>Medium estimate</td>
              <td>High estimate</td>
            </tr>
          </thead>
          <tbody>
            {surveyCost === 0 ? null : (
              <tr>
                <td>
                  <div className="line-item-text">Boundary survey</div>
                  <div
                    className="tooltip"
                    data-tooltip="This is a type of land survey that outlines the boundaries of a specific parcel This proves that a property is in compliance with zoning regulations and local government ordinances, and confirms your ownership of the parcel."
                  ></div>
                </td>
                <td>
                  <Dollars amount={surveyCost} />
                </td>
                <td>
                  <Dollars amount={surveyCost} />
                </td>
                <td>
                  <Dollars amount={surveyCost} />
                </td>
              </tr>
            )}
            <tr>
              <td>
                <div className="line-item-text">
                  Designs and permitting fees
                </div>
                <div
                  className="tooltip"
                  data-tooltip="These are a full set of architectural plans (e.g. a floor plan, designs, etc.) and permit application fees. When you apply for a permit, your city may charge you fees associated with new construction (such as a school district fee and energy surcharge). These fees vary from city to city."
                ></div>
              </td>
              <td>
                <Dollars amount={designCost + permitCost} />
              </td>
              <td>
                <Dollars amount={designCost + permitCost} />
              </td>
              <td>
                <Dollars amount={designCost + permitCost} />
              </td>
            </tr>
            <tr>
              <td>
                <div className="line-item-text">
                  Structural engineering report
                </div>
                <div
                  className="tooltip"
                  data-tooltip="This report confirms that your building plans meet the state's building code and safety requirements."
                ></div>
              </td>
              <td>
                <Dollars amount={engineeringCost} />
              </td>
              <td>
                <Dollars amount={engineeringCost} />
              </td>
              <td>
                <Dollars amount={engineeringCost} />
              </td>
            </tr>
            <tr>
              <td>
                <div className="line-item-text">
                  Title 24 energy calculations
                </div>
                <div
                  className="tooltip"
                  data-tooltip="This is a report that estimates the ADU's energy usage and confirms that the plans meet the state's energy efficiency requirements for new construction."
                ></div>
              </td>
              <td>
                <Dollars amount={TITLE_24_COST} />
              </td>
              <td>
                <Dollars amount={TITLE_24_COST} />
              </td>
              <td>
                <Dollars amount={TITLE_24_COST} />
              </td>
            </tr>
            {solarCost === 0 ? null : (
              <tr>
                <td>
                  <div className="line-item-text">Solar installation</div>
                  <div
                    className="tooltip"
                    data-tooltip="New construction ADUs are typically required to install solar panels (garage conversions are exempted). You can also meet this requirement by installing solar panels on the primary dwelling unit."
                  ></div>
                </td>
                <td>
                  <Dollars amount={solarCost} />
                </td>
                <td>
                  <Dollars amount={solarCost} />
                </td>
                <td>
                  <Dollars amount={solarCost} />
                </td>
              </tr>
            )}
            <tr>
              <td>
                <div className="line-item-text">Hard construction costs</div>
                <div
                  className="tooltip"
                  data-tooltip="This includes labor, building materials, appliances, fixtures/finishes, HVAC, and utilities."
                ></div>
              </td>
              <td>
                <Dollars amount={low} />
              </td>
              <td>
                <Dollars amount={mid} />
              </td>
              <td>
                <Dollars amount={high} />
              </td>
            </tr>
            <tr>
              <td>
                <div className="line-item-text">Contingency</div>
                <div
                  className="tooltip"
                  data-tooltip="This is an amount of money set aside to cover any unexpected costs that can arise throughout a construction project."
                ></div>
              </td>
              <td>
                <Dollars amount={lowContingency} />
              </td>
              <td>
                <Dollars amount={midContingency} />
              </td>
              <td>
                <Dollars amount={highContingency} />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="total-cost-row">
              <td>Total cost</td>
              <td>
                <Dollars amount={lowTotal} />
              </td>
              <td>
                <Dollars amount={midTotal} />
              </td>
              <td>
                <Dollars amount={highTotal} />
              </td>
            </tr>
            <tr>
              <td>Cost per square foot</td>
              <td>
                <Dollars amount={lowTotal / area} />
              </td>
              <td>
                <Dollars amount={midTotal / area} />
              </td>
              <td>
                <Dollars amount={highTotal / area} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }
}

class TypePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state.value = props.defaultValue;
  }

  render() {
    const options = {};
    Object.keys(TYPES).forEach(
      (type) => (options[type] = { value: type, label: TYPES[type].name })
    );

    return (
      <div className="picker type-picker">
        <div className="prompt">What type of unit to build?</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.props.onNext(this.state.value);
          }}
        >
          {Object.keys(TYPES).map((value) => {
            const type = TYPES[value];
            const classes = ["type-option"];
            if (value === this.state.value) {
              classes.push("selected");
            }
            return (
              <label key={value} className={classes.join(" ")}>
                <input
                  type="radio"
                  name="type"
                  value={value}
                  id={value}
                  checked={value === this.state.value}
                  autoFocus={value === this.props.defaultValue}
                  onChange={() => this.setState({ value })}
                  className="type-input"
                />

                <img src={type.img} className="type-img" />
                <div>{type.name}</div>
              </label>
            );
          })}
          <button disabled={this.state.value == null} className="next">
            Next
          </button>
        </form>
      </div>
    );
  }

  state = {
    value: null,
  };
}

class Picker extends React.Component {
  constructor(props) {
    super(props);
    this.state.value = props.defaultValue;
  }

  render() {
    return (
      <div className="picker">
        <div className="prompt">{this.props.prompt}</div>
        {this.props.explanation == null ? null : (
          <div className="explanation">{this.props.explanation}</div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.props.onNext(this.state.value);
          }}
        >
          {Object.keys(this.props.options).map((key) => {
            const option = this.props.options[key];
            const label = option.label;
            const value = option.value;

            return (
              <div key={key}>
                <input
                  type="radio"
                  name="type"
                  value={value}
                  id={key}
                  checked={value === this.state.value}
                  autoFocus={value === this.props.defaultValue}
                  onChange={() => this.setState({ value })}
                />
                <label htmlFor={key}>{label}</label>
              </div>
            );
          })}
          <button disabled={this.state.value == null} className="next">
            Next
          </button>
        </form>
      </div>
    );
  }

  state = {
    value: null,
  };
}

class Intro extends React.Component {
  render() {
    return (
      <div>
        <div className="prompt">
          Calculate the cost of building
          <br />
          an accessory dwelling unit
        </div>
        <button onClick={this.props.onNext} autoFocus className="next">
          Begin
        </button>
      </div>
    );
  }
}

class ADUCalculator extends React.Component {
  render() {
    if (!this.state.intro) {
      return <Intro onNext={() => this.setState({ intro: true })} />;
    }
    if (this.state.type == null) {
      const options = {};
      Object.keys(TYPES).forEach(
        (type) => (options[type] = { value: type, label: TYPES[type].name })
      );

      return (
        <TypePicker onNext={this._updateType} defaultValue="garage_studio" />
      );
    }
    if (this.state.utilities == null) {
      return (
        <Picker
          key="utilities"
          onNext={this._updateUtilities}
          prompt="Include separate water and gas?"
          explanation="If you plan to rent out your ADU, you may want the utilities on separate meters, so your tenant's utility bills will be separate from yours."
          defaultValue={false}
          options={{
            true: {
              label: "Yes",
              value: true,
            },
            false: {
              label: "No",
              value: false,
            },
          }}
        />
      );
    }
    if (this.state.hillside == null) {
      return (
        <Picker
          key="hillside"
          onNext={this._updateHillside}
          prompt="Is home located on hillside?"
          explanation="Construction on slopes or hillside requires additional design and site prep work, like grading the surface or providing additional support for the structure."
          defaultValue={false}
          options={{
            true: {
              label: "Yes",
              value: true,
            },
            false: {
              label: "No",
              value: false,
            },
          }}
        />
      );
    }
    return (
      <Viewer
        type={this.state.type}
        utilities={this.state.utilities}
        hillside={this.state.hillside}
        updateType={this._updateType}
        updateUtilities={this._updateUtilities}
        updateHillside={this._updateHillside}
      />
    );
  }

  _updateType = (type) => {
    this.setState({ type });
  };

  _updateUtilities = (utilities) => {
    console.log("utilities", utilities);
    this.setState({ utilities });
  };

  _updateHillside = (hillside) => {
    this.setState({ hillside });
  };

  state = {
    intro: false,
    type: null,
    utilities: null,
    hillside: null,
  };
}

const interval = setInterval(function () {
  const calculatorRoot = document.getElementById("calculatorRoot");
  if (calculatorRoot == null) {
    return;
  }
  clearInterval(interval);
  createRoot(calculatorRoot).render(
    <React.StrictMode>
      <ADUCalculator />
    </React.StrictMode>
  );
}, 16);
