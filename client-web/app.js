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
	 
	    initialize:function () {
	        $('#header').html(new HeaderView().render().el);
	    },
	 
	    list:function () {
	        this.before();
	    },
	 
	    assignDetails:function (id) {
	        this.before(function () {
	            var assign = app.assignList.get(id);
	            app.showView('#content', new AssignmentView({model:assign}));
	        });
	    },

	    newAssign:function () {
	        this.before(function () {
	            app.showView('#content', new AssignmentView({model:new Assignment()}));
	        });
	    },

	    showView:function (selector, view) {
	        if (this.currentView)
	            this.currentView.close();
	        $(selector).html(view.render().el);
	        this.currentView = view;
	        return view;
	    },

	    before:function (callback) {
	        if (this.assignList) {
	            if (callback) callback();
	        } else {
	            this.assignList = new AssignmentsCollection();
	            this.assignList.fetch({success:function () {
	                $('#sidebar').html(new AssignmentsListView({model:app.assignList}).render().el);
	                if (callback) callback();
	            }});
	        }
    }
	 
	});
	 
	tpl.loadTemplates(['header', 'assign-details', 'assign-list-item'], function () {
	    app = new AppRouter();
	    Backbone.history.start();
	});


});

