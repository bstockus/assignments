window.AssignmentView = Backbone.View.extend({

    tagName:"div", // Not required since 'div' is the default if no el or tagName specified

    initialize:function () {

        this.template = _.template(tpl.get('assign-details'));
        this.model.bind("change", this.render, this);
    },

    render:function (eventName) {
        console.log("detailsRender");
        var _model = this.model.toJSON();
        _model.klass = _model['class'];
        $(this.el).html(this.template(_model));
        $('#due_date', this.el).datepicker({
            format: "yyyy-mm-dd"
        });
        if (this.model.isNew()) {
            $('#assignId', this.el).val("NEW");
        }
        return this;
    },

    events:{
        "change input":"change",
        "click .save":"saveAssign",
        "click .delete":"deleteAssign"
    },

    change:function (event) {
        var target = event.target;
    },

    saveAssign:function () {
        this.model.set({
            title:$('#title').val(),
            description:$('#description').val(),
            "class":$('#class').val(),
            due_date:$('#due_date').val(),
        });
        if (this.model.isNew()) {
            var self = this;
            assignsApp.assignList.create(this.model, {
                success:function () {
                    console.log("success");
                    assignsApp.navigate('assign/' + self.model.id, true);
                }
            });
        } else {
            this.model.save();
        }

        return false;
    },

    deleteAssign:function () {
        this.model.destroy({
            success:function () {
                alert('Assignment deleted successfully');
                assignsApp.navigate("", {trigger: true});
            }
        });
        return false;
    }

});