let dropDownShown = false;
let infoClicked = false;

// Holds current state of on-screen tools.
// Either 'pka' or 'titrate'
let currentView = 'pka';

// This holds graph state to be used when resizing
const graphState = {};

// This holds the current state of the animated gif in pka view.

let showGif = true;

/*
  This function is responsible for creating the initial view of the
  webpage. Including the default Acetic Acid selection and
  loading the acid list.
*/
window.onload = () => {
  // Preload Acetic Acid
  getAcidPkas(4.7, null, null, "Acetic Acid");

  // Add acids to the dropdown.
  // This array comes from acids.js
  const dropdown = document.getElementById("acid_buttons");
  acids.forEach((acid) => {
    dropdown.innerHTML += `<button 
        onclick="getAcidPkas(${acid.pka1}, ${acid.pka2}, ${acid.pka3}, '${acid.name}')">
         ${acid.name}
       </button>`;
  });

  // At start, view pka. Disable titrate.
  const titrateContainer = document.getElementById('titrateContainer')
  titrateContainer.style['display'] = 'none';
};

function transpose2d(arr) {
  const newArr = [];
  for (i = 0; i < arr[0].length; i++) {
    newArr.push([]);
    for (j = 0; j < arr.length; j++) {
      newArr[i].push(arr[j][i]);
    }
  }
  return newArr;
}

function calcFractions(pH) {
  let protonNum = graphState.pkaList.length;
  let fractions = [];
  let ka1 = Math.pow(10, -graphState.pkaList[0]);
  let h = Math.pow(10, -pH);

  if (protonNum == 1) {
    fractions.push(h / (h + ka1));
    fractions.push(ka1 / (h + ka1));
  } else if (protonNum == 2) {
    let ka2 = Math.pow(10, -graphState.pkaList[1]);
    let d = h * h + ka1 * h + ka1 * ka2;
    fractions.push((h * h) / d);
    fractions.push((ka1 * h) / d);
    fractions.push((ka1 * ka2) / d);
  } else if (protonNum == 3) {
    let ka2 = Math.pow(10, -graphState.pkaList[1]);
    let ka3 = Math.pow(10, -graphState.pkaList[2]);
    let d =
      Math.pow(h, 3) + Math.pow(h, 2) * ka1 + h * ka1 * ka2 + ka1 * ka2 * ka3;
    fractions.push(Math.pow(h, 3) / d);
    fractions.push((Math.pow(h, 2) * ka1) / d);
    fractions.push((h * ka1 * ka2) / d);
    fractions.push((ka1 * ka2 * ka3) / d);
  }
  return fractions;
}

function displayFractions() {
  let pH = parseFloat(document.getElementById("userPH").value);
  if (isNaN(pH)) {
    alert("Please enter a number into the text input.");
    return;
  }

  const fractions = calcFractions(pH);
  const parent = document.getElementById("calculatorSection");

  // Clear all html within old h3 children
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (child.tagName === "H3") {
      child.innerHTML = "";
    }
  }

  // Insert new alphas
  fractions.forEach((fraction, index) => {
    const oldAlpha = document.getElementById(`userAlpha${index}`);
    const newAlpha = document.createElement("h3");
    newAlpha.innerHTML = `<b>\u03B1${index} = ${fraction.toFixed(5)}</b>`;
    newAlpha.setAttribute("id", `userAlpha${index}`);
    parent.replaceChild(newAlpha, oldAlpha);
  });
}

function setUserPkas() {
  if (isNaN(parseFloat(document.getElementById("pka1Input").value))) {
    alert(
      "Please select an acid or enter at least a pka1 value before graphing."
    );
    return;
  }

  let pka1 = parseFloat(document.getElementById("pka1Input").value);
  let pka2 = parseFloat(document.getElementById("pka2Input").value);
  let pka3 = parseFloat(document.getElementById("pka3Input").value);
  graphState.pkaList = [];
  let outOfOrder = false;

  if (!isNaN(pka2)) {
    if (pka2 <= pka1) {
      outOfOrder = true;
    }
  }
  if (!isNaN(pka3)) {
    if (pka3 <= pka1 || pka3 <= pka2) {
      outOfOrder = true;
    }
  }

  if (outOfOrder) {
    alert("pka values should be as such: pka1 < pka2 < pka3.");
    return;
  }

  // Remove possible table background image
  const table = document.getElementById("tableSection");
  table.style["background-image"] = "url()";

  graphState.acidName = `Unknown Chemical<br>pK<sub>a</sub> values: ${pka1}, ${pka2}, ${pka3}`;
  // Was pkaList.push(pka1, pka2, pka3);
  graphState.pkaList = [pka1, pka2, pka3];

  graphPkaValues();
}

