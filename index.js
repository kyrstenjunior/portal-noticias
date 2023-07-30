// Dependências e requires
const express = require("express"); // dependencia npm melhor performance no cód.
const app = express();
const mongoose = require("mongoose"); // dependencia npm MongoDB
const path = require("path");
const bodyParser = require("body-parser"); // dependencia npm
const Posts = require("./Posts"); // Schema e model criado para tipagem das entradas de informações
var session = require('express-session'); // dependencia npm para dados persistentes, salvar dados em logins

/* --------------------------------------------------------------------------------------------------------- */

// MongoDB
mongoose.set("strictQuery", true);

mongoose.connect("mongodb+srv://root:Z3rezGoYh2ABIN5q@cluster0.2mftcbu.mongodb.net/kyrstenjr?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
  console.log("Conectado com sucesso!");
}).catch((err) => {
  console.log(err.message);
})

/* --------------------------------------------------------------------------------------------------------- */

// Configurações e rotas da aplicação
app.engine("html", require("ejs").renderFile); // setando engine para renderizar com o ejs do tipo "html"
app.set("view engine", "html"); // setando view engine do tipo "html"
app.use("/public", express.static(path.join(__dirname, "public"))); // setando diretório estático para arquivos, fotos, css, etc, na pasta "public"
app.set("views", path.join(__dirname, "/pages")); // setando pasta onde estão as views (páginas da aplicação)

app.use(bodyParser.json()); // suporte para integração com form do html
app.use(bodyParser.urlencoded({extended: true})); // suporte para integração com form do html

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));

app.get("/", async (req, res) => {
  // as querys são comandos, neste caso, está sendo usado para o comando de busca
  if(req.query.busca == null){
    // deixando as chaves vazias no find(), quer dizer para retornar TUDO. O sort() vai ordenar o retorno pelo "_id" em ordem decrescente indicado pelo -1.
    await Posts.find({}).sort({"_id": -1}).exec((err, posts) => {

      posts = posts.map((val) => {
        return {
          titulo: val.titulo,
          conteudo: val.conteudo,
          descricaoCurta: val.conteudo.substring(0,100),
          imagem: val.imagem,
          slug: val.slug,
          categoria: val.categoria,
          autor: val.autor,
          views: val.views
        }
      });

      Posts.find({}).sort({"views": -1}).limit(3).exec((err, postsTop) => {
        postsTop = postsTop.map((val) => {
          return{
            titulo: val.titulo,
            conteudo: val.conteudo,
            descricaoCurta: val.conteudo.substring(0,100),
            imagem: val.imagem,
            slug: val.slug,
            categoria: val.categoria,
            autor: val.autor,
            views: val.views
          }
        });
  
        res.render("home", {posts: posts, postsTop: postsTop})
  
      });

    });

  } else {
    // regex busca por parte de palavras, neste caso nos titulo como foi setado abaixo. O options é para busca ter melhor performance
    Posts.find({titulo: {$regex: req.query.busca, $options: "i"}}, (err, posts) => {

      posts = posts.map((val) => {
        return {
          titulo: val.titulo,
          conteudo: val.conteudo,
          descricaoCurta: val.conteudo.substring(0,100),
          imagem: val.imagem,
          slug: val.slug,
          categoria: val.categoria,
          autor: val.autor,
          views: val.views
        }
      });

      res.render("busca", {posts: posts, contagem: posts.length});
    })
  }
})

app.get("/:slug", (req, res) => {
  // com o slug, ele puxa o que está depois da barra na url
  // res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc: {views: 1}}, {new: true}, (err, resposta) => {
      // console.log(resposta);
      if(resposta != null){
        Posts.find({}).sort({"views": -1}).limit(3).exec((err, postsTop) => {
          postsTop = postsTop.map((val) => {
            return{
              titulo: val.titulo,
              conteudo: val.conteudo,
              descricaoCurta: val.conteudo.substring(0,100),
              imagem: val.imagem,
              slug: val.slug,
              categoria: val.categoria,
              autor: val.autor,
              views: val.views
            }
          });
          res.render("single", {noticia: resposta, postsTop: postsTop});
        })
      } else {
        res.render("erro404", {});
      }
    });
});

/* --------------------------------------------------------------------------------------------------------- */

//Express session - Login ADM
var usuarios = [
  // array para usuário e senha para acessar painel adm
  {login: "junior", senha: "123456"}
];

app.post("/admin/login", (req, res) => {
  // rota para validar login e senha inseridos no formulário
  usuarios.map((val) => {
    if(val.login == req.body.login && val.senha == req.body.senha){
      req.session.login = "junior";
    }
  });

  res.redirect("/admin/login");
});

app.get("/admin/login", async (req, res) => {
  // rota para renderizar as páginas de login e adm
  if(req.session.login == null){
    res.render("admin-login");
  }else{
    await Posts.find({}).sort({"_id": -1}).exec((err, posts) => {

      posts = posts.map((val) => {
        return {
          id: val._id,
          titulo: val.titulo
        }
      });
  
      res.render("admin-panel", {posts: posts})
    });
  }
});

app.post("/admin/cadastro", (req, res) => {
  // rota para cadastrar novas noticias no MongoDB

  Posts.create({
    titulo: req.body.titulo_noticia,
    imagem: req.body.url_imagem,
    categoria: req.body.categoria,
    conteudo: req.body.noticia,
    slug: req.body.slug,
    views: 0,
    autor: "Admin"
  });

  res.redirect("/admin/login");
});

app.get("/admin/deletar/:id", (req, res) => {
  // rota para deletar noticia selecionada
  Posts.deleteOne({_id: req.params.id}).then(() => {
    res.redirect("/admin/login");
  });
});

/* --------------------------------------------------------------------------------------------------------- */

// Rodar o servidor
app.listen(5000, () => {
  //      porta  callback
  console.log("Servidor rodando...");
});

/* --------------------------------------------------------------------------------------------------------- */