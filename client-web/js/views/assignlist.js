window.AssignmentsListView = Backbone.View.extend({
    
    tagName: "ul",
    className: "list-unstyled",
    selectedItem: undefined,
    initialSelectedItemId: undefined,
    
    initialize:function (params) {
        this.initialSelectedItemId = params.initialSelectedItemId;
        console.log("initialize: " + this.initialSelectedItemId);
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (assignment) {
            console.log("add: " + assignment);
            var assigmentsListItemView = new AssignmentsListItemView({model:assignment});
            assigmentsListItemView.on('changeSelection', this.setSelectedItem, this);
            if (self.initialSelectedItemId == assignment.id) {
                assigmentsListItemView.select();
                self.initialSelectedItemId = null;
            }
            $(self.el).append(assigmentsListItemView.render().el);
        });
    },
 
    render:function (eventName) {
        _.each(this.model.models, function (assignment) {
            var assigmentsListItemView = new AssignmentsListItemView({model:assignment});
            assigmentsListItemView.on('changeSelection', this.setSelectedItem, this);
            if (this.initialSelectedItemId == assignment.id) {
                assigmentsListItemView.select();
                this.initialSelectedItemId = null;
            }
            $(this.el).append(assigmentsListItemView.render().el);
        }, this);
        return this;
    },

    setSelectedItem: function (newSelectedItem){
        console.log("clearAllSelections");
        if ( this.selectedItem ) {
            this.selectedItem.deSelect();
        }
        this.selectedItem = newSelectedItem;
    }
});

window.AssignmentsListItemView = Backbone.View.extend({
 
    tagName:"li",
    className: "assignments-list-item",

    events: {
        "change #completed": "changeCompletionStatus",
        "click": "select"
    },
 
    initialize:function () {
        this.template = _.template(tpl.get('assign-list-item'));
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },
 
    render:function (eventName) {
        var _model = this.model.toJSON();
        _model.klass = _model['class'];
        $(this.el).html(this.template(_model));
        return this;
    },
 
    close:function () {
        $(this.el).unbind();
        $(this.el).remove();
    },

    select: function (){
        console.log("select");
        if ( !this.$el.hasClass('selected') ) {
            assignsApp.navigate("assign/" + this.model.get("id"), {trigger: true});
            this.trigger('changeSelection', this);
            this.$el.addClass('selected');
        }
        
        $(this.el).addClass("selected");
    },

    deSelect: function (){
        console.log("deSelect");
        this.$el.removeClass('selected');
    },

    changeCompletionStatus: function() {
        //console.log("changeCompletionStatus");
        this.model.set({
            completed: $("#completed").prop('checked')
        });
        this.model.save();
    }
});