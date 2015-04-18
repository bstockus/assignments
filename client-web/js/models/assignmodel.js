window.Assignment = Backbone.Model.extend({
    urlRoot: "http://107.178.246.119:80/api/assigns/v1/assigns",
    defaults: {
        id: null,
        class: "",
        title: "",
        due_date: "",
        description: "",
        completed: false
    }
});

window.AssignmentsCollection = Backbone.Collection.extend({
	model: Assignment,
	url: "http://107.178.246.119:80/api/assigns/v1/assigns",
	parse: function(response) {
	    return response.assigns;
	}
});