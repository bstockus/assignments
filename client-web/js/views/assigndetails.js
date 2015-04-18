window.AssignmentView = Backbone.View.extend({

    tagName:"div", // Not required since 'div' is the default if no el or tagName specified

    initialize:function () {

        this.template = _.template(tpl.get('assign-details'));
        this.model.bind("change", this.render, this);
    },

    render:function (eventName) {
        var _model = this.model.toJSON();
        _model.klass = _model['class'];
        $(this.el).html(this.template(_model));
        return this;
    },

    events:{
        "change input":"change",
        "click .save":"saveAssign",
        "click .delete":"deleteAssign"
    },

    change:function (event) {
        var target = event.target;
        console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);
        // You could change your model on the spot, like this:
        // var change = {};
        // change[target.name] = target.value;
        // this.model.set(change);
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
            app.assignList.create(this.model, {
                success:function () {
                    app.navigate('assign/' + self.model.id, false);
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
                window.history.back();
            }
        });
        return false;
    }

});