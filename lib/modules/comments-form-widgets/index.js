module.exports = {
    extend : 'apostrophe-pieces-widgets',
    label : 'Comments Form',
    contextualOnly : true,
    scene : 'user', // to enable AJAX on page
    piecesModuleName : 'comments',
    construct : function(self , options){
        self.pushAsset('script' , 'always' , {when : 'always'});
        self.pushAsset('stylesheet' , 'commentWidget' , {when : 'always'});

        self.forms = self.apos.comments;

        self.output = function(widget , options){
            return self.partial(self.template , {
                widget : widget,
                options :options,
                manager : self,
                schema : self.forms.submitComments
            });
        };

        self.route('post' , 'submit' , function(req , res){
            return self.forms.submit(req, function(err){
                return res.send({status : err ? 'error' : 'ok'});
            })
        });

        var superGetCreateSingletonOptions = self.getCreateSingletonOptions;

        self.getCreateSingletonOptions = function(req){
            var options = superGetCreateSingletonOptions(req);
            options.submitComments = self.forms.submitComments;
            options.piece = self.forms.newInstance();
            return options;
        }
    }
}