// Load Main UI
window.onload = function() {
  loadCC('masterDiv');
}

// Main UI
let cc = [];
let ccHx = [];
let ccReHx = [];
let scrollAmt = 'max';

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
      <button class="rectButtonShort blackButton" id="undo-1" onclick="redo(1, '${masterDiv}')"><p>Redo</p></button>    
      <button class="rectButtonShort blackButton" id="undo-1" onclick="undo(1, '${masterDiv}')"><p>Undo</p></button>
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
    let logTool = `<div style="width: 120px;"><button class="blackButton roundButton rBSmall" onclick="editCC('${cc[i][2]}', '${masterDiv}', ${i})"></button><button class="redButton roundButton rBSmall" onclick="removeCC(${i}, '${masterDiv}')"></button></div>`;
    logsContainer += `${logDescription}${logTool}</div>`
  }

  // Last
  document.getElementById(`${masterDiv}`).innerHTML = `
    <div id="mainCC">
      <div class="logSubDiv">${toolbarContainer}</div>
      <div class="logDiv">${logsContainer}</div>
    </div>
  `;

  // Scrol to last
  const logDiv = document.querySelector(`#${masterDiv} .logDiv`);
  if (logDiv) {
    logDiv.scrollTop = scrollAmt === 'max' ? logDiv.scrollHeight : scrollAmt;
  }
}
 
