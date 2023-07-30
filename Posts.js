var mongoose = require("mongoose");
var Schema = mongoose.Schema; // Define um padrão estrutural do nosso documento, serve para manipular ou adicionar dados.

var postSchema = new Schema({
  titulo: String,
  imagem: String,
  categoria: String,
  conteudo: String,
  slug: String,
  views: Number,
  autor: String
}, {collection: "posts"});

var Posts = mongoose.model("Posts", postSchema);

module.exports = Posts;