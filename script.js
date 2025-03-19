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
      <button class="rectButtonShort blackButton" id="add-1" onclick="unifiedLoadCC('${masterDiv}','','0')"><p>Add</p></button>
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
          ${generateHeader(`${ccComponents[categoryIndex][j]}`,`selectCC('${masterDiv}')`)}
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
              <button class="rectButtonShort redButton" onclick="updateCCUnified(${i}, ${categoryIndex}, '${masterDiv}', 'input', ccComponents[${categoryIndex}])">
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
            ${generateHeader(`${ccEmergency[emergencyIndex][j]}`, `${masterDiv}`)}
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
                <button class="rectButtonShort redButton" onclick="updateCCUnified(${i}, ${emergencyIndex}, '${masterDiv}', 'textarea', ccEmergency[${emergencyIndex}])">
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
function updateCCUnified(i, categoryIndex, masterDiv, elementType, fieldsArray) {
  let updatedValues = [];
  
  // Loop over the expected fields (plus a placeholder at index 0)
  for (let j = 0; j < fieldsArray.length + 1; j++) {
    if (j === 0) {
      updatedValues.push("");
    } else {
      let value = "";
      if (elementType === 'input') {
        let inputEl = document.getElementById(`ccComponentsInput${j}`);
        value = inputEl ? inputEl.value : "";
      } else if (elementType === 'textarea') {
        let textEl = document.getElementById(`ccEmergencyTextarea${j}`);
        value = textEl ? textEl.value : "";
      }
      updatedValues.push(value);
    }
  }
  
  // Update the cc array with the new values
  cc[i][1] = updatedValues;
  
  // Refresh the UI
  loadCC(masterDiv);
}
function removeCC(i, masterDiv) {
  document.getElementById(`logCC${i}`).remove();
  cc.splice(i, 1);
  loadCC(masterDiv);
}

// CC Components (input, clear)
const ccTypes = [
  { 
    type: 'Chief Complaint',
    subtypes: [
      { type: 'Check', fields: ['reason', 'site', 'since', 'associated', 'severity'] },
      { type: 'Pain', fields: ['site', 'onset', 'characteristics', 'radiating', 'associated', 'timing', 'modifier', 'severity'] },
      { type: 'Requesting Treatment', fields: ['treatment type', 'site', 'reason'] },
      { type: 'Purchase of Goods', fields: ['name of goods', 'quantity', 'reason'] },
      { 
        type: 'Emergency',
        subtypes: [
          { type: 'Traumatic', fields: ['type of trauma', 'location of trauma', 'date & time of trauma', 'patient role (pre-mechanism)', 'mechanism of trauma', 'impact details (post-mechanism)', 'source of story', 'patient symptoms', 'treatment given on-site'] },
          { type: 'Chemical', fields: ['type of chemical', 'site of exposure', 'duration since exposure', 'severity of damage', 'associated symptoms', 'treatment given on-site'] },
          { type: 'Biological', fields: ['type of infection', 'site of infection', 'severity', 'associated symptoms', 'progression speed', 'treatment given on-site'] },
          { type: 'Previously Treated', fields: ['type of previous treatment', 'date of treatment', 'complication symptoms', 'site affected', 'severity of reaction', 'immediate actions taken'] }
        ]
      },
      { type: 'Referred', fields: ['referred from', 'date & time of referral', 'reason'] }
    ]
  }
];

/*
  prefix = null
  i = 0

  current = ccTypes[0]

  prefix = 0
  i = i
  current = ccTypes[0].subtypes[i]

  prefix = 0-1
  i = i
  current = ccTypesp[0],subtypes[1].subtypes[i]
*/ 

