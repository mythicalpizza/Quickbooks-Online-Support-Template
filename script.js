//Settings

//Enable/disable red "required" highlights on empty template fields
var highlightRequiredFields = true;

//Enable/disable requirement of area field before copying (Overrides required highlights setting if true)
var enforceArea = true;

//Allows scraping of excel document for area field
var areaDelimiter = "[";

//Enable/disable localstorage crash copies
var enableCrashCopy = true;

//Enable/disable trailing identifier in result for analytics scraping slack
var enableTestResultFlag = false;
//Set the flags and selector that will be in the result when enableTestResultFlag is set to true
var flagSelectorChar = "#";
var testResultFlags = ["slacktemplate"];


//Templates
var tplSMEAssistance = {
  length: 6,
  emote: ":star1:",
  labels: ["Firm ID (QBOA Only)", "Company ID", "Case #", "Description of the Issue", "Customer's Goal (What is the customer trying to achieve?)", "KBs Researched"],
  ids: ["firmid", "clientid", "casenumber", "issuedescription", "customergoal", "kbsresearched"],
  types: ["text", "text", "text", "textarea", "textarea", "text"],
  placeholders: ["e.g. 123187956452310 - Firm Company ID", "e.g. 123187956452310 - Client Company ID, if QBOA", "e.g. 123654897", "e.g. Customer is unable to run payroll because the account is still on an NSF hold.", "e.g. Remove NSF hold since it has been paid, then run payroll", "e.g. ID6523165"],
  crashCopyName: "SMEAssistance-copy"
}

var tplSupcall = {
  length: 6,
  emote: "",
  labels: ["Company ID", "Case #", "Phone Number", "Description of the Issue", "What troubleshooting/researching has been done so far?", "Reason SUP/SME is needed"],
  ids: ["coid", "casenumber", "phonenumber", "issuedescription", "stepstaken", "reason"],
  types: ["text", "text", "text", "textarea", "textarea", "textarea"],
  placeholders: ["e.g. 123187956452310", "e.g. 123654897", "e.g. (913) 123-4567", "e.g. Customer was told they were not eligible for another discount.", "e.g. I tried to look up her account, all she gave me was the company ID.", "e.g. Customer is unable to work with me. Demanding a supervisor because they were told by numerous agents they could not have another discount and she does not like that answer."],
  crashCopyName: "SUPCall-copy"
}

var tplDiscountRequest = {
  length: 6,
  emote: "",
  labels: ["Location", "Company ID", "Case ID", "Request Type", "Desired Discount", "Reason for the Change"],
  ids: ["sitelocation", "companyid", "casenumber", "requesttype", "desireddiscount", "changereason"],
  types: ["text", "text", "text", "text", "text", "textarea"],
  placeholders: ["e.g. Olathe", "e.g. 123187956452310", "e.g. 123654897", "e.g. Apply Discount", "e.g. Whatever we can offer", "e.g. Cx has been with QBO since it came out, and it has been getting too expensive for them lately, they are wondering if they cam have a loyalty discount of some sort."],
  crashCopyName: "DiscountRequest-copy"
}

var tplRefundRequest = {
  length: 9,
  emote: "",
  labels: ["Location", "Company ID", "Case ID", "Current Company Status in BED", "Total Amount to Refund", "Annual or Monthly Billing", "Total Number of Orders", "List Order Numbers to be Refunded", "Reason for the Refund"],
  ids: ["sitelocation", "companyid", "casenumber", "companystatisinbed", "totalamount", "billingfrequency", "numberoforders", "ordernumberlist", "refndreason"],
  types: ["text", "text", "text", "text", "text", "text", "text", "textarea", "textarea"],
  placeholders: ["e.g. Olathe", "e.g. 123187956452310", "e.g. 123654897", "e.g. Cancelled", "e.g. $60", "e.g. Monthly", "e.g. 3", "e.g. SUBS4562653, SUBS4569853, SUBS7854632", "e.g. Customer accidentally made a duplicate Simple Start account and has been charged for 3 months."],
  crashCopyName: "RefundRequest-copy"
}

