{
  let view = {
    el: '.page>main',
    init() {
      this.$el = $(this.el)
    },
    template: `
    <div class="lyrics">
    <div>
      歌词
    </div>
      <textarea name="lyrics">__lyrics__</textarea>
  </div>
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
          <label>
            封面
          </label>
            <input  name="cover" type="text" value="__cover__">
        </div>
        <div class="row">
            <button type="submit">保存</button>
          </div>
      </form>
    
        `,
    render(data = {}) {
      let placeholders = ['name', 'url','singer','id','cover','lyrics']
      let html = this.template
      placeholders.map((string) => {
        {
          html = html.replace(`__${string}__`, data[string] || '')
        }
      })
      $(this.el).html(html)
      if(data.id){//切换提交表单标题
        console.log(data.id)//当data中id存在时是编辑歌曲
        $(this.el).prepend('<h1>编辑歌曲</h1>')
      }
      else{
        $(this.el).prepend('<h1>新建歌曲</h1>')
      }


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
      id: '',
      cover:'',
      lyrics:''

    },
    update(data){//更新数据库中的数据
      var song = AV.Object.createWithoutData('Song', this.data.id);
      song.set('name',data.name);
      song.set('singer',data.singer);
      song.set('url',data.url);
      song.set('cover',data.cover);
      song.set('lyrics',data.lyrics);
      
      return song.save().then((response)=>{
          Object.assign(this.data,data)
          return response//返回最新的值
      })
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
      song.set('cover',data.cover);
      song.set('lyrics',data.lyrics);
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
          url:attributes.url,
          cover:attributes.cover,
          lyrics:attributes.lyrics

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
      window.eventHub.on('select', (data) => {//订阅select,如果发生了，就将传过来的data渲染到提交表单
        this.model.data=data
        this.view.render(this.model.data)
      })
      window.eventHub.on('new',(data)=>{
        //订阅new，new发布时会清空歌曲提交表单
        if(this.model.data.id){//如果是在其他情况点击会清空
          this.model.data={
            name:'',url:'',id:'',singer:''
          }
        }
        else{//如果是在上传成功后还未保存的时候，这个时候点击清空不会清除
          Object.assign(this.model.data,data)
        }
        this.view.render(this.model.data)
      })

    
    },
    save(){
      let needs = "name singer url cover lyrics".split(' ')
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

    },
    update(){
      let needs = "name singer url cover lyrics".split(' ')
      let data = {}
      needs.map((string) => {
        data[string] = this.view.$el.find(`[name="${string}"]`).val()
      })
      this.model.update(data)
      .then(()=>{
        alert('更新数据成功')
        //更新后发布update事件，订阅此事件的会收到提交列表中最新的model中的data
        window.eventHub.emit('update',JSON.parse(JSON.stringify(this.model.data)))
      })
      

    },
    bindEvents() {
      //获取新建表单中的name  singer   url，然后将数据传给model
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault()
        if(this.model.data.id){//如果是在其他情况点击会清空
           this.update()
          //console.log(1)
        }
        else{
          //console.log(222)
           this.save()
        } 
      })
    }

  }
  controller.init(view, model)


}