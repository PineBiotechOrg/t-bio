apos.define('comments-form-widgets', {
    extend: 'apostrophe-pieces-widgets',
    construct: function (self, options) {
        self.play = function ($widget, data, options) {
            var $form = $widget.find('[data-comments-form]');
            var schema = self.options.submitComments;
            var piece = _.cloneDeep(self.options.piece);

            return apos.schemas.populate($form , schema , piece , function(err){
                if(err){
                    alert('A problem occured setting up the comment form');
                    return;
                }
                enableSubmit();
            });

            function enableSubmit(){
                $form.on('submit' , function(e){

                    submit();
                    console.log("Submit and Return False");
                    return false;
                });
            }

            function submit(){
                return async.series([
                    convert,
                    submitToServer
                ],function(err){
                    if(err){
                        console.log( err );
                    }
                    console.log("Submit Sucess");
                })
            }

            function convert(callback){
                return apos.schemas.convert($form , schema , piece, callback);
            }

            function submitToServer(callback){
                return self.api('submit' ,piece, function(data){
                    if(data.status === 'ok'){
                        // All is well
                        return callback(null);
                    }
                    // API Level error
                    return callback('error');
                },function(err){
                    // Transport-level error
                    return callback(err);
                });
            }
        };
    }
});