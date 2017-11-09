# 短信验证码登陆(使用容联云通信)

## 1. 成为容联平台的开发者
    注册账号
    自动分配相关信息
        ACCOUNT_SID: 账户id, 唯一
        AUTH_TOKEN: 授权令牌, 唯一
        Rest_URL: 基本url, 一样
        AppID: 应用ID, 唯一
    添加测试号码

## 2. 请求容联发送验证码短信
    1). 下载依赖包
        npm install --save blueimp-md5 js-base64 moment request
    2). 编写请求代码: login/sms_util.js
        /*
        用于生成短信验证码和发送验证码短信的工具模块
         */
        var md5 = require('blueimp-md5')
        var moment = require('moment')
        var Base64 = require('js-base64').Base64
        var request = require('request')
        
        /*
         生成指定长度的随机数
         */
        function randomCode(length) {
            var chars = ['0','1','2','3','4','5','6','7','8','9']
            var result = "" // 统一改名: alt + shift + R
            for(var i = 0; i < length ; i ++) {
                var index = Math.ceil(Math.random()*9)
                result += chars[index]
            }
            return result
        }
        exports.randomCode = randomCode
        
        /*
        向指定号码发送指定验证码
         */
        function sendCode(phone, code, callback) {
        	
            var ACCOUNT_SID = '8aaf070855b647ab0155b9f80994058a'
            var AUTH_TOKEN = 'aa8aa679414e49df8908ea5b3d043c24'
            var Rest_URL = 'https://app.cloopen.com:8883'
            var AppID = '8aaf070855b647ab0155b9f809f90590'
            // 1. 准备请求url
            /*
             1.使用MD5加密（账户Id + 账户授权令牌 + 时间戳）。其中账户Id和账户授权令牌根据url的验证级别对应主账户。
             时间戳是当前系统时间，格式"yyyyMMddHHmmss"。时间戳有效时间为24小时，如：20140416142030
             2.SigParameter参数需要大写，如不能写成sig=abcdefg而应该写成sig=ABCDEFG
             */
            var sigParameter = ''
            var time = moment().format('YYYYMMDDHHmmss')
            sigParameter = md5(ACCOUNT_SID+AUTH_TOKEN+time)
            var url = Rest_URL+'/2013-12-26/Accounts/'+ACCOUNT_SID +'/SMS/TemplateSMS?sig='+sigParameter
        
            // 2. 准备请求体
            var body = {
                to : phone,
                appId : AppID,
                templateId : '1',
                "datas":[code,"1"]
            }
            //body = JSON.stringify(body);
        
            // 3. 准备请求头
            /*
             1.使用Base64编码（账户Id + 冒号 + 时间戳）其中账户Id根据url的验证级别对应主账户
             2.冒号为英文冒号
             3.时间戳是当前系统时间，格式"yyyyMMddHHmmss"，需与SigParameter中时间戳相同。
             */
            var authorization = ACCOUNT_SID + ':' + time
            authorization = Base64.encode(authorization)
            var headers = {
                'Accept' :'application/json',
                'Content-Type' :'application/json;charset=utf-8',
                'Content-Length': JSON.stringify(body).length+'',
                'Authorization' : authorization
            }
        
            // 4. 发送请求, 并得到返回的结果, 调用callback
            request({
                method : 'POST',
                url : url,
                headers : headers,
                body : body,
                json : true
            }, function (error, response, body) {
                callback(body.statusCode==='000000')
            })
        }
        exports.sendCode = sendCode
        
        // 测试代码
        /*const code = randomCode(6)
        sendCode('13716962779', code, function (success) {
            console.log(success)
        })*/

## 3. 后台路由
    1). 定义发送验证码和登陆的路由: login/login_server.js
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
    2). 注册路由: routes/index.js
        var loginServer = require('../login/login_server')
        loginServer(router)
        
## 4. 编写登陆页面: public/login.html (也可以是前台界面)
    <div id="test">
      <h1>短信验证码和登陆测试</h1>
      <h3>说明: 请修改sms_util.js中ACCOUNT_SID, AUTH_TOKEN, AppID为你注册生成的数据</h3>
    
      手机号: <input type="text" v-model="phone"><br>
      验证码: <input type="text" v-model="code">
      <button @click="sendCode">发送验证码</button><br>
      <button @click="login">登陆</button>
    
      <hr>
      <p>登陆状态: {{status}}</p>
    </div>
    
    <script type="text/javascript" src="https://cdn.bootcss.com/vue/2.4.4/vue.js"></script>
    <script type="text/javascript" src="https://cdn.bootcss.com/axios/0.16.2/axios.js"></script>
    <script type="text/javascript">
      new Vue({
        el: '#test',
        data: {
          phone: '',
          code: '',
          status: '未登陆'
        },
        methods: {
          sendCode() {
            const url = `/sendcode?phone=${this.phone}`
            axios.get(url).then(response => {
              console.log('sendcode result ', response.data)
            })
          },
    
          login() {
            axios.post('/login', {phone: this.phone, code: this.code}).then(response => {
              console.log('login result ', response.data)
              const result = response.data
              if (result.code == 0) {
                const user = result.data
                this.status = `登陆成功: ${user.phone}`
              } else {
                this.status = `登陆失败, 请输入正确的手机号和验证码`
              }
            })
          }
        }
      })
    </script>
  
## 5. 运行测试
    npm start
    访问: http://localhost:3000/login.html
    输入一个测试号码, 点击输入验证码 --->手机会收到验证码
    输入验证码, 点击登陆 --->页面提示登陆成功
    如果再次输入或输入不正确 --->页面提示登陆失败 
![](https://i.imgur.com/4jC3vvC.png)


# [查看vue中如何mock实现](vue中mock处理.md)