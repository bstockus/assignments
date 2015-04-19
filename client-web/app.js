$.ajax({
	url: "http://107.178.246.119:80/api/login/v1/login",
	data: JSON.stringify({
		"username": "user2",
		"password": "password"
	}), method: "POST",
	contentType: "application/json"
}).done(function (){

	Backbone.ajax = function (request){
		request['xhrFields'] = {
			withCredentials: true
		};
		request['crossDomain'] = true;
		//console.log(request);
		$.ajax(request);
	};

	Backbone.View.prototype.close = function () {
	    console.log('Closing view ' + this);
	    if (this.beforeClose) {
	        this.beforeClose();
	    }
	    this.remove();
	    this.unbind();
	};

	// Router
	var AppRouter = Backbone.Router.extend({
	 
	    routes:{
	        "":"list",
	        "assign/new":"newAssign",
	        "assign/:id":"assignDetails"
	    },

	    assignmentsListView: null,
	 
	    initialize:function () {
	        $('#header').html(new HeaderView().render().el);
	    },
	 
	    list:function () {
	    	console.log("list");
	        this.before(null);
	    },
	 
	    assignDetails:function (id) {
	    	console.log("assignDetails: " + id);
	        this.before(id, function () {
	        	//assignsApp.assignmentsListView.clearAllSelections();
	            var assign = assignsApp.assignList.get(id);
	            assignsApp.showView('#content', new AssignmentView({model:assign}));
	        });
	    },

	    newAssign:function () {
	    	console.log("new")
	        this.before(null, function () {
	        	assignsApp.assignmentsListView.setSelectedItem(null);
	            assignsApp.showView('#content', new AssignmentView({model:new Assignment()}));
	        });
	    },

	    showView:function (selector, view) {
	    	console.log("showView");
	        if (this.currentView)
	            this.currentView.close();
	        $(selector).html(view.render().el);
	        this.currentView = view;
	        return view;
	    },

	    before:function (id, callback) {
	    	console.log("before: " + id);
            this.assignList = new AssignmentsCollection();
            var _this = this;
            this.assignList.fetch({success:function (){
            	var assignmentsListView = new AssignmentsListView({model:assignsApp.assignList, initialSelectedItemId: id});
            	_this.assignmentsListView = assignmentsListView;
                $('#sidebar').html(assignmentsListView.render().el);
                if (callback) callback();
            }});
    	}
	 
	});
	 
	tpl.loadTemplates(['header', 'assign-details', 'assign-list-item'], function () {
	    window.assignsApp = new AppRouter();
	    Backbone.history.start();
	});


});

