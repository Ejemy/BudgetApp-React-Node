import "./styles.css";

import { useState, useEffect } from "react";

function CategoryAmount({ parentCallback, idval, val }) {
  return (
    <input
      className="categorybox"
      placeholder="Budgeted"
      id="categoryamount"
      value={val}
      onChange={(event) => parentCallback(event, idval)}
    />
  );
}

function CategoryName({ categname, idval, val }) {
  return (
    <div  className="category">
      <input type="checkbox" id={idval} value="savings" className="checkbox" />
      <input
        placeholder="Category"
        className="category-name"
        value={val[1]}
        onChange={(event) => categname(event, idval)}
      />
    </div>
  );
}

function AmountBox({ Numvalue, Spent }) {
  const [numval, setNumval] = useState(Numvalue);

  useEffect(() => {
    setNumval(Numvalue);
  }, [Numvalue]);
  return (
    <div className="amount-children" id="amountbox">
      ¥{(numval - Spent).toLocaleString()}
    </div>
  );
}

function NewBox({ handleClick, title }) {
  return <button className="newbutton" onClick={handleClick}>{title}</button>;
}

function TransCat({ categories, change, index }) {
  return (
    <select
      name="dropdown"
      className="options"
      onChange={(event) => change(event, index)}
    >
      <option className="firstoption"></option>
      {categories.map((item, index) => (
        <option value={item[0]}>{item[0]}</option>
      ))}
    </select>
  );
}

function Row({
  index,
  boxvalue,
  handleCatOption,
  inputCallback,
  nameCallback
}) {
  return (
    <div className="row-transaction">
      <input
        placeholder={index}
        className="trans-name"
        onChange={(eventData) => nameCallback(eventData, index)}
      />
      <input placeholder="Date" className="date" type="date" />
      <TransCat
        categories={boxvalue}
        change={(extra) => handleCatOption(extra, index)}
      />
      <input
        placeholder="Expenditure"
        className="expend"
        id="out"
        onChange={(eventData) => inputCallback(eventData, index)}
      />
      <input
        placeholder="Income"
        className="income"
        id="in"
        onChange={(eventData) => inputCallback(eventData, index)}
      />
    </div>
  );
}

