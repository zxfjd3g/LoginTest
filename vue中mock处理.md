## 1. 成为容联平台的开发者
    不变
## 2. 请求容联发送验证码短信
    1). 下载依赖包
        不变
    2). 编写请求代码: login/sms_util.js
        不变
## 3. 模拟接口(后台路由)
    1). 定义发送验证码和登陆的路由: login/login_server.js
        不变
    2). 注册路由: build/dev-server.js
        // 得到路由器
        var router = express.Router()
        
        // 解析body(必须指定, 否则req.body为undefined)
        var bodyParser = require('body-parser'); // 需要下载此模块
        app.use(bodyParser.json());
        // 注册上用户登陆的路由
        const login_server = require('../login/login_server')
        login_server(router)
        
        // 启动路由器
        app.use('/api', router)

## 4. 在组件中实现短信验证码登陆
    <p>
      手机号: <input type="text" v-model="phone" placeholder="手机号">
      验证码: <input type="text" v-model="code" placeholder="验证码">
      <button @click="sendCode">发送验证码</button>
      <button @click="login">登陆</button>
    </p>
    
    data () {
      return {
        phone: '',
        code: ''
      }
    },
    methods: {
      sendCode() {
        axios.get('/api/sendcode?phone='+this.phone)
          .then(response => {
            console.log('sendCode', response.data)
          })
      },

      login () {
        axios.post('/api/login', {phone: this.phone, code: this.code})
          .then(response => {
            console.log('login', response.data)
            const result = response.data
            if (result.code == 0) {
              const user = result.data
              alert(`登陆成功: ${user.phone}`)
            } else {
              alert(`登陆失败, 请输入正确的手机号和验证码`)
            }
          })
      }
    },
        
## 5. 运行测试
    npm start
    输入一个测试号码, 点击输入验证码 --->手机会收到验证码
    输入验证码, 点击登陆 --->提示登陆成功
    如果再次输入或输入不正确 --->提示登陆失败  