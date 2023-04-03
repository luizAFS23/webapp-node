//Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const session = require('express-session')
const flash = require('connect-flash')
const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')
require('./models/Postagem')
require('./models/Categoria')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)

//Configurações
    //Sessão
        app.use(session({ //app.use - criação e configuração de middlewares
            secret: 'nodeapp',
            resave: true,
            saveUninitialized: true
        }))
        //SEMPRE colocar o app.use do passport entre o session e o flash
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())


    //Middleware
        app.use(function(req, res, next){
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash('error')
            next();
            res.locals.user = req.user || null;
        })
        
    //Body Parser
        app.use(bodyParser.urlencoded({extend: false}));
        app.use(bodyParser.json());
    //Handlebars
        app.engine('handlebars', handlebars.engine({
            defaultLayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
            }
        }));
        app.set('view engine', 'handlebars');
    //Mongooses
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://127.0.0.1/blogapp").then(() => {
            console.log('Conectado ao Mongo com sucesso!')
        }).catch((err) => {
            console.log('Erro ao se conectar: ' + err)
        })
    //Public
        app.use(express.static(path.join(__dirname,"public")));

    //Middleware
        // app.use((req, res, next) =>{
        //     console.log("Oi, eu sou um middleware");
        //     next();
        // })

//Rotas
    app.get('/', (req,res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) =>{
            res.render("index", {postagens: postagens})
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })

    })

    app.get("/postagem/:slug", (req,res) =>{
        Postagem.findOne({slug: req.params.slug}).then((postagem) =>{
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash("error_msg", 'Esta postagem não existe')
                res.redirect("/")
            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get('/404', (req, res) =>{
        res.send('Erro 404!');
    })


    app.get('/categorias', (req,res) =>{
        Categoria.find().then((categorias) =>{
            res.render('categorias/index', {categorias: categorias})
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get('/categorias/:slug', (req,res) =>{
        Categoria.findOne({slug: req.params.slug}).then((categoria) =>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) =>{
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch((err) =>{
                    req.flash("error_msg", 'houve um erro ao listar os posts.')
                    res.redirect("/")
                })
            }else{
                req.flash('error_msg', 'esta categoria nao existe.')
                res.redirect('/')
            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno ao carregar a pagina desta categoria.")
            res.redirect("/")
        })
    })

    app.use('/admin', admin);
    app.use('/usuarios', usuarios)


//Outros
const PORT = process.env.PORT || 3030;;
app.listen(PORT, () =>{
    console.log("Servidor rodando...");
}
)