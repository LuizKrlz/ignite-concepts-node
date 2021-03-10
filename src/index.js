const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const exists = users.find(user => user.username === username)

  if (!exists) {
    return response.status(404).send({ error: 'User not found'})
  }

  request.user = exists

  return next()
}

function checkIfUserAlreadyExists (request, response, next) {
  const { username } = request.body

  const userExists = users.find(user => user.username === username)

  if (userExists) {
    return response.status(400).send({ error: 'User already exists' })
  }

  return next()
}

app.post('/users', checkIfUserAlreadyExists, (request, response) => {
  const { name, username } = request.body

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }
  
  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newdeadline = new Date(deadline)

  const newtodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: newdeadline, 
    created_at: new Date()
  }

  user.todos.push(newtodo)

  return response.status(201).json(newtodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  const { title, deadline } = request.body

  let indexTodo = user.todos.findIndex(todo => todo.id === id)
  
  let todo = user.todos[indexTodo]

  if (!todo) {
    return response.status(404).send({ error: 'Todo not found' })
  }
  const newtodo = {
    ...todo,
    title, 
    deadline: new Date(deadline)
  }

  user.todos[indexTodo] = newtodo

  return response.status(201).json(newtodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  let indexTodo = user.todos.findIndex(todo => todo.id === id)
  let todo = user.todos[indexTodo]

  if (!todo) {
    return response.status(404).send({ error: 'Todo not found' })
  }

  user.todos[indexTodo] = {
    ...todo,
    done: true
  }

  return response.status(201).json(user.todos[indexTodo])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  let todo = user.todos.find(todo => todo.id === id)
  
  if (!todo) {
    return response.status(404).send({ error: 'Todo not found' })
  }

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;