const helper = require('../../helpers/wrapper')
const bcrypt = require('bcrypt')
const authModel = require('./auth_model')
require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = {
  register: async (req, res) => {
    try {
      const { userFullName, userPassword } = req.body
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync(userPassword, salt)
      console.log(`before Encrypt = ${userPassword}`)
      console.log(`after Encrypt = ${encryptPassword}`)
      const setData = {
        user_name: userFullName,
        user_password: encryptPassword
      }
      console.log(setData)
      const result = await authModel.register(setData)
      delete result.user_password
      return helper.response(res, 200, 'Success Register User', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  login: async (req, res) => {
    try {
      // console.log(req.body)
      const { userFullName, userPassword } = req.body
      const checkUserFullName = await authModel.getDataConditions({
        user_name: userFullName
      })

      if (checkUserFullName.length > 0) {
        // if (checkUserFullName[0].is_verified === '0') {
        //    return helper.response(res, 403, 'Account is not verified')
        // }

        const checkPassword = bcrypt.compareSync(
          userPassword,
          checkUserFullName[0].user_password
        )

        if (checkPassword) {
          console.log('User berhasil login')
          const payload = checkUserFullName[0]
          delete payload.user_password
          const token = jwt.sign({ ...payload }, process.env.PRIVATE_KEY, {
            expiresIn: '24h'
          })

          const result = { ...payload, token }
          return helper.response(res, 200, 'Succes Login !', result)
        } else {
          return helper.response(res, 400, 'Worng password')
        }
      } else {
        return helper.response(res, 404, 'Email not Registed')
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
