// Load Main UI
window.onload = function() {
  loadCC('masterDiv');
}

// Main UI
let cc = [];

/* Sample

  cc = [[[check, mobile, 41, 3 days ago, "unknown", "very mobile"], ["", "reason", "site", "started", "associated", "severity"]], []]
  cc = [[[data], [abbreviation]], [], []...]
  
*/

function loadCC(masterDiv) {

  // Create 1st div
  const toolbarArray = [
    ["Chief Complaint", "Clear", "Add"],
    ["h1", "button", "button"],
    ["h1-1", "clear-1", "add-1"],
    ["void(0)", `del(1, '${masterDiv}')`, `selectCC('${masterDiv}')`]
  ];

  let toolbarContainer = `      
    <h1 id="h1-1", onclick="void(0)">Chief Complaint</h1>
    <div>
      <button class="rectButtonShort blackButton" id="clear-1" onclick="del(1, '${masterDiv}')"><p>Clear</p></button>
      <button class="rectButtonShort blackButton" id="add-1" onclick="selectCC('${masterDiv}')"><p>Add</p></button>
    </div>
  `;

  /*
  for (let i = 0; i < toolbarArray[0].length; i++) {
    toolbarContainer += `
      <${toolbarArray[1][i]} id="${toolbarArray[2][i]}" onclick="${toolbarArray[3][i]}">
       ${toolbarArray[0][i]}
      </${toolbarArray[1][i]}>
    `;
  }
  */
  
  // Create 2nd div

  let logsContainer = '';

  for (let i = 0; i < cc.length; i++) {
    let logDescription = '';
    logsContainer += `<div id="logCC${i}" class="logSubDiv">`
    for (let j = 0; j < cc[i][0].length; j++) {
      if (j === 0) {
        // Title
        logDescription += `<div><h2>${i + 1}. ${cc[i][0][j]}</h2><ul>`;
      } else {
        // Content
        logDescription += `
          <li><span style="color: grey;">${cc[i][0][j]}:</span> ${cc[i][1][j]}</li>
        `;
      }
    }
    logDescription += `</ul></div>`;
    let logTool = `<div style="width: 120px;"><button class="blackButton roundButton rBSmall" onclick="editCC(${i}, '${masterDiv}')"></button><button class="redButton roundButton rBSmall" onclick="removeCC(${i}, '${masterDiv}')"></button></div>`;
    logsContainer += `${logDescription}${logTool}</div>`
  }

  // Last
  document.getElementById(`${masterDiv}`).innerHTML = `
    <div id="mainCC">
      <div class="logSubDiv">${toolbarContainer}</div>
      <div class="logDiv">${logsContainer}</div>
    </div>
  `;
}