function del(i, masterDiv) {
  if (i === 1) {
    ccHx.unshift([]);
    ccHx[0].push(null);
    ccHx[0].push(cc);
    ccHx[0].push('max');
    scrollAmt = 'max';
    ccReHx = [];
    cc = [];
    loadCC(`${masterDiv}`);
  }
}
// Check the first of the first index of the ccHx and determine which instruction to be done 
function undo(i, masterDiv) {
  if (i === 1) {
    const index = ccHx[0][0];
    if (index === null) {
      // restore whole CC
      cc = ccHx[0][1];
      ccReHx.unshift(ccHx[0]);
    } else if (index === true) {
      // remove added new CC
      ccReHx.unshift([`t${cc.indexOf(ccHx[0][1])}`, ccHx[0][1], ccHx[0][2]]);
      cc.splice(cc.indexOf(ccHx[0][1]), 1);
    } else if (index[0] === "r") {
      // restore removed CC
      cc.splice(+index.slice(1), 0, ccHx[0][1]);
      ccReHx.unshift(ccHx[0]);
    } else {
      // restore back hx of previous CC
      ccReHx.unshift([index, cc[index]]);
      cc[index] = ccHx[0][1];
    }
    scrollAmt = ccHx[0][2];
    ccHx.shift();
    loadCC(masterDiv);
  }
}
function redo(i, masterDiv) {
  if (i === 1) {
    const index = ccReHx[0][0];
    if (index === null) {
      // remove restore whole CC
      cc = [];
      ccHx.unshift(ccReHx[0]);
    } else if (index[0] === "t") {
      // restore remove added new CC
      cc.splice(+index.slice(1), 0, ccReHx[0][1]);
      ccHx.unshift([true, ccReHx[0][1], ccReHx[0][2]]);
    } else if (index[0] === "r") {
      // remove restore removed CC
      cc.splice(+index.slice(1), 1);
      ccHx.unshift(ccReHx[0]);
    } else {
      // restore back hx of previous CC
      ccHx.unshift([index, cc[index]]);
      cc[index] = ccReHx[0][1];
    }
    scrollAmt = ccReHx[0][2];
    ccReHx.shift();
    loadCC(masterDiv);
  }
}
function editCC(path, masterDiv, ccEntryIndex) {
  // Log the scroll
  const logDiv = document.querySelector(`#${masterDiv} .logDiv`)
  scrollAmt = logDiv ? logDiv.scrollTop : 'max';
  
  // Parse the path to get indices array
  let indices = idGenerator(path);
  console.log
  // Get the complaint type object from the unified ccTypes
  let complaintType = getComplaintTypeByIndices(indices, ccTypes);
  
  // For a leaf node, complaintType should have a "fields" array.
  if (!complaintType || !complaintType.fields) {
    console.error("Invalid complaint type or not a leaf node");
    return;
  }
  
  // Use complaintType.type as the header title
  let headerHTML = generateHeader(complaintType.type, `loadCC('${masterDiv}')`);
  
  // Build the fields. Use the saved values from cc[ccEntryIndex][1]
  const modifiedFields = cc[ccEntryIndex][1].slice(1)
  let fieldsHTML = buildFormFields(complaintType.fields, modifiedFields, 'textarea', 'complaintForm');
  
  // Generate a footer with update functionality.
  // You need to adjust generateFooter and updateCCUnified to accept the unified structure.
  let footerHTML = generateFooter(ccEntryIndex, 'complaintForm', `${cc[ccEntryIndex][2]}`, masterDiv, 'textarea', complaintType.fields.join(','), complaintType.type, 'Update');
  
  // Set the master container's innerHTML
  document.getElementById(masterDiv).innerHTML = headerHTML + fieldsHTML + footerHTML;
}
/*
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
  ccReHx = [];
  // Refresh the UI
  loadCC(masterDiv);
}
*/
function removeCC(i, masterDiv) {
  document.getElementById(`logCC${i}`).remove();
  const logDiv = document.querySelector(`#${masterDiv} .logDiv`)
  ccHx.unshift([]);
  ccHx[0].push(`r${i}`);
  ccHx[0].push(cc[i]);
  ccHx[0].push(logDiv.scrollTop);
  scrollAmt = logDiv.scrollTop;
  ccReHx = [];
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
          { type: 'Traumatic Emergency', fields: ['type of trauma', 'location of trauma', 'date & time of trauma', 'patient role (pre-mechanism)', 'mechanism of trauma', 'impact details (post-mechanism)', 'source of story', 'patient symptoms', 'treatment given on-site'] },
          { type: 'Chemical Emergency', fields: ['type of chemical', 'site of exposure', 'duration since exposure', 'severity of damage', 'associated symptoms', 'treatment given on-site'] },
          { type: 'Biological Emergency', fields: ['type of infection', 'site of infection', 'severity', 'associated symptoms', 'progression speed', 'treatment given on-site'] },
          { type: 'Previously Treated Emergency', fields: ['type of previous treatment', 'date of treatment', 'complication symptoms', 'site affected', 'severity of reaction', 'immediate actions taken'] }
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
// HTML loader
function unifiedLoadCC(masterDiv, prefix, i) {
  // Build selection screen - 'subtypes'
  // buildFormFields - 'fields'  
  if (prefix === "" && i === "") {
    loadCC(masterDiv);
  } else {
    let UIBoch = [];
    let UIBochTitle = "";
    const indices = idGenerator(prefix);
    const secondKey = getSecondKeyFromIndices(indices, ccTypes, i);

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
        for (let j = 0; j < current.fields.length; j++) {
          UIBoch.push(current.fields[j]);
        }
      }
    
      return keys.length >= 2 ? keys[1] : 'subtypes';
    }
  
    let newStr = prefix.length > 2 ? prefix.slice(0, -2) : "";
    let newPrefix = prefix === "" ? i : prefix + '-' + i;
    if (secondKey === 'subtypes') {
      buildSelectionScreen(
        masterDiv,
        `Select the type of ${UIBochTitle}:`,
        `unifiedLoadCC('${masterDiv}','${newStr}', '${prefix.slice(-1)}')`,
        UIBoch,
        (index) => `unifiedLoadCC('${masterDiv}', '${newPrefix}', '${index}')`
      )
    } else if (secondKey === 'fields') {
      let headerHTML = generateHeader(`${UIBochTitle}`, `unifiedLoadCC('${masterDiv}','${newStr}', '${prefix.slice(-1)}')`);
      let fieldsHTML = buildFormFields(UIBoch, [], 'textarea', `ccTypes${prefix}`);
      let footerHTML = generateFooter('null', `ccTypes${prefix}`, `${prefix}-${i}`, `${masterDiv}`, 'textarea', `${UIBoch}`, `${UIBochTitle}`,'Save');
      document.getElementById(masterDiv).innerHTML = headerHTML + fieldsHTML + footerHTML;  
    }  
  }
}

