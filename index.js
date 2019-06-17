let pkaList = [];
let firstGraph = true;
let firstCalc = true;
let dropDownShown = false;
let acidName;
let infoClicked = false;

function transpose2d(arr) {
  newArr = []
  for (i = 0; i < arr[0].length; i++) {
    newArr.push([]);
    for (j = 0; j < arr.length; j++) {
      newArr[i].push(arr[j][i]);
    }
  }
  return newArr;
}

function replaceTableData(parentID, oldDataID, newText, reset = false) {
  let parent = document.getElementById(parentID);
  let oldDataElement = document.getElementById(oldDataID);
  let newDataElement = document.createElement("td");
  newDataElement.setAttribute("id", oldDataID);
  if (reset) {
    newText = document.createTextNode(newText);
  } else {
    newText = document.createTextNode(newText.toFixed(5));
  }
  newDataElement.appendChild(newText);
  parent.replaceChild(newDataElement, oldDataElement);
}

function calcFractions(pH) {
  let protonNum = pkaList.length;
  let fractions = [];
  let ka1 = Math.pow(10, -pkaList[0]);
  let h = Math.pow(10, -pH);

  if (protonNum == 1) {
    fractions.push(h / (h + ka1));
    fractions.push(ka1 / (h + ka1));
  } else if (protonNum == 2) {
    let ka2 = Math.pow(10, -pkaList[1]);
    let d = (h * h) + (ka1 * h) + (ka1 * ka2);
    fractions.push((h * h) / d);
    fractions.push((ka1 * h) / d);
    fractions.push((ka1 * ka2) / d);
  } else if (protonNum == 3) {
    let ka2 = Math.pow(10, -pkaList[1]);
    let ka3 = Math.pow(10, -pkaList[2]);
    let d = Math.pow(h, 3) + Math.pow(h, 2) * ka1 + h * ka1 * ka2 + ka1 * ka2 * ka3;
    fractions.push(Math.pow(h, 3) / d);
    fractions.push((Math.pow(h, 2) * ka1) / d);
    fractions.push((h * ka1 * ka2) / d);
    fractions.push((ka1 * ka2 * ka3) / d);
  }
  return fractions;
}

function makeFileText() {
  if (infoClicked) {
    infoClicked = false;
    return;
  }
  if (firstGraph) {
    alert("Please select an acid or graph pka values before saving data.")
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
    fractions = calcFractions(i);
    fileString += (i).toFixed(1).toString(10) + "\t";
    for (let j = 0; j < fractions.length; j++) {
      fileString += fractions[j].toFixed(5).toString(10);
      if (j < fractions.length - 1) {
        fileString += "\t";
      }
    }
    if (i < (final - start) * 10) {
      fileString += "\r\n";
    }
  }
  return fileString;
}

