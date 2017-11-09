/**
 * 配置处理用户相关请求的路由模块
 */
var sms_util = require('./sms_util')

module.exports = function (router) {

    //保存所有phone:code的对象
    var users = {};
    // 模拟数据库用户表数据
    var db_users= [
      {_id: 1, phone: '13716962779'},
      {_id: 2, phone: '13716961234'},
      {_id: 3, phone: '13716962345'},
    ]
    /*
    发送验证码短信
     */
    router.get('/sendcode', function (req, res, next) {
        //1. 获取请求参数数据
        var phone = req.query.phone;
        //2. 处理数据
            //生成验证码(6位随机数)
        var code = sms_util.randomCode(6);
            //发送给指定的手机号
        console.log(`向${phone}发送验证码短信: ${code}`);
        sms_util.sendCode(phone, code, function (success) {//success表示是否成功
            if(success) {
                //存储数据
                users[phone] = code;
                console.log('保存验证码: ', phone, code)
            }
        })

        //3. 返回响应数据
        res.send({"code": 0})
    })


    /*
    登陆
     */
    router.post('/login', function (req, res, next) {
        // /login?phone=13716962779&code=123123
        var phone = req.body.phone;
        var code = req.body.code;
        console.log('/login', phone, code);

        //检查code是否正确, 如果不正确, 返回{"code" : 1}
        if(users[phone]!=code) {
            res.send({code : 1});
            console.log('返回响应---不正确')
            return;
        }
        //删除保存的code
        delete users[phone];

        //模拟: 查询数据库表, 如果有, 返回, 如果没有添加
      // 根据phone在表中查找
      let user = db_users.find(user => user.phone===phone)
      // 如果存在, 返回包含user数据的对象
      if(user!=null) {
        res.send({
          "code": 0,
          "data": user
        })
        console.log('返回响应---查询')
        // 如果不存在, 添加一个新的user到表中, 并返回包含user数据的对象
      } else {
        user = {id: Date.now(), phone: phone}
        db_users.push(user)
        res.send({
          "code": 0,
          "data": user
        })
        console.log('返回响应---添加')
      }
    })
}