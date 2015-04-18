window.AssignmentsListView = Backbone.View.extend({
    
    tagName: "ul",
    initialize:function () {
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (assignment) {
            $(self.el).append(new AssignmentsListItemView({model:assignment}).render().el);
        });
    },
 
    render:function (eventName) {
        _.each(this.model.models, function (assignment) {
            $(this.el).append(new AssignmentsListItemView({model:assignment}).render().el);
        }, this);
        return this;
    }
});

window.AssignmentsListItemView = Backbone.View.extend({
 
    tagName:"li",

    events: {
        "change #completed": "changeCompletionStatus"
    },
 
    initialize:function () {
        this.template = _.template(tpl.get('assign-list-item'));
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },
 
    render:function (eventName) {
        //console.log(this.model.toJSON());
        //console.log(this.template(this.model.toJSON()));
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
 
    close:function () {
        $(this.el).unbind();
        $(this.el).remove();
    },

    changeCompletionStatus: function() {
        this.model.set({
            completed: $("#completed").prop('checked')
        });
        this.model.save();
    }
});