function unifiedLoadCC(masterDiv, prefix, i) {
  // Build selection screen - 'subtypes'
  // buildFormFields - 'fields'  
  
  let UIBoch = [];
  let UIBochTitle = "";
  const indices = idGenerator(prefix);
  const secondKey = getSecondKeyFromIndices(indices, ccTypes, i);
  
  
  function idGenerator(prefix) {
    if (prefix === '' || prefix === 'null') {
      return null;
    } else {
      return prefix.split('-').map(Number);
    }
  }
  function getSecondKeyFromIndices(indices, data, extraIndex) {
    let current;
  
    if (indices && indices.length > 0) {
      current = data[indices[0]];
      for (let j = 1; j < indices.length; j++) {
        if (!current.subtypes) break;
        current = current.subtypes[indices[j]];
      }
      if (extraIndex != null && current.subtypes) {
        current = current.subtypes[extraIndex];
      }
    } else {
      current = data[extraIndex];
    }

    let keys = Object.keys(current);
    
    UIBochTitle = current.type;
    if (keys.includes('subtypes') && Array.isArray(current.subtypes)) {
      for (let j = 0; j < current.subtypes.length; j++) {
        UIBoch.push(current.subtypes[j].type);
      }
    } else if (keys.includes('fields') && Array.isArray(current.fields)) {
      console.log(current.fields);
      for (let j = 0; j < current.fields.length; j++) {
        UIBoch.push(current.fields[j]);
      }
    }
    return keys.length >= 2 ? keys[1] : 'subtypes';
  }

  let newStr = prefix.length > 2 ? prefix.slice(0, -2) : "";
  let newPrefix = prefix === "" ? i : prefix + '-' + i;
  if (secondKey === 'subtypes') {
    console.log(UIBoch);
    buildSelectionScreen(
      masterDiv,
      `Select the type of ${UIBochTitle}:`,
      `unifiedLoadCC('${masterDiv}','${newStr}', '${prefix.slice(-1)}')`,
      UIBoch,
      (index) => `unifiedLoadCC('${masterDiv}', '${newPrefix}', '${index}')`
    )
    
  } else if (secondKey === 'fields') {
    console.log(UIBoch);
    let headerHTML = generateHeader(`${UIBochTitle}`, `unifiedLoadCC('${masterDiv}','${newStr}', '${prefix.slice(-1)}')`);
    let fieldsHTML = buildFormFields(UIBoch, [], 'textarea', `ccTypes${prefix}`);
    let footerHTML = generateFooter(`ccTypes${prefix}`, i, `${masterDiv}`, 'textarea');
    document.getElementById(masterDiv).innerHTML = headerHTML + fieldsHTML + footerHTML;  
  }
}


function clearCCComponents(divId) {
  let div = document.getElementById(divId);
  if (div) {
    div.querySelectorAll("input, textarea").forEach(element => element.value = "");
  }
}

// Global Fx
function generateHeader(title, backCallback) {
  return `
  <div>
    <div class="logSubDiv">
      <h1>${title}</h1>
      <button class="rectButtonShort blackButton" onclick="${backCallback}">
        <p>Back</p>
      </button>
    </div>
    <div>
  `;
}
function generateFooter(fieldsArray, i, masterDiv, elementType) {
  return `
    </div>
      <div>
        <button class="rectButtonShort blackButton" onclick="clearCCComponents('${masterDiv}')"><p>Clear</p></button>
        <button class="rectButtonShort redButton" onclick="saveCCUnified(${i}, '${masterDiv}', '${elementType}', ${fieldsArray}[${i}], '${fieldsArray}')"><p>Save</p></button>
      </div>
    </div>
  `;
}
function saveCCUnified(i, masterDiv, elementType, fieldsArray, containerId) {
  let saveCC = [];
  saveCC.push(fieldsArray); // Save the header (field names)
  let temporaryArray = [];
  
  // Loop over fields, plus one extra slot for a placeholder at index 0.
  for (let j = 0; j < fieldsArray.length + 1; j++) {
    if (j === 0) {
      temporaryArray.push("");
    } else {
      let element;
      if (elementType === 'input') {
        element = document.getElementById(`${containerId}Input${j}`);
      } else if (elementType === 'textarea') {
        element = document.getElementById(`${containerId}Textarea${j}`);
      }
      temporaryArray.push(element ? element.value : "");
    }
  }
  
  saveCC.push(temporaryArray);
  cc.push(saveCC);
  
  // Remove the container element after saving.
  let container = document.getElementById(containerId);
  if (container) container.remove();
  
  // Reload the main UI.
  loadCC(masterDiv);
}
function buildFormFields(fieldsArray, savedValues, elementType, containerId) {
  let fieldsHTML = "";
  console.log(fieldsArray);
  // Loop through each field (skipping index 0, which is the header)
  for (let j = 0; j < fieldsArray.length; j++) {
    let fieldLabel = fieldsArray[j];
    let savedVal = savedValues && savedValues[j] ? savedValues[j] : "";
    
    if (elementType === 'input') {
      fieldsHTML += `
        <div>
          <label>${fieldLabel}: </label>
          <input id="${containerId}Input${j}" value="${savedVal}">
        </div>
      `;
    } else if (elementType === 'textarea') {
      fieldsHTML += `
        <div>
          <label>${fieldLabel}: </label>
          <textarea id="${containerId}Textarea${j}">${savedVal}</textarea>
        </div>
      `;
    }
  }
  
  return fieldsHTML;
}
/**
 * Builds a selection screen with a header and a grid of buttons.
 * @param {string} masterDiv - The ID of the master container.
 * @param {string} title - The header title.
 * @param {string} backCallback - The JavaScript callback for the Back button.
 * @param {Array} buttonLabels - An array of labels for the buttons.
 * @param {Function} buttonCallback - A function to call for each button click.
 *        The callback receives the index (and you can capture masterDiv if needed).
*/
function buildSelectionScreen(masterDiv, title, backCallback, buttonLabels, buttonCallback) {
  // Generate header with back button.
  let headerHTML = `
    <div class="logSubDiv">
      <h1>${title}</h1>
      <button class="rectButtonShort blackButton" onclick="${backCallback}">
        <p>Back</p>
      </button>
    </div>
  `;
  
  // Generate the grid of buttons using map and join.
  let buttonsHTML = buttonLabels.map((label, index) => {
    // Use the buttonCallback to generate the onclick attribute.
    // For example, if buttonCallback returns a string like: "loadCCAdder('masterDiv', 2)"
    return `
      <button class="rectButtonLong whiteButton" onclick="${buttonCallback(index)}">
        <p>${label}</p>
      </button>
    `;
  }).join('');
  
  // Wrap the buttons in a grid container.
  let gridHTML = `<div class="gridContainer">${buttonsHTML}</div>`;
  
  // Combine everything.
  let fullHTML = `
    <div id='ccComponents'>
      ${headerHTML}
      ${gridHTML}
    </div>
  `;
  
  document.getElementById(masterDiv).innerHTML = fullHTML;
}

