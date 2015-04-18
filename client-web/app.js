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
		console.log(request);
		$.ajax(request);
	};

	window.Assignment = Backbone.Model.extend({
		urlRoot: "http://107.178.246.119:80/api/assigns/v1/assigns"
	});

	window.AssignmentsCollection = Backbone.Collection.extend({
		model: Assignment,
		url: "http://107.178.246.119:80/api/assigns/v1/assigns"
	});

	var assignmentCollection = new AssignmentsCollection();
	assignmentCollection.fetch();

	console.log(assignmentCollection.toJSON());
});