var tplTransferRequest = {
  length: 6,
  emote: "",
  labels: ["COID/CAN", "Case", "Date & Time", "Number Dialed/Method of Contact", "Transferred to/Attendant Profile", "Reason for Transfer"],
  ids: ["companyid", "casenumber", "dateandtime", "numberdialed", "attendantprofile", "transferreason"],
  types: ["text", "text", "text", "text", "text", "textarea"],
  placeholders: ["e.g. 123187956452310", "e.g. 123456789", "08/27/2019 - 3:30pm", "e.g. Call me Back misroute", "e.g. DIFY OL", "e.g. Was not aware that Call me Back was for QBo only, needed Full service payroll to set up new employee"],
  crashCopyName: "TransferRequest-copy"
}

var tplQuickQuestion = {
  length: 1,
  emote: [":star1:"],
  labels: ["Quick Question"],
  ids: ["quickquestion"],
  types: ["text"],
  placeholders: ["Quick Question"],
  crashCopyName: ["quickquestion-copy"]
}

var areaOptions = ["1099", "Add-Ons/3rd Party Apps", "Advanced", "Banking", "Billing", "Client Management", "Customer (Money In)", "Data Management/Damage", "Import/Export QBO File", "Inventory", "Mobile App", "Multi-Currency", "Payroll", "POS/Payments", "Proadvisor/Accountant Only Features", "Reports", "Sales Tax", "Subscription Management", "Tool Request", "User Management/Login", "Vendor (Money Out)"];

//Global vars
var currentTemplate = undefined;//Not a setting, do not change
var selectorIndex = 0;//Not a setting, do not change

window.onload = function(){
  applySettings();
  populateAreaSelection(areaOptions);
  changeTemplate(tplSMEAssistance);
  selectorIndex = document.getElementById("tpl-selector").selectedIndex;
}

function applySettings () {
  enableCrashCopy = eval(getDefaultSetting("enableCrashCopy", true));//I'm not even going to look into why this wouldn't work without evaluating it. It's just gonna annoy me when I find out because I wrote this part this while hungover
  console.log((enableCrashCopy ? "Crash copies are enabled" : "Crash copies are disabled"));
	document.getElementById("crashCopy_btn").innerHTML = (enableCrashCopy ? "Disable" : "Enable");
}

function changeTemplate() {
  document.getElementById("output").value = "";
  setDisclaimer("");
  //Remove existing fields
  removeFields();
  removeRequiredFromArea();
  document.getElementById("area-selector").selectedIndex = 0;
  populateAreaSelection(areaOptions);

  //Determine which template needs to be created
  var tpl = undefined;

  switch(document.getElementById("tpl-selector").value){
    case "SME Assistance":
      tpl = tplSMEAssistance;
      document.getElementById("area-selector").disabled = false;
      break;

    case "SUP/SME Call":
      tpl = tplSupcall;
      document.getElementById("area-selector").disabled = false;
      break;

    case "Discount Request":
      tpl = tplDiscountRequest;
      document.getElementById("area-selector").disabled = true;
      addDedicatedArea("Billing");
      break;

    case "Refund Request":
      tpl = tplRefundRequest;
      document.getElementById("area-selector").disabled = true;
      addDedicatedArea("Billing");
      break;

    case "Transfer Request":
      tpl = tplTransferRequest;
      addDedicatedArea("Transfer");
      document.getElementById("area-selector").disabled = true;
      break;

    case "Quick Question":
      tpl = tplQuickQuestion;
      setDisclaimer("If a SME determines that your question needs more attention, please be prepared to fill out a full template!");
      break;

    default:
      console.log("Error switching template: Unable to determine new template type.");
      break;
  }

  //Set current template to global
  currentTemplate = tpl;

  //Create template fields
  if(tpl != undefined) {
    for(var i = 0; i < tpl.length; i++){
      createField(tpl.labels[i], tpl.ids[i], tpl.types[i], tpl.placeholders[i]);
    }
  }

  //Assign event listeners
  for(i = 0; i < tpl.length; i++){
    document.getElementById(tpl.ids[i]).addEventListener("change", updateOutput, false);
    document.getElementById(tpl.ids[i]).addEventListener("change", removeRequired, false);
  }

  //Crash copy
  if(enableCrashCopy){
    crashCopyCheck(tpl.crashCopyName);
  }


}