// Main UI Actions (add, clear, edit(3), del)
/*
ARCHRIVESSSSSS

const ccComponents = [
  ['Check', 'reason', 'site', 'since', 'associated', 'severity'],
  ['Pain', 'site', 'onset', 'characteristics', 'radiating', 'associated', 'timing', 'modifier', 'severity'],
  ['Requesting Treatment', 'treatment type', 'site', 'reason'],
  ['Purchase of Goods', 'name of goods', 'quantity', 'reason'],
  ['Emergency'],
  ['Referred', 'referred from', 'date & time of referral', 'reason']
];

function selectCC(masterDiv) {
  const contentCC = ['Check', 'Pain', 'Requesting Treatment', 'Purchase of Goods', 'Emergency', 'Referred'];
  buildSelectionScreen(
    masterDiv,
    "Select the type of complaint:",
    "loadCC('" + masterDiv + "')", // back callback
    contentCC,
    (index) => `loadCCAdder('${masterDiv}', ${index})`
  );
}
function loadCCAdder(masterDiv, i) {
  if (i === 4) {
    showEmergencySelection(masterDiv);
  } else {
    let headerHTML = generateHeader(`${ccComponents[i][0]}`, `selectCC('${masterDiv}')`);
    let fieldsHTML = buildFormFields(ccComponents[i], [], 'input', 'ccComponents');
    let footerHTML = generateFooter('ccComponents', i, `${masterDiv}`, 'input');
    document.getElementById(masterDiv).innerHTML = headerHTML + fieldsHTML + footerHTML;  
  }
}
function showEmergencySelection(masterDiv) {
  const emergency = ['Traumatic', 'Chemical', 'Biological', 'Previously Treated'];
  buildSelectionScreen(
    masterDiv,
    "Select the type of emergency:",
    "selectCC('" + masterDiv + "')", // back callback
    emergency,
    (index) => `loadCCEmergency('${masterDiv}', ${index})`
  );
}
  // CC Components (EMERGENCY)
const ccEmergency = [
  ['Traumatic', 'type of trauma', 'location of trauma', 'date & time of trauma', 'patient role (pre-mechanism)', 'known mechanism of trauma', 'unknown mechanism of trauma', 'impact details (post-mechanism)', 'source of story', 'patient symptoms', 'treatment given on-site'],
  ['Chemical'],
  ['Biological'],
  ['Previously Treated']
];
function loadCCEmergency(masterDiv, i) {
  let headerHTML = generateHeader(`${ccEmergency[i][0]}`, `loadCCAdder('${masterDiv}', 4)`);
  let fieldsHTML = buildFormFields(ccEmergency[i], [], 'textarea', 'ccEmergency');
  let footerHTML = generateFooter('ccEmergency', i, `${masterDiv}`, 'textarea');
  document.getElementById(masterDiv).innerHTML = headerHTML + fieldsHTML + footerHTML;
}
*/ 
