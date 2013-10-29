

function TrailsForwardTestingGlobals(dataController){
	this.DC_API_TESTER = new TrailsForwardDataControllerTester(dataController);
	this.MODEL = new TrailsForwardDataControllerAPITesterModel();
	this.VIEW = new TrailsForwardDataControllerTesterView();
}

TrailsForwardTestingGlobals.prototype = {

	constructor : TrailsForwardTestingGlobals,

};