// Main UI Actions (add, clear, edit(3), del)
function selectCC(masterDiv) {
  let typesCC = '';

  const contentCC = ['Check', 'Pain', 'Requesting Treatment', 'Purchase of Goods', 'Emergency', 'Referred'];

  for (let i = 0; i < contentCC.length; i++) {
    typesCC += `
      <button class="rectButtonLong whiteButton" onclick="loadCCAdder('${masterDiv}',${i})"><p>
        ${contentCC[i]}
      </p></button>
    `;
  }
  
  document.getElementById(`${masterDiv}`).innerHTML = `
    <div id='selectCC'>
      <div class="logSubDiv">
        <h1>Select the type of complaint: </h1>
        <button class="rectButtonShort blackButton" onclick="loadCC('${masterDiv}')"><p>Back</p></button>
      </div>
      <div class="gridContainer">
        ${typesCC}
      </div>
    </div>
  `;
}
function del(i, masterDiv) {
  if (i === 1) {
    cc = [];
    loadCC(`${masterDiv}`);
  }
}
function editCC(i, masterDiv) {
  // Retrieve the saved data for this entry.
  // Each cc entry is structured as: [headerArray, valueArray]
  let savedHeader = cc[i][0]; // e.g., ["Check", ...] or ["Traumatic", ...]
  let savedValues = cc[i][1];

  // First, try to find a matching non-emergency category in ccComponents.
  let categoryIndex = ccComponents.findIndex(component => component[0] === savedHeader[0]);

  if (categoryIndex !== -1) {
    // Build the editing form for a non-emergency entry.
    let ccComponentsList = '';
    for (let j = 0; j < ccComponents[categoryIndex].length; j++) {
      if (j === 0) {
        ccComponentsList += `
          <div class="cc-component" id="ccComponents">
            <div class="logSubDiv">
              <h1>${ccComponents[categoryIndex][j]}</h1>
              <button class="rectButtonShort blackButton" onclick="selectCC('${masterDiv}')">
                <p>Back</p>
              </button>
            </div>
            <div>
        `;
      } else {
        let savedValue = savedValues[j] ? savedValues[j] : "";
        ccComponentsList += `
          <div>
            <label>${ccComponents[categoryIndex][j]}: </label>
            <input id="ccComponentsInput${j}" value="${savedValue}">
          </div>
        `;
      }
    }
    ccComponentsList += `
            </div>
            <div>
              <button class="rectButtonShort blackButton" onclick="clearCCComponents('ccComponents')">
                <p>Clear</p>
              </button>
              <button class="rectButtonShort redButton" onclick="updateCCComponents(${i}, ${categoryIndex}, '${masterDiv}')">
                <p>Update</p>
              </button>
            </div>
          </div>
    `;
    document.getElementById(masterDiv).innerHTML = ccComponentsList;
  } else {
    // If not found in ccComponents, try to find it in ccEmergency.
    let emergencyIndex = ccEmergency.findIndex(em => em[0] === savedHeader[0]);
    if (emergencyIndex !== -1) {
      // Build the editing form for an emergency entry.
      let emergencyComponentsList = '';
      for (let j = 0; j < ccEmergency[emergencyIndex].length; j++) {
        if (j === 0) {
          emergencyComponentsList += `
            <div class="cc-component" id="ccEmergency">
              <div class="logSubDiv">
                <h1>${ccEmergency[emergencyIndex][j]}</h1>
                <button class="rectButtonShort blackButton" onclick="loadCCAdder('${masterDiv}')">
                  <p>Back</p>
                </button>
              </div>
              <div>
          `;
        } else {
          let savedVal = savedValues[j] ? savedValues[j] : "";
          emergencyComponentsList += `
            <div>
              <label>${ccEmergency[emergencyIndex][j]}: </label>
              <textarea id="ccEmergencyTextarea${j}">${savedVal}</textarea>
            </div>
          `;
        }
      }
      emergencyComponentsList += `
              </div>
              <div>
                <button class="rectButtonShort blackButton" onclick="clearCCComponents('ccEmergency')">
                  <p>Clear</p>
                </button>
                <button class="rectButtonShort redButton" onclick="updateCCEmergencyComponents(${i}, ${emergencyIndex}, '${masterDiv}')">
                  <p>Update</p>
                </button>
              </div>
            </div>
      `;
      document.getElementById(masterDiv).innerHTML = emergencyComponentsList;
    } else {
      console.error("Category not found for editing.");
    }
  }
}
function updateCCComponents(i, categoryIndex, masterDiv) {
  let updatedValues = [];
  
  // We expect the same number of inputs as there were fields (plus an empty placeholder at index 0)
  for (let j = 0; j < ccComponents[categoryIndex].length + 1; j++) {
    if (j === 0) {
      updatedValues.push("");
    } else {
      let inputElement = document.getElementById(`ccComponentsInput${j}`);
      updatedValues.push(inputElement ? inputElement.value : "");
    }
  }
  
  // Update the saved values in cc array
  cc[i][1] = updatedValues;
  
  // Reload the chief complaint log to reflect the changes
  loadCC(masterDiv);
}
function updateCCEmergencyComponents(i, emergencyIndex, masterDiv) {
  let updatedValues = [];
  
  // Expect the same number of inputs as emergency fields (plus a placeholder at index 0)
  for (let j = 0; j < ccEmergency[emergencyIndex].length + 1; j++) {
    if (j === 0) {
      updatedValues.push(""); // placeholder if needed
    } else {
      let textarea = document.getElementById(`ccEmergencyTextarea${j}`);
      updatedValues.push(textarea ? textarea.value : "");
    }
  }
  
  // Update the cc array with the new values
  cc[i][1] = updatedValues;
  
  // Remove the emergency editing div if it exists and reload the log
  if (document.getElementById('ccEmergency')) {
    document.getElementById('ccEmergency').remove();
  }
  loadCC(masterDiv);
}
function removeCC(i, masterDiv) {
  document.getElementById(`logCC${i}`).remove();
  cc.splice(i, 1);
  loadCC(masterDiv);
}


