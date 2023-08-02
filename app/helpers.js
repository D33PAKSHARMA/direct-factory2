const jwt = require('jsonwebtoken');
const { _ } = require('lodash');
const config = require("../app/config/dbconfig");
const models = require("./models");
const { ObjectId } = require('mongodb');

//Importing models
const User = models.User;


async function getUsersFullDetails(user_id) {
    let userDetails = await User.findOne({_id: user_id}).lean();
    return userDetails;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0, so we add 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0, so we add 1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function replaceNull(obj) {
  let new_obj = _.mapValues(obj, v => v === null ? '' : v);
  return new_obj;
}

module.exports = {
    getUsersFullDetails,
    formatDate,
    formatDateTime,
    replaceNull
}