//Check if anything is in the form before changing the template
function changeCheck() {
  if(isClear() == false){
    var a = window.confirm("There is text in one or more fields. Would you still like to change the template?");
    if(a == true){
      changeTemplate();
      a = null;
    }
    else {
      document.getElementById("tpl-selector").selectedIndex = selectorIndex;
    }
  }
  else {
    changeTemplate();
    selectorIndex = document.getElementById("tpl-selector").selectedIndex;
  }
}

//Remove all fields in the form
function removeFields() {
  var editor = document.getElementById("editor");
  while(editor.firstChild) {
    editor.removeChild(editor.firstChild);
  }
}

//Remove required highlight from current field
function removeRequired(){
  if(this.classList.contains("required")){
    this.classList.remove("required");
  }
}

/*
I made a special one for the area selector because it's behaving stupid. "This" is returning undefined when called upon itself, and it's the only one doing it.
select elements probably return different self references than input elements because of the child list, but I dont care enough to fix it. This works
*/
function removeRequiredFromArea(){
  if(document.getElementById("area-selector").classList.contains("required")){
    document.getElementById("area-selector").classList.remove("required");
  }
}

//Clear the form
function clearForm(){
  //Clear Area selector
  removeRequiredFromArea();
  document.getElementById("area-selector").selectedIndex = 0;

  //CLear the form itself
  for(i in currentTemplate.ids){
    document.getElementById(currentTemplate.ids[i]).value = "";
    if(document.getElementById(currentTemplate.ids[i]).classList.contains("required")){
      document.getElementById(currentTemplate.ids[i]).classList.remove("required");
    }
  }
  document.getElementById("output").value = "";
  if(enableCrashCopy){
    localStorage.removeItem(currentTemplate.crashCopyName);
  }
}

//Check if anything is in the form before clearing
function clearCheck(){
  if(isClear() == false){
    var a = window.confirm("There is text in one or more fields. Would you still like to clear the form?");
    if(a == true){
      clearForm();
      a = null;
    }
  }
}