export default function App() {
  //boxvlue = [id, category, budgetamount, spent]
  const [boxvalue, setBoxvalue] = useState(Array(3).fill([]));
  const [total, setTotal] = useState(0);
  //transaction = [name, category, expense, income]
  const [transaction, setTransaction] = useState(Array(5).fill(["", "", 0, 0]));
  //Backend
  const [backend, setBackend] = useState({});

  useEffect(() => {
    fetch("/load")
    .then(response => response.json())
    .then(data => {
      let stuff = boxvalue.slice()
      console.log("Slice", stuff)
      for(let i in data){
        stuff[i] = [data[i]._id, data[i].name, data[i].amount, data[i].spent] ;
      }
      setBoxvalue(stuff)
    })
  }, [])

  useEffect(() => {
    console.log("box", boxvalue)
    fetch("/update", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(boxvalue)})
    .then(response=> response.json())
    .then(
      data=> {
        console.log("/update response data: ", data)
      }
    )
  }, boxvalue);


  function modifyNum(arr, filterArr) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j].match(/\d/)) {
        filterArr.push(arr[j]);
      }
    }

    const boxvalstr = filterArr.join("");
    return boxvalstr;
  }

  function handleInput(event, id) {
    const nextBoxVal = boxvalue.slice();
    let val = event.target.value;
    const nextTransaction = transaction.slice();

    //out transactions
    if (event.target.id === "out") {
      //if OUT then cross check category names and change boxvalue?
      //This LOOP formats transaction numbers
      for (let index = 0; index < nextTransaction.length; index++) {
        if (id === index) {
          const arr = [...val];
          const filterArr = [];
          const boxstr = modifyNum(arr, filterArr);
          const str = boxstr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          event.target.value = "¥" + str;
          nextTransaction[index] = [
            nextTransaction[index][0],
            nextTransaction[index][1],
            parseFloat(boxstr),
            nextTransaction[index][3]
          ];
        }
      }
      setTransaction(nextTransaction);
    } else if (event.target.id === "in") {
      for (let index = 0; index < nextTransaction.length; index++) {
        if (id === index) {
          const arr = [...val];
          const filterArr = [];
          const boxstr = modifyNum(arr, filterArr);
          const str = boxstr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          event.target.value = "¥" + str;
          nextTransaction[index] = [
            nextTransaction[index][0],
            nextTransaction[index][1],
            nextTransaction[index][2],
            parseFloat(boxstr)
          ];
        }
      }
      setTransaction(nextTransaction);
    } else {
      let tot = 0;
      for (let i = 0; i < nextBoxVal.length; i++) {
        if (i === id) {
          const arr = [...val];
          const filterArr = [];
          const boxstr = modifyNum(arr, filterArr);
          const str = boxstr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          event.target.value = "¥" + str;
          nextBoxVal[id] = [
            nextBoxVal[id][0],
            nextBoxVal[id][1],
            parseFloat(boxstr),
            nextBoxVal[id][3]
          ];
        }
        tot += nextBoxVal[i][2];
      }
      setBoxvalue(nextBoxVal);
      setTotal(tot);
    }

    for (let x = 0; x < nextBoxVal.length; x++) {
      let spent = 0;
      for (let ii = 0; ii < nextTransaction.length; ii++) {
        if (
          nextBoxVal[x][1] === nextTransaction[ii][1] &&
          nextTransaction[ii][2] > 0
        ) {
          spent += nextTransaction[ii][2];
        } else if (
          nextBoxVal[x][1] === nextTransaction[ii][1] &&
          nextTransaction[ii][3] > 0
        ) {
          spent -= nextTransaction[ii][3];
        }
      }
      nextBoxVal[x] = [nextBoxVal[x][0], nextBoxVal[x][1], nextBoxVal[x][2], spent];
      setBoxvalue(nextBoxVal);
    }
  }

  function handleCatName(event, id) {
    // want to save name to database. This isnt working though?

    const nextBox = boxvalue.slice();
    for (let i = 0; i <= nextBox.length; i++) {
      if (i === id) {
        nextBox[i] = [id, event.target.value, nextBox[i][2], nextBox[i][3]];
      }
    }
    setBoxvalue(nextBox);
  }

  function handleCatOption(event, index) {
    const tempTransaction = transaction.slice();
    tempTransaction[index] = [
      tempTransaction[index][0],
      event.target.value,
      tempTransaction[index][2],
      tempTransaction[index][3]
    ];
    setTransaction(tempTransaction);
  }

  function newRow() {
    setTransaction([["", "", 0, 0], ...transaction]);
  }

  function transName(data, index) {
    const tempTrans = transaction.slice();
    tempTrans[index] = [
      data.target.value,
      tempTrans[index][1],
      tempTrans[index][2],
      tempTrans[index][3]
    ];
    setTransaction(tempTrans);
  }



  return (
    <div className="App">
      <h1> Budget thingy </h1>
      <div className="budget">
        <div className="categorydiv">
          {boxvalue.map((value, index) => (
            <CategoryName key={index} idval={index} val={value} categname={handleCatName} />
          ))}
        </div>
        <div className="categoryamount" id="inputamount">
          {boxvalue.map((value, index) => (
            <CategoryAmount
              key={index}
              idval={index}
              val = {value[2]}
              parentCallback={(x, y) => handleInput(x, y)}
            />
          ))}
        </div>
        <div className="amount-box" id="amountdiv">
          {boxvalue.map((value, index) => (
            <AmountBox
              key={index}
              idval={index}
              Numvalue={value[2]}
              Spent={value[3]}
            />
          ))}
        </div>
        <div className="newcat">
          <NewBox
            title="New Category"
            handleClick={() => setBoxvalue([...boxvalue, [0, "", 0, 0]])}
          />
        </div>
        <div className="total-amount" id="total">
          <p>Total: ¥{total.toLocaleString()}</p>
        </div>
      </div>
      <div className="newrow">
        <button className="newbutton" onClick={() => newRow()}>
          New Row
        </button>
      </div>
      <div className="transactions">
        {transaction.map((event, index) => (
          <Row
            index={index}
            data={event}
            boxvalue={boxvalue}
            handleCatOption={handleCatOption}
            inputCallback={(x, y) => handleInput(x, y)}
            nameCallback={(x, y) => transName(x, y)}
            key={index}
          />
        ))}
      </div>

      
    </div>
  );
}
