const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categorias = mongoose.model('categorias')
require("../models/Postagem")
const Postagem = mongoose.model('postagens')
//De dentro do eAdmin.js, pegar apenas a função eAdmin:
const {eAdmin} = require('../helpers/eAdmin')



router.get('/', eAdmin, (req, res) =>{
    res.render('./admin/index.handlebars') //criar diretorios
})

router.get('/posts', eAdmin,(req,res) =>{
    res.send('Paginas de posts');
})

router.get('/categorias', eAdmin,(req, res) => {
    Categorias.find().lean().then((categorias) =>{
        res.render('../views/admin/categorias.handlebars',{categorias: categorias});
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin,(req, res) => {
    res.render('../views/admin/addcategoria.handlebars')
})



router.post('/categorias/nova', eAdmin, function(req,res){
    //Validações
        var erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: 'Nome inválido.'})
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: 'Slug inválido.'})
        }

        if(req.body.nome.length < 2){
            erros.push({texto: 'Nome da categoria muito pequeno.'})
        }

        if(erros.length > 0){
            res.render('admin/addcategoria', {erros: erros})
        }else{
            const novaCategoria = {
                //fazer referencia dos inputs dentro do addcategorias.handlebars
                nome: req.body.nome,
                slug: req.body.slug
            }
            
        new Categorias(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar a categoria")
            res.redirect('/admin')
        })
        }   

})

router.get('/categorias/edit/:id', eAdmin,(req,res) =>{
    Categorias.findOne({_id: req.params.id}).lean().then((categoria) =>{
        res.render('./admin/editcategoria', {categoria: categoria})
    }).catch((err) =>{
        req.flash('error_msg', "Esta categoria não existe")
        res.redirect('/admin/categorias')
    })

})

router.post('/categorias/edit', eAdmin,(req,res) =>{
    Categorias.findOne({_id: req.body.id}).then((categoria) =>{

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() =>{
            res.flash("success_msg", "Categoria editada com sucesso")
            res.redirect('/admin/categorias')
        }).catch((err) =>{
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria')
            res.redirect('/admin/categorias')
        })


    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', eAdmin,(req,res) =>{
    Categorias.deleteOne({_id: req.body.id}).then(() =>{
        req.flash('success_msg', 'Categoria removida com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })

})

router.get('/postagens', eAdmin,(req,res) =>{
    Postagem.find().populate({path: 'categorias', strictPopulate: false}).sort({data:"desc"}).then((postagens) =>{
        res.render('./admin/postagens', {postagens: postagens})
    }).catch((err) =>{
        req.flash('error_msg', 'Ocorreu um erro.')
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin,(req,res) => {
    Categorias.find().lean().then((categorias) =>{
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", 'Houve um erro.')
        res.redirect("/admin")
    })
})

router.post('/postagens/nova', eAdmin,(req,res) =>{
    var erros = []
    if(req.body.categoria == '0'){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }
    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() =>{
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash('error_msg', 'Ocorreu um erro durante o salvament da postagem.')
            res.redirect("/admin/postagens")
        })
    }
})

router.get('/postagens/edit/:id', eAdmin,(req, res) =>{
    
    Postagem.findOne({_id:req.params.id}).lean().then((postagem) => { 
        
        Categorias.find().lean().then((categoria) => {
                res.render('admin/editpostagens', {categorias: categoria, postagem: postagem})
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar as categorias')
                res.redirect('/admin/postagens')
            })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição')
        res.redirect('/admin/postagens')
    })
})


router.post('/postagens/edit', eAdmin,(req, res) => {

    Postagem.findOne({_id:req.body.id}).lean().then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        // postagem.data = req.body.date   // se esta linha for valida não aparece a data depois da atualização

        postagem.save().then(() => {

            req.flash('success_msg', 'Postagem atualizada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro na atualização da postagem')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro na edição da postagem ' )
        res.redirect('/admin/postagens')
    })

})

router.get('/postagens/deletar/:id', eAdmin,(req,res) =>{
    Postagem.deleteOne({_id:req.params.id}).then(() =>{
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno' )
        res.redirect('/admin/postagens')
    })
})


module.exports = router
