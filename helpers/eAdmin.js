module.exports = {
    //Permitir que apenas usuarios autenticados entrem nas rotas admin
    eAdmin: function(req,res,next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }
        req.flash('error_msg', 'Você precisa ser um admin para entrar aqui.')
        res.redirect('/')
    }
}
