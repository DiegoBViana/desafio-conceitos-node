const express = require("express");
const cors = require("cors");
//unique ID e verificador, necessario adicionar a biblioteca - yarn add UUIDV4
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

//criando middleware para verificar o id 
function ValidateId(request, response, next) {
  const { id } = request.params;
  //verificando se o id e uuid, caso nao for interrompe a acao de emite msg de erro
  if (!isUuid(id)) {
    return response.status(400).json( {error : `Invalid id`});
  };
  //passando para o proximo middleware
  return next();
};
//criando array de repositorios
const repositories = [];
//retorna a lista geral de todos os projetos no array
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});
//Insere dados no array
app.post("/repositories", (request, response) => {
  //pega os dados que sao enviados pelo body
  const { id, title, url, techs } = request.body;
  //pega os dados a serem enviados e agrupa em um objeto
  const result = { 
    id : uuid(), 
    title, 
    url, 
    techs, 
    likes : 0
  };
  //adiciona o objeto no array
  repositories.push(result);
  //retorna objeto ao usuario
  return response.json(result);
});
// altera(update) dados em um objeto do array
app.put("/repositories/:id", (request, response) => {
  // id passado como parametro da pesquisa/objeto que deseja ser alterado
  const { id } = request.params;
  //dados passados a serem alterados ou ja contidos no objeto
  const { title, url, techs, likes } = request.body;
  //resultado da busca do objeto no array (caso exista o objeto com aquele id, retorna o index dele no array)
  const result = repositories.findIndex(repositories => id === repositories.id);
  //caso o objeto nao seja encotrando, retorna -1 e emite mensagem de erro
  if (result < 0) {
    return response.status(400).json({ error: `repository not found`})
  };
  //cria objeto com todos os dados do objeto ja alterado menos o numero de likes pois so pode ser alterado pela rota /id/like mais abaixo.
  const repository = {
      id,
      title,
      url,
      techs,
      likes : repositories[result].likes
  };
  //insere objeto alterado no array
  repositories[result] = repository;
  //retorna objeto modificado para cliente
  return response.json(repository);
});
// Deleta um objeto do array
app.delete("/repositories/:id", ValidateId, (request, response) => {
  // id passado como parametro da pesquisa/objeto que deseja ser alterado/deletado
  const { id } = request.params;
  //resultado da busca do objeto no array (caso exista o objeto com aquele id, retorna o index dele no array)
  const result = repositories.findIndex(repositories => id === repositories.id);
  //caso o objeto nao seja encotrando, retorna -1 e emite mensagem de erro
  if (result < 0) {
    return response.status(400).json({ error: `repository not found`})
  };
  //removendo objeto do array
  repositories.splice(result, 1);
  //Retorna resposta ao cliente
  return response.status(204).send();
});
//insere like no array
app.post("/repositories/:id/like", (request, response) => {
  // id passado como parametro da pesquisa/objeto que deseja ser alterado
  const { id } = request.params;
  //verifica se existe o repositorio que esta sendo dado like
  const result = repositories.findIndex(repositories => id === repositories.id);
  //caso o objeto nao seja encotrando, retorna -1 e emite mensagem de erro
  if (result < 0) {
    return response.status(400).json({ error: `repository not found`})
  };
  //pegando a qtd de like do objeto do array encontrado e incrementando
  const qtLike = repositories[result].likes + 1;
  //modificando a qtd de like do obj do array
  repositories[result].likes = qtLike;
  //retornando pro usuario a resposta
  return response.json(repositories[result]);
});

module.exports = app;
