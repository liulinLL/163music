{
  let view = {
    el: 'section.songs',

    template:` <li>
    <h3>{{song.name}}</h3>
    <p>
      <svg class="icon icon-sq">
        <use xlink:href="#icon-sq"></use>
      </svg>
      {{song.singer}}
    </p>
    <a class="playButton" href="./song.html?id={{song.id}}">
      <svg class="icon icon-play">
        <use xlink:href="#icon-play"></use>
      </svg>
    </a>
  </li> `,
    init(){
      this.$el=$(this.el)
    },
    render(data) {//渲染页面，获取model中数据，对页面进行渲染
      let {songs} = data
      songs.map((song) => {
        let $li = $(this.template
        .replace('{{song.name}}',song.name)
        .replace('{{song.singer}}',song.singer)
        .replace('{{song.id}}',song.id))
        this.$el.find('ol.list').append($li)
      })
    },
  }
  let model = {
    data:{
      songs:[]
    },
    find(){
     //查找数据库中歌曲返回歌曲信息，成功后调用then方法
        var query=new AV.Query('Song');
        return query.find().then((songs)=>{
           this.data.songs=songs.map((song)=>{
            return{id:song.id,...song.attributes}
           })//将数据库中歌曲的信息保存在最新歌曲的model中，用于下次渲染页面时使用
           return songs
        })
    }
  }
  let controller = {
    init(view,model){
      this.view=view
      this.view.init()
      this.model=model
      this.model.find().then(()=>{
        this.view.render(this.model.data)
        // console.log(this.model.data)
      })
    }
  }
  controller.init(view,model)
}