function displayFractions() {

  if (firstGraph) {
    alert("Please select an acid or graph pka values before calculating fractions.");
    return
  }

  //reset the alpha values from the last calculation
  if (!firstCalc) {
    let pH = parseFloat(document.getElementById("userPH").value);
    let fractions = calcFractions(pH);
    let parent = document.getElementById("calculatorSection");

    let oldAlpha0 = document.getElementById("userAlpha0");
    let newAlpha0 = document.createElement("h3");
    newAlpha0.setAttribute("id", "userAlpha0");
    newAlpha0.setAttribute("style", "color:rgb(90, 97, 104)");
    let newNode0 = document.createTextNode("\u03B10 = ");
    newAlpha0.appendChild(newNode0);
    parent.replaceChild(newAlpha0, oldAlpha0);

    let oldAlpha1 = document.getElementById("userAlpha1");
    let newAlpha1 = document.createElement("h3");
    newAlpha1.setAttribute("id", "userAlpha1");
    newAlpha1.setAttribute("style", "color:rgb(90, 97, 104)");
    let newNode1 = document.createTextNode("\u03B11 = ");
    newAlpha1.appendChild(newNode1);
    parent.replaceChild(newAlpha1, oldAlpha1);

    let oldAlpha2 = document.getElementById("userAlpha2");
    let newAlpha2 = document.createElement("h3");
    newAlpha2.setAttribute("id", "userAlpha2");
    newAlpha2.setAttribute("style", "color:rgb(90, 97, 104)");
    let newNode2 = document.createTextNode("\u03B12 = ");
    newAlpha2.appendChild(newNode2);
    parent.replaceChild(newAlpha2, oldAlpha2);

    let oldAlpha3 = document.getElementById("userAlpha3");
    let newAlpha3 = document.createElement("h3");
    newAlpha3.setAttribute("id", "userAlpha3");
    newAlpha3.setAttribute("style", "color:rgb(90, 97, 104)");
    let newNode3 = document.createTextNode("\u03B13 = ");
    newAlpha3.appendChild(newNode3);
    parent.replaceChild(newAlpha3, oldAlpha3);
  }

  let pH = parseFloat(document.getElementById("userPH").value);
  if (isNaN(pH)) {
    return;
  }
  let fractions = calcFractions(pH);
  let parent = document.getElementById("calculatorSection");

  let oldAlpha0 = document.getElementById("userAlpha0");
  let newAlpha0 = document.createElement("h3");
  newAlpha0.setAttribute("id", "userAlpha0");
  newAlpha0.setAttribute("style", "color:rgb(90, 97, 104)");
  let newNode0 = document.createTextNode("\u03B10 = " + fractions[0].toFixed(5).toString(10));
  newAlpha0.appendChild(newNode0);
  parent.replaceChild(newAlpha0, oldAlpha0);

  let oldAlpha1 = document.getElementById("userAlpha1");
  let newAlpha1 = document.createElement("h3");
  newAlpha1.setAttribute("id", "userAlpha1");
  newAlpha1.setAttribute("style", "color:rgb(90, 97, 104)");
  let newNode1 = document.createTextNode("\u03B11 = " + fractions[1].toFixed(5).toString(10));
  newAlpha1.appendChild(newNode1);
  parent.replaceChild(newAlpha1, oldAlpha1);

  if (fractions.length > 2) {
    let oldAlpha2 = document.getElementById("userAlpha2");
    let newAlpha2 = document.createElement("h3");
    newAlpha2.setAttribute("id", "userAlpha2");
    newAlpha2.setAttribute("style", "color:rgb(90, 97, 104)");
    let newNode2 = document.createTextNode("\u03B12 = " + fractions[2].toFixed(5).toString(10));
    newAlpha2.appendChild(newNode2);
    parent.replaceChild(newAlpha2, oldAlpha2);
  }

  if (fractions.length > 3) {
    let oldAlpha3 = document.getElementById("userAlpha3");
    let newAlpha3 = document.createElement("h3");
    newAlpha3.setAttribute("id", "userAlpha3");
    newAlpha3.setAttribute("style", "color:rgb(90, 97, 104)");
    let newNode3 = document.createTextNode("\u03B13 = " + fractions[3].toFixed(5).toString(10));
    newAlpha3.appendChild(newNode3);
    parent.replaceChild(newAlpha3, oldAlpha3);
  }
  firstCalc = false;
}

function setUserPkas() {
  if (isNaN(parseFloat(document.getElementById("pka1input").value))) {
    alert("Please select an acid or enter at least a pka1 value before graphing.");
    return;
  }
  let pka1 = parseFloat(document.getElementById("pka1input").value);
  let pka2 = parseFloat(document.getElementById("pka2input").value);
  let pka3 = parseFloat(document.getElementById("pka3input").value);
  pkaList = [];
  let outOfOrder = false;
  pkaList.push(pka1);
  acidName = "pka(s) = " + pka1;


  if (!isNaN(pka2)) {
    if (pka2 <= pka1) {
      outOfOrder = true;
    }
    pkaList.push(pka2);
    acidName += (", " + pka2);

  }
  if (!isNaN(pka3)) {
    if (pka3 <= pka1 || pka3 <= pka2) {
      outOfOrder = true;
    }
    acidName += (", " + pka3);
    pkaList.push(pka3);
  }

  if (outOfOrder) {
    alert("pka values should be as such: pka1 < pka2 < pka3.");
  }
  graphPkaValues();
}