//Quite literal, returns true or false depending on if the form is clear
function isClear(){
  var clr = true;
  for(i in currentTemplate.ids){
    if(document.getElementById(currentTemplate.ids[i]).value != ""){
      clr = false;
      break;
    }
  }
  return clr;
}

  //Update the form into the output field
  function updateOutput(){
    var str = (currentTemplate.emote != "" ? (currentTemplate.emote + "\n") : "");
    str += " *" + document.getElementById("tpl-selector").value + "*\n";
    str += " " + areaDelimiter + "*Area:* " + document.getElementById("area-selector").value + "] \n";
    for(var i = 0; i < currentTemplate.length; i++){
      str += " *" + currentTemplate.labels[i] + ":* " + document.getElementById(currentTemplate.ids[i]).value + "\n";
    }

    if(enableTestResultFlag){
      i = 0;//Reset
      for(i in testResultFlags){
        str += "\n" + flagSelectorChar + testResultFlags[i];
      }
    }
    document.getElementById("output").value = str;

    if(enableCrashCopy){
      if(isClear() == false){
        createCrashCopy();
      }
    }
  }

  //Check the form fields before copying to clipboard
  function copyCheck(){
    if(enforceArea && !highlightRequiredFields) {
      //If highlight is turned off but enforce area is on, it won't copy and there will be no visual indicator, so I'm enabling highlight here
      highlightRequiredFields = true;
    }

    //Highlight check
    if(highlightRequiredFields){
      //Highlight fields
      for(i in currentTemplate.ids){
        if(document.getElementById(currentTemplate.ids[i]).value == ""){
          document.getElementById(currentTemplate.ids[i]).classList.add("required");
        }
      }
      //Highlight area selector
      if(document.getElementById("area-selector").value == "N/A"){
        document.getElementById("area-selector").classList.add("required");
      }
    }

    //Area enforement field check
    if(enforceArea) {
      if(document.getElementById("area-selector").value != "N/A"){
        updateOutput();
        copyToClipBoard(document.getElementById('output'));
      }
      else {
        console.log("Copy to clipboard failed. Area field was not specified while field enforement was enabled.");
      }
    }
    else{
      updateOutput();
      copyToClipBoard(document.getElementById('output'));
    }
  }

  //Copy the finished template to the clipboard
  function copyToClipBoard(el){
    el.disabled = false;
    el.select();
    document.execCommand("copy");
    el.disabled = true;
  }

  function createField(labelText, elID, fieldType, placeholder) {

    //Create wrapper
    var wrapper = document.createElement("section");
    wrapper.className = "input-wrapper";

    //Create Label
    var newLabel = document.createElement("label");
    newLabel.htmlFor = elID;
    newLabel.innerHTML = labelText + ": ";
    wrapper.appendChild(newLabel);

    //Create field
    var newField;

    switch (fieldType){
      case "text":
        newField = document.createElement("input");
        newField.type = "text";
        break;

      case "textarea":
        newField = document.createElement("textarea");
        newField.cols = "100";
        newField.rows = "3";
        break;
    }
    newField.id = elID;
    newField.className = "input-field";
    newField.placeholder = placeholder;
    wrapper.appendChild(newField);

    document.getElementById("editor").appendChild(wrapper);
  }

  //Check for crash copy
  function crashCopyCheck(tpl){
    var crashCopy = localStorage.getItem(tpl);
    if(crashCopy != null){
      var c = confirm("This page was previously closed without clearing this form. A 'crash copy' was saved in the event this was not intentional. Would you like to restore this now?\nPress OK to restore, press cancel to delete the crash copy for this template.");
      if(c == true){
        restoreCrashCopy(tpl);
        updateOutput();
        localStorage.removeItem(tpl);
      }
      else{
        localStorage.removeItem(tpl);
      }
    }
  }

  //Save crash copy of current data
  function createCrashCopy(){
    var fields = currentTemplate.ids;
    var crashCopy = [];
    for(i in fields){
      crashCopy.push(document.getElementById(fields[i]).value);
    }
    localStorage.setItem(currentTemplate.crashCopyName, JSON.stringify(crashCopy));
  }

  //Restore crash copy of current template
  function restoreCrashCopy(tpl){
    if(localStorage.getItem(tpl) != null){
      var crashCopy = JSON.parse(localStorage.getItem(tpl));

      for(i in currentTemplate.ids){
        document.getElementById(currentTemplate.ids[i]).value = crashCopy[i];
      }
    }
    else{
      console.log("Error while restoring crash copy: specified parameter returned null");
    }
  }

  //This populates the dropdown
  function populateAreaSelection(optionList){
    var parent = document.getElementById("area-selector");
    var newOption;

    //Clear dropdown
    if(parent.firstChild){
      while(parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    }

    //Add default option
    newOption = document.createElement("option");
    newOption.value = "N/A";
    newOption.innerHTML = "&lt;Please Select One&gt;";
    newOption.addEventListener("click", removeRequired, false);
    parent.appendChild(newOption);

    //Populate dropdown
    for (i in optionList){
      newOption = document.createElement("option");
      newOption.value = optionList[i];
      newOption.innerHTML = optionList[i];
      newOption.addEventListener("click", removeRequired, false);
      parent.appendChild(newOption);
    }
  }

  function addDedicatedArea(text){
    var parent = document.getElementById("area-selector");

    //Clear dropdown
    if(parent.firstChild){
      while(parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    }

    var newOption = document.createElement("option");
    newOption.value = text;
    newOption.innerHTML = text;
    newOption.addEventListener("click", removeRequired, false);
    parent.appendChild(newOption);
  }

  function getDefaultSetting(n, d) {
    var x = localStorage.getItem(n);
    if(x != null){
      return x;
    }
    else{
      localStorage.setItem(n, d);
      return d;
    }
  }

  function reloadCheck() {
    var c = window.confirm("This change will not take effect until you reload the page. Would you like to reload now?");
    if(c){
      console.log("Reloading page...");
      location.reload();
    }
    else{
      console.log("User declined reload. Setting changed will not apply until page is reloaded.");
    }
  }

  function setDisclaimer(message) {
    document.getElementById("output-disclaimer").firstChild.nodeValue = message;
  }

  function toggleCrashCopy() {
		if(enableCrashCopy == true){
			enableCrashCopy = false;
		}
		else {
			enableCrashCopy = true;
		}

		localStorage.setItem('enableCrashCopy', enableCrashCopy);
		reloadCheck();
	}
