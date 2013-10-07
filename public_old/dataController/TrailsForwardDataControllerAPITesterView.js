function TrailsForwardDataControllerAPITesterView(){

	this.MESSAGE_P = "messageP";
	this.METHODS_DIV = "methodsDiv";
	this.TEST_DISPLAY_DIV = "testDisplayDiv";
	this.METHOD_DETAILS_DIV = "methodDetailsDiv";
	this.METHOD_BUTTON = "methodButton";
	this.CONFIRM_BUTTON = "confirmButton";
	this.ADD_TEST = "Add Test";
	this.BACK = "Back";
	this.PARAMETER_DIV = "parameterDiv";
	this.PARAMETER_VALUE_INPUT = "parameterTextInput";
	this.SELECT_TESTS_TO_RUN = "Select tests to run.";
	
}

TrailsForwardDataControllerAPITesterView.prototype = {

	constructor : TrailsForwardDataControllerAPITesterView,
	
	appendMethodToMethodsDiv : function(theMethod){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.appendMethodToMethodsDiv", ["theMethod"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));
		if(theMethod)
			this.appendTestButtonWithNameToDiv(theMethod.name, this.METHODS_DIV);
		else console.log("bad input");
	},
	
	backToTestSelection : function(){
		TF_DC_API_TESTER.VIEW.hideDivNamed(TF_DC_API_TESTER.VIEW.METHOD_DETAILS_DIV);
		TF_DC_API_TESTER.VIEW.showDivNamed(TF_DC_API_TESTER.VIEW.METHODS_DIV);
	},
	
	showDivNamed : function(div_name){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.showDivNamed", ["div_name"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		if(div_name)
			document.getElementById(div_name).style.display = "inline-block";
		else console.log("bad input");
	},
	
	getMethodArgumentsFromDetailsDiv : function(){
		var the_args = document.getElementsByClassName(this.PARAMETER_VALUE_INPUT);
		arg_values = [];
		for(var i = 0; i < the_args.length; i++){
			if(the_args[i].value == "")
				return null;
			else
				arg_values.push(the_args[i].value);
		}
		return arg_values;
	},
	
	hideDivNamed : function(div_name){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.hideDivNamed", ["div_name"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		document.getElementById(div_name).style.display = "none";	
	},
	
	appendTestButtonWithNameToDiv : function(test_name, div_name){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.appendTestButtonWithNameToDiv", ["test_name", "div_name"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		if(test_name && div_name)
			TF_DC_API_TESTER.VIEW.appendButtonWithClassNameTextAndCallbackToDiv(TF_DC_API_TESTER.VIEW.METHOD_BUTTON, test_name, 
					function(){TF_DC_API_TESTER.userClickedMethod(test_name);}, TF_DC_API_TESTER.VIEW.METHODS_DIV);
		else console.log("bad input");
	},
	
	appendButtonWithClassNameTextAndCallbackToDiv : function(class_name, text, callback_function, div_name){
		console.log("class_name: " + class_name + ", text: " + text + ", div_name: " + div_name);
		if(class_name && text && callback_function && div_name){
			var input = document.createElement("div");
			input.className = class_name;
			input.innerHTML = text;
			input.addEventListener("click", callback_function);
			document.getElementById(div_name).appendChild(input);	
		}
		else console.log("bad input");
	},
	
	showMethodDetailsDisplayForMethod : function(method_name){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.showMethodDetailsDisplayForMethod", ["method_name"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		if(method_name){
			this.prepareMethodDetailsDivForMethod(method_name);
			this.hideDivNamed(this.METHODS_DIV);
			this.showDivNamed(this.METHOD_DETAILS_DIV);
		}
		else console.log("bad input");
	},
	
	prepareMethodDetailsDivForMethod : function(the_method){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.prepareMethodDetailsDivForMethod", ["method_name"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		if(the_method){
			var theDiv = document.getElementById(this.METHOD_DETAILS_DIV);
			theDiv.innerHTML = the_method.name + ":<br/><br/>";
			for(var i = 0; i < the_method.parameter_names.length; i++)
				this.appendParameterNameAndTypeDivToDiv(the_method.parameter_names[i], the_method.parameter_types[i], this.METHOD_DETAILS_DIV);
				
			this.appendButtonWithClassNameTextAndCallbackToDiv(this.CONFIRM_BUTTON, this.ADD_TEST, function(){TF_DC_API_TESTER.appendTestToTestList(the_method.name);} , this.METHOD_DETAILS_DIV);
			this.appendButtonWithClassNameTextAndCallbackToDiv(this.CONFIRM_BUTTON, this.BACK, this.backToTestSelection, this.METHOD_DETAILS_DIV);
		}
		else console.log("bad input");
	},
	
	appendTestToTestDisplayWithName : function(test_name){
		this.appendButtonWithClassNameTextAndCallbackToDiv(TF_DC_API_TESTER.METHOD_BUTTON,
				test_name, function(){TF_DC_API_TESTER.updateSelectedTestWithName(method_name);},
				TF_DC_API_TESTER.TEST_DISPLAY_DIV);
	},
	
	appendParameterNameAndTypeDivToDiv : function(parameter_name, parameter_type, div_name){
		var text_input = document.createElement("input");
		text_input.className = this.PARAMETER_VALUE_INPUT;
		var new_div = document.createElement("div");
		new_div.className = this.PARAMETER_DIV;
		new_div.innerHTML += parameter_name + "(" + parameter_type + "): ";
		new_div.appendChild(text_input);
		
		document.getElementById(div_name).appendChild(new_div);
	},
	
	setMessageParagraphTextTo : function(theText){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.setMessageParagraphTextTo", ["theText"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		if(theText)
			document.getElementById(this.MESSAGE_P).innerHTML = theText;
		else console.log("bad input");
	},
	
};
	
