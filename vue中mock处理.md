## 1. 请求容联发送验证码短信
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
      <button @click="sendCode">发送验证码</button>
      <input type="text" v-model="code">
      <button @click="login">登陆</button>
    </p>
    
    methods: {
      sendCode() {
        axios.get('/api/sendcode?phone=13716962779')
          .then(response => {
            console.log('sendCode', response.data)
          })
      },

      login () {
        axios.post('/api/login', {phone: '13716962779', code: this.code})
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
    }
        
        