{
  let view = {
    el: '.page>main',
    init() {
      this.$el = $(this.el)
    },
    template: `
        <h1>新建歌曲</h1>
      <form class="form">

        <div class="row">
          <label>
            歌名
          </label>
            <input name="name" type="text" value="__name__">
         
        </div>
        <div class="row">
          <label>
            歌手
          </label>
            <input name="singer" type="text" value="__singer__">
          
        </div>
        <div class="row">
          <label>
            外链
          </label>
            <input  name="url" type="text" value="__url__">
          
        </div>
        <div class="row">
            <button type="submit">保存</button>
          </div>
      </form>
        `,
    render(data = {}) {
      let placeholders = ['name', 'url','singer']
      let html = this.template
      placeholders.map((string) => {
        {
          html = html.replace(`__${string}__`, data[string] || '')
        }
      })
      $(this.el).html(html)
    },
    reset(){
      this.render({})

    }
  }
  let model = {
    data: {
      name: '',
      singer: '',
      url: '',
      id: ''

    },
    create(data) {
      //将data数据存储到数据库
      // 声明 class
      var Song = AV.Object.extend('Song');
      // 构建对象
      var song= new Song();
      // 为属性赋值
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      // 将对象保存到云端
      return song.save().then((newSong)=>{
        // 成功保存之后，执行其他逻辑
        let {id,attributes}=newSong//得到数据库中的id ,name,url ,singer

        // 方案一
        // this.data={//将数据库中的id ,name,url ,singer,添加进data目的是为了让model拿到最新的数据
        //   id:id,
        //   name:attributes.name,
        //   singer:attributes.singer,
        //   url:attributes.url
        // }
        //方案二
        Object.assign(this.data,{
          id:id,
          name:attributes.name,
          singer:attributes.singer,
          url:attributes.url
        })
        // Object.assign(this.data,)
        // console.log(newSong);
      }, (error)=>{
        console.error(error)
      });




    },
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.init()
      this.view.render(this.model.data)
      this.bindEvents()

      window.eventHub.on('upload', (data) => {
        //订阅上传后upload消息，一旦upload，就调用render渲染到页面(提交表单中实现)
        this.view.render(data)
      })
    },
    bindEvents() {
      //获取新建表单中的name  singer   url，然后将数据传给model
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault()
        let needs = "name singer url".split(' ')
        let data = {}
        needs.map((string) => {
          data[string] = this.view.$el.find(`[name="${string}"]`).val()
        })

        // console.log(data)
        this.model.create(data)
        .then(()=>{
          // console.log(this.model.data)
          this.view.reset()

          let string=JSON.stringify(this.model.data)
          let object=JSON.parse(string)//深拷贝解决
          window.eventHub.emit('create',object)//传出的是值
        //  window.eventHub.emit('create',this.model.data)//传出的this.model.data是引用，地址
        })
      })
    }

  }
  controller.init(view, model)


}