// HTML Library Engines
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
function buildFormFields(fieldsArray, savedValues, elementType, containerId) {
  let fieldsHTML = "";
  // Loop through each field (skipping index 0, which is the header)
  for (let j = 0; j < fieldsArray.length; j++) {
    let fieldLabel = fieldsArray[j];
    let savedVal = savedValues && savedValues[j] ? savedValues[j] : "";
    
    if (elementType === 'input') {
      fieldsHTML += `
        <div class="fieldsDiv">
          <label>${fieldLabel}: </label>
          <input id="${containerId}Input${j}" value="${savedVal}">
        </div>
      `;
    } else if (elementType === 'textarea') {
      fieldsHTML += `
        <div class="fieldsDiv">
          <label>${fieldLabel}: </label>
          <textarea id="${containerId}Textarea${j}">${savedVal}</textarea>
        </div>
      `;
    }
  }
  
  return fieldsHTML;
}
function generateFooter(index, id, prefix, masterDiv, elementType, fieldsArray, title, buttonName) {
  return `
    </div>
      <div>
        <button class="rectButtonShort blackButton" onclick="clearCCComponents('${masterDiv}')"><p>Clear</p></button>
        <button class="rectButtonShort redButton" onclick="saveCCUnified('${index}', '${prefix}', '${masterDiv}', '${elementType}', '${fieldsArray}', '${id}', '${title}')"><p>${buttonName}</p></button>
      </div>
    </div>
  `;
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

// Form's Action
function clearCCComponents(divId) {
  let div = document.getElementById(divId);
  if (div) {
    div.querySelectorAll("input, textarea").forEach(element => element.value = "");
  }
}
function saveCCUnified(index, prefix, masterDiv, elementType, arrayStr, containerId, title) {
  let saveCC = [];
   // Save the header (field names)
  let temporaryArray = [""];
  const fieldsArray = arrayStr.split(',');
  fieldsArray.unshift(title);
  saveCC.push(fieldsArray);
  
  // Loop over fields, plus one extra slot for a placeholder at index 0.
  for (let j = 0; j < fieldsArray.length; j++) {
    let element;
    if (elementType === 'input') {
      element = document.getElementById(`${containerId}Input${j}`);
    } else if (elementType === 'textarea') {
      element = document.getElementById(`${containerId}Textarea${j}`);
    }
    temporaryArray.push(element ? element.value : "");
  }
  saveCC.push(temporaryArray);
  saveCC.push(prefix);
  if (index === 'null') {
    cc.push(saveCC);
    let indexSaveCC = cc.indexOf(saveCC);
    ccHx.unshift([]);
    ccHx[0].push(true);
    ccHx[0].push(saveCC);
    ccHx[0].push('max');
    scrollAmt = 'max';
  } else {
    ccHx.unshift([]);
    ccHx[0].push(parseInt(index, 10));
    ccHx[0].push(cc[index]);
    ccHx[0].push(scrollAmt);
    console.log(ccHx);
    cc[index]= saveCC;
  }
  
  
  // Remove the container element after saving.
  let container = document.getElementById(containerId);
  if (container) container.remove();
  ccReHx = [];
  // Reload the main UI.
  loadCC(masterDiv);
}

// Helper Fx
function idGenerator(prefix) {
  if (prefix === '' || prefix === 'null') {
    return null;
  } else {
    return prefix.split('-').map(Number);
  }
}
// Helper: Traverse ccTypes using an array of indices
function getComplaintTypeByIndices(indices, ccTypes) {
  let current = ccTypes;
  for (let index of indices) {
    // Assume current is an array or object with a "subtypes" property
    if (Array.isArray(current)) {
      current = current[index];
    } else if (current.subtypes) {
      current = current.subtypes[index];
    }
  }
  return current;
}
// Helper: Get the second key


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