// CC Components (input, clear)
const ccComponents = [
  ['Check', 'reason', 'site', 'since', 'associated', 'severity'],
  ['Pain', 'site', 'onset', 'characteristics', 'radiating', 'associated', 'timing', 'modifier', 'severity'],
  ['Requesting Treatment', 'treatment type', 'site', 'reason'],
  ['Purchase of Goods', 'name of goods', 'quantity', 'reason'],
  ['Emergency'],
  ['Referred', 'referred from', 'date & time of referral', 'reason']
]
function loadCCAdder(masterDiv, i) {
  if (i === 4) {
    let ccEmergency = '';

    const emergency = ['Traumatic', 'Chemical', 'Biological', 'Previously Treated'];
  
    for (let j = 0; j < emergency.length; j++) {
      ccEmergency += `
        <button class="rectButtonLong whiteButton" onclick="loadCCEmergency('${masterDiv}',${j})"><p>
          ${emergency[j]}
        </p></button>
      `;
    }
    
    document.getElementById(`${masterDiv}`).innerHTML = `
      <div id='ccComponents'>
        <div class="logSubDiv">
          <h1>Select the type of emergency: </h1>
          <button class="rectButtonShort blackButton" onclick="selectCC('${masterDiv}')"><p>Back</p></button>
        </div>
        <div class="gridContainer">
          ${ccEmergency}
        </div>
      </div>
    `;

  } else {
    let ccComponentsList = '';

    for (let j = 0; j < ccComponents[i].length; j++) {
      if (j === 0) {
        ccComponentsList += `<div class="cc-component" id="ccComponents"><div class="logSubDiv"><h1>${ccComponents[i][j]}</h1><button class="rectButtonShort blackButton" onclick="selectCC('${masterDiv}')"><p>Back</p></button></div><div>`;
      } else {
        ccComponentsList += `<div><label>${ccComponents[i][j]}: </label><input id="ccComponentsInput${j}"></div>`;
      }
    }

    ccComponentsList += `</div><div class=""><button class="rectButtonShort blackButton" onclick="clearCCComponents('ccComponents')"><p>Clear</p></button><button class="rectButtonShort redButton" onclick="saveCCComponents(${i}, '${masterDiv}')"><p>Save</p></button></div></div>`;

    document.getElementById(`${masterDiv}`).innerHTML = `
      ${ccComponentsList}
    `;
  }
}
function clearCCComponents(divId) {
  let div = document.getElementById(divId);
  if (div) {
    div.querySelectorAll("input, textarea").forEach(element => element.value = "");
  }
}
function saveCCComponents(i, masterDiv) {
  let saveCC = [];
  saveCC.push(ccComponents[i]);
  let temporaryArray = [];
  for (let j = 0; j < ccComponents[i].length + 1; j++) {
    if (j === 0) {
      temporaryArray.push("");
    } else {
      if (document.getElementById(`ccComponentsInput${j}`)) {

        temporaryArray.push(document.getElementById(`ccComponentsInput${j}`).value);
      }
    }
  }
  saveCC.push(temporaryArray);
  cc.push(saveCC);
  if (document.getElementById('ccComponents')) {
    document.getElementById('ccComponents').remove();
  }
  loadCC(`${masterDiv}`);
}

// CC Components (EMERGENCY)
const ccEmergency = [
  ['Traumatic', 'type of trauma', 'location of trauma', 'date & time of trauma', 'patient role (pre-mechanism)', 'known mechanism of trauma', 'unknown mechanism of trauma', 'impact details (post-mechanism)', 'source of story', 'patient symptoms', 'treatment given on-site'],
  ['Chemical'],
  ['Biological'],
  ['Previously Treated']
];
function loadCCEmergency(masterDiv, i) {
  let ccEmergencyList = '';

  for (let j = 0; j < ccEmergency[i].length; j++) {
    if (j === 0) {
      ccEmergencyList += `<div class="cc-component" id="ccEmergency"><div class="logSubDiv"><h1>${ccEmergency[i][j]}</h1><button class="rectButtonShort blackButton" onclick="loadCCAdder('${masterDiv}', 4)"><p>Back</p></button></div><div>`;
    } else {
      ccEmergencyList += `<div><label>${ccEmergency[i][j]}</label><textarea id="ccEmergencyTextarea${j}"></textarea></div>`;
    }
  }

  ccEmergencyList += `</div><div><button class="rectButtonShort blackButton" onclick="clearCCComponents('ccEmergency')"><p>Clear</p></button><button class="rectButtonShort redButton" onclick="saveCCEmergencyComponents(${i}, '${masterDiv}')"><p>Save</p></button></div></div>`;

  document.getElementById(`${masterDiv}`).innerHTML = `${ccEmergencyList}`;
}
function saveCCEmergencyComponents(i, masterDiv) {
  let saveCC = [];
  saveCC.push(ccEmergency[i]);
  let temporaryArray = [];
  for (let j = 0; j < ccEmergency[i].length + 1; j++) {
    if (j === 0) {
      temporaryArray.push("");
    } else {
      if (document.getElementById(`ccEmergencyTextarea${j}`)) {

        temporaryArray.push(document.getElementById(`ccEmergencyTextarea${j}`).value);
      }
    }
  }
  saveCC.push(temporaryArray);
  cc.push(saveCC);
  if (document.getElementById('ccEmergency')) {
    document.getElementById('ccEmergency').remove();
  }
  loadCC(`${masterDiv}`);
}