function graphPkaValues() {
  let Xs = [];
  let Ys = [];
  let notAtLim = true;
  let i = 0;

  // keep calculating fractions until every species is at 100% at some point in
  // the graph, or at least fill the graph from 0-14
  while (notAtLim || i < 141) {
    Xs.push(i / 10);
    Ys.push(calcFractions(Xs[i]));
    if (i >= 10 && Ys[i - 10][pkaList.length] >= 0.999) {
      notAtLim = false;
    }
    i += 1;
  }

  // If a0 is never 100% (for very strong acid) then calculate fractions at pH
  // lower than zero until every species is at 100% at some point on the graph
  if (Ys[10][0] < 0.999) {
    i = 1;
    while (Ys[10][0] < 0.999) {
      Xs.unshift(-i / 10);
      Ys.unshift(calcFractions(-i / 10));
      i += 1;
    }
  }

  Ys = transpose2d(Ys);
  colors = ["#B3EFFF", "#00CFFF", "#046B99", "#1C304A"];
  data = [];
  for (i = 0; i < Ys.length; i++) {
    let trace = {
      x: Xs,
      y: Ys[i],
      type: 'scatter',
      name: "\u03B1" + i,
      line: {
        color: colors[i],
        width: 4
      },
    };
    data.push(trace);
  }
  let layout = {
    title: acidName,
    titlefont: {
      family: "arial, sans-serif",
      size: 28
    },
    xaxis: {
      title: "pH",
      titlefont: {
        family: "arial, sans-serif",
        size: 24
      },
      tickfont: {
        family: "sans-serif",
        size: 18
      }
    },
    yaxis: {
      title: "Ion Fraction",
      titlefont: {
        family: "sans-serif",
        size: 24
      },
      tickfont: {
        family: "sans-serif",
        size: 18
      }
    }
  }
  let plotArea = document.getElementById("graph");
  plotArea.innerHTML = "";
  Plotly.newPlot('graph', data, layout, {
    showSendToCloud: true,
  });

  if (!firstGraph) {
    for (i = 0; i <= 14; i++) {
      let fractions = calcFractions(i);
      for (let j = 0; j < 4; j++) {
        replaceTableData("a" + j + "col", j.toString(10) + i.toString(10), "-", true);
      }
    }
  }


  for (i = 0; i <= 14; i++) {
    let fractions = calcFractions(i);
    for (let j = 0; j < Ys.length; j++) {
      replaceTableData("a" + j + "col", j.toString(10) + i.toString(10), fractions[j], false);
    }
  }
  firstGraph = false;
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function toggleDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
  let parent = document.getElementById("acid_selection");
  if (!dropDownShown) {
    document.getElementById("userPkaInput").style.display = "none";
    dropDownShown = true;
  } else {
    document.getElementById("userPkaInput").style.display = "block";
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
  acidName = name;
  pkaList = [];
  pkaList.push(pka1);
  if (pka2 != null) {
    pkaList.push(pka2);
  }
  if (pka3 != null) {
    pkaList.push(pka3);
  }
  graphPkaValues();
}

function infoClick() {
  infoClicked = true;
  alert("\u2022You can save a text file of ion fraction values from a start pH to a final pH. \n\n\u2022The pH value increases by steps of 1/10 a pH value. \n\n\u2022The file pkaAnalyzerData.txt will be saved to your Downloads folder.");
}

function download(filename, text) {
  var elem = document.createElement('a');
  elem.style.display = 'none';
  // Define the data of the file using encode URIComponent
  elem.setAttribute('href', 'data:text/plain;charset-utf-8,' + encodeURIComponent(text));
  // Add the download attribute of the hidden link
  elem.setAttribute('download', filename);
  document.body.appendChild(elem);
  //Simulate click of the created link
  elem.click();
  document.body.removeChild(elem);
}

document.getElementById("save-btn").addEventListener("click", function() {
  download("pkAnalyzer.txt", makeFileText());
}, false);