function graphPkaValues() {
  let Xs = [];
  let Ys = [];
  let notAtLim = true;
  let i = 0;

  // keep calculating fractions until every species is at 100% at some point in
  // the graph, or at least fill the graph from 0-14
  for (; notAtLim || i < 141; i++) {
    Xs.push(i / 10);
    Ys.push(calcFractions(Xs[i]));
    if (i >= 10 && Ys[i - 10][graphState.pkaList.length] >= 0.999) {
      notAtLim = false;
    }
  }

  // If a0 is never 100% (for very strong acid) then calculate fractions at pH
  // lower than zero until every species is at 100% at some point on the graph
  if (Ys[10][0] < 0.999) {
    i = 1;
    for (; Ys[10][0] < 0.999; i++) {
      Xs.unshift(-i / 10);
      Ys.unshift(calcFractions(-i / 10));
    }
  }

  Ys = transpose2d(Ys);
  const colors = ['#69a3ff', '#0175fa', '#004bc6', '#001255'];
  // const colors = ["#b0bec5", "#78909c", "#455a64", "#263238"];
  const data = [];
  for (i = 0; i < Ys.length; i++) {
    let trace = {
      x: Xs,
      y: Ys[i],
      type: "scatter",
      name: "\u03B1" + i,
      line: {
        color: colors[i],
        width: 4,
      },
    };
    data.push(trace);
  }
  let layout = {
    title: `<b style="color: #1c313a;">${graphState.acidName}</b>`,
    titlefont: {
      family: "arial, sans-serif",
      size: 28,
    },
    xaxis: {
      title: '<b style="color: #1c313a;">pH</b>',
      titlefont: {
        family: "arial, sans-serif",
        size: 24,
      },
      tickfont: {
        family: "sans-serif",
        size: 18,
      },
    },
    yaxis: {
      title: '<b style="color: #1c313a;">Ion Fraction</b>',
      titlefont: {
        family: "arial, sans-serif",
        size: 24,
      },
      tickfont: {
        family: "sans-serif",
        size: 18,
      },
    },
  };

  const plotArea = document.getElementById("graph");

  // Remove display style from graph's div
  plotArea.style.display = "block";
  plotArea.innerHTML = "";

  Plotly.newPlot("graph", data, layout, {
    showSendToCloud: true,
  });

  // Replacing Table Data
  const acidTable = document.getElementById("acidTable");
  const baseTable = document.getElementById("baseTable");
  const header = `<tr>
        <th>pH</th>
        <th>&alpha;0</th>
        <th>&alpha;1</th>
        <th>&alpha;2</th>
        <th>&alpha;3</th>
      </tr>`;

  acidTable.innerHTML = header;
  baseTable.innerHTML = header;

  for (i = 0; i <= 14; i++) {
    const fractions = calcFractions(i);
    if (i <= 7) acidTable.innerHTML += createDataRow(fractions, i);
    if (i >= 7) baseTable.innerHTML += createDataRow(fractions, i);
  }
}

function createDataRow(fractions, ph) {
  //Build the new row
  function fractionsToHTML(fractions) {
    const stringFractions = fractions.map((frac) => {
      return frac.toFixed(5).toString();
    });
    const html = `
    <td>${stringFractions[0] || "-"}</td>
    <td>${stringFractions[1] || "-"}</td>
    <td>${stringFractions[2] || "-"}</td>
    <td>${stringFractions[3] || "-"}</td>
    `;
    return html;
  }

  return `<tr><th>${ph}.0</th>${fractionsToHTML(fractions)}</tr>`;
}

/*  Update the pka text inputs in the left sidebar to match the
    range slider.
*/
function updateInput(inputID, inputValue) {
  const inputElement = document.getElementById(inputID);
  inputElement.value = inputValue;
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function toggleDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
  if (!dropDownShown) {
    //document.getElementById("userPkaInput").style.display = "none";
    dropDownShown = true;
  } else {
    //document.getElementById("userPkaInput").style.display = "block";
    dropDownShown = false;
  }
}

function filterFunction() {
  let input, filter, ul, li, acidButtonsArr, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  acidButtonsArr = div.getElementsByTagName("button");
  for (i = 0; i < acidButtonsArr.length; i++) {
    txtValue = acidButtonsArr[i].textContent;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      acidButtonsArr[i].style.display = "";
    } else {
      acidButtonsArr[i].style.display = "none";
    }
  }
}

function getAcidPkas(pka1, pka2, pka3, name) {
  // Set Table Background image
  const table = document.getElementById("tableSection");
  if (showGif)
    table.style["background-image"] = `url('gifs/${name}.gif')`;

  graphState.acidName = name;
  graphState.pkaList = [];
  graphState.pkaList.push(pka1);
  if (pka2 != null) {
    graphState.pkaList.push(pka2);
  }
  if (pka3 != null) {
    graphState.pkaList.push(pka3);
  }
  graphPkaValues();
}

function infoClick() {
  infoClicked = true;
  alert(
    "\u2022You can save a text file of ion fraction values from a start pH to a final pH. \n\n\u2022The pH value increases by steps of 1/10 a pH value. \n\n\u2022The file pkaAnalyzerData.txt will be saved to your Downloads folder. \n\n\u2022Data is saved as a Tab-Separated-Values file."
  );
}

function download(filename, text) {
  var elem = document.createElement("a");
  elem.style.display = "none";
  // Define the data of the file using encode URIComponent
  elem.setAttribute(
    "href",
    "data:text/plain;charset-utf-8," + encodeURIComponent(text)
  );
  // Add the download attribute of the hidden link
  elem.setAttribute("download", filename);
  document.body.appendChild(elem);
  //Simulate click of the created link
  elem.click();
  document.body.removeChild(elem);
}

function makeFileText() {
  if (infoClicked) {
    infoClicked = false;
    return;
  }
  let start = parseFloat(document.getElementById("pHstart").value);
  let final = parseFloat(document.getElementById("pHfinal").value);

  if (isNaN(start) || isNaN(final)) {
    alert("Please enter a numeric value for the start and final pH values.");
    return;
  }

  let fileString = "pH\t\u03B10\t\u03B11\t\u03B12\t\u03B13\r\n";

  for (let i = start; i <= final; i += 0.1) {
    const fractions = calcFractions(i);
    fileString += i.toFixed(1).toString(10) + "\t";
    fractions.forEach((fraction, index) => {
      fileString += fraction.toFixed(5).toString(10);
      if (index < fractions.length - 1) fileString += "\t";
    });
    if (i < (final - start) * 10) {
      fileString += "\r\n";
    }
  }

  download("pKAnalyzer.tsv", fileString);
}

/*
  This function is responsible for resizing the graph when the size of 
  the viewport changes. This keeps the graph looking nice if the user
  plays with our window.
*/
function resizeGraph() {
  graphPkaValues();
}

/*
  This function disables/enables the animated gif in pka view.
  Then this function updates the current state.
*/
function switchGif() {
  const table = document.getElementById("tableSection");
  const gifSwitch = document.getElementById("gifSwitch");
  
  if (showGif) {
    table.style['background-image'] = "url('')";
    gifSwitch.innerText = 'Enable Gif';

    showGif = false;
  } else {
    // Use Graph State to find the acid name. 
    // If the acid is unknown then just update state
    const acidName = graphState.acidName;
    if (!acidName.includes('Unknown'))
      table.style['background-image'] = `url('gifs/${acidName}.gif')`;
    gifSwitch.innerText = 'Disable Gif';
    
    showGif = true;
  }
}


/*
  This function is responsible for switching
  between the pka analyzer and the titration
  analyzer
*/
function switchViews() {
  const pkaContainer = document.getElementById('pkaContainer')
  const titrateContainer = document.getElementById('titrateContainer')
  
  if (currentView === 'pka') {
    // Switch from pka to titrate
    pkaContainer.style.display = 'none';
    titrateContainer.style.display = 'grid';
    
    currentView = 'titrate'
  } else {
    // Switch from pka to titrate
    titrateContainer.style.display = 'none';
    pkaContainer.style.display = 'grid';

    currentView = 'pka'
  }
}

/*
  This function takes:
    c0: Initial molar concentration of the titrand
    ct: Initial molar concentration of titrant
    k: ionization constant of the titrand

  This function should use these inputs with the proper formulae to generate
  points along a titration curve.

  I'm starting with strong base/strong acid titrations for testing
*/
function calculateTitrationCurve(c0, ct, k) {
  // This function create an array, modeled on Python's range()
  function range(start, end, step = 1) {
    const len = Math.floor((end - start) / step);
    return Array(len)
      .fill()
      .map((_, i) => start + i * step);
  }

  console.log(range(0, 10, 0.1));

  // Water Ionization Constant
  const kw = Math.pow(10, -14);

  const initalpH = 14 - Math.log(c0);
  const equivPoint = -Math.log(kw) / 2;

  function pHBeforeEquiv(f) {
    return 14 - -Math.pow(c0) - -Math.log(1 - f);
  }

  function pHAfterEquiv(f) {
    return -Math.log(ct) + -Math.log(f - 1);
  }

  const degreeArray = range(0, 100, 0.01);

  function internalCalculator(eps) {
    degreeArray.forEach((f, i) => {
      const beforeEquiv = pHBeforeEquiv(f);
      const afterEquiv = pHAfterEquiv(f);
      if (equivPoint - beforeEquiv > eps) {
        degreeArray[i] = beforeEquiv;
      } else if (Math.abs(afterEquiv - beforeEquiv) < eps) {
        degreeArray[i] = equivPoint;
      } else {
        degreeArray[i] = afterEquiv;
      }
    });
  }

  internalCalculator(Math.pow(10, -6));

  return degreeArray;
}
