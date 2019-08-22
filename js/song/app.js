
{
  let view = {
    el: '#app',
    init(){
      this.$el=$(this.el)
    },
    render(data){
      let{song,status}=data
      //中间播放界面
      //  $('div.pageOne').append(`<style>.pageOne::before{
      //   background-image:url(${song.cover})
      //  }</style>`)
      $("div#pageOne").css('background-image',`url(${song.cover})`)

    //    $("div#pageOne").css({

    //   "filter": "blur(5px)",
    //   "background-size": "cover",
     

    // })
    // $(this.el).css({
    //   "z-index":"5"

    // })
        
      //   "z-index":"-1"
      //   });
      // $('#pageOne').css({
      //   'background-image':'url(${song.cover})'
        
      //   // 'z-index':'1'






      // })


      $(this.el).find('img.cover').attr('src',song.cover)
      if($(this.el).find('audio').attr('src')!==song.url)
      {
        let audio=$(this.el).find('audio').attr('src',song.url).get(0)
        audio.onended=()=>{
          window.eventHub.emit('songEnd')
        }
        audio.ontimeupdate=()=>{
         // window.eventHub.emit('songTimeChange',audio.currentTime)
         this.showLyric(audio.currentTime)
        }
      }

      if(status==='playing'){
        $(this.el).find('.disc-container').addClass('playing')
      }
      else{
        $(this.el).find('.disc-container').removeClass('playing')
      }

      //歌词界面
      this.$el.find('.song-description>h1').text(song.name)
      //加载歌词歌词滚动
      let {lyrics}=song
     
      lyrics.split('\n').map((string)=>{
        let p= document.createElement('p')//用于去掉时间轴
        let regex = /\[([\d:.]+)\](.+)/
        let matches=string.match(regex)//返回的是一个数组match，数组0保存的是时间戳+内容  2是内容 1是时间戳
        // console.log(matches)
        if(matches){
          p.textContent=matches[2]
          let time=matches[1]
          let parts=time.split(':')
          let minutes=parts[0]
          let seconds=parts[1]
          let newTime=parseFloat(minutes,10)*60+parseFloat(seconds,10)
          p.setAttribute('data-time',newTime)
        }
        else{
          p.textContent=string
        }
        this.$el.find('.lyric>.lines').append(p)

      })
    //  console.log(array)
  
    },
    showLyric(time){
      // let allP=this.$el.find('.lyric>.lines>p')
      // let p
      // for(let i=0;i<allP.length;i++){
      //   if(i===allP.length-1){
      //     p=allP[i]
      //     break

      //   }else{
      //     let currentTime=allP.eq(i).attr('data-time')
      //   let nextTime=allP.eq(i+1).attr('data-time')
      //   if(currentTime<=time&&time<nextTime){
      //     p=allP[i]
      //     break
      //   }
      //   }
  
      // }
      // let pHeight = p.getBoundingClientRect().top
      // let linesHeight = this.$el.find('.lyric>.lines')[0].getBoundingClientRect().top
      // let height = pHeight - linesHeight
      // this.$el.find('.lyric>.lines').css({
      //   transform: `translateY(${- (height - 25)}px)`
      // })
      // $(p).addClass('active').siblings('.active').removeClass('active')
      let allP = this.$el.find('.lyric>.lines>p')
      let p 
      for(let i =0;i<allP.length;i++){
        if(i===allP.length-1){
          p = allP[i]
          break
        }else{
          let currentTime = allP.eq(i).attr('data-time')
          let nextTime = allP.eq(i+1).attr('data-time')
          if(currentTime <= time && time < nextTime){
            p = allP[i]
            break
          }
        }
      }
      // console.log(p)
      let pHeight = p.getBoundingClientRect().top
      let linesHeight = this.$el.find('.lyric>.lines')[0].getBoundingClientRect().top
      // console.log(pHeight)
      console.log('------------------------------------------------')
      console.log(linesHeight)
      // console.log(this.$el.find('.lyric')[0].getBoundingClientRect().top)
      
      let height = pHeight - linesHeight
     
      this.$el.find('.lyric>.lines').css({
        transform: `translateY(${- (height- 25)}px)`
      })
      $(p).addClass('active').siblings('.active').removeClass('active')


    },
    play(){
      
      $(this.el).find('audio')[0].play()
    },pause(){
      $(this.el).find('audio')[0].pause()
    }
  }
  let model = {
    data:{
      song:
      {
        id:'',
        name:'',
        singer:'',
        url:'',
        lyrics:''
      },
      status:'paused'
     
    },
    
    get(id){
      var query = new AV.Query('Song');
      return query.get(id).then((song)=>{
        Object.assign(this.data.song,{ id:song.id,...song.attributes})
        // return{ id:song.id,...song.attributes}
        return song
      })

    }
  }
  let controller = {
    init(view,model){
      this.view=view
      this.view.init()
      this.model=model
      let id =this.getSongId()
     
      this.model.get(id).then(()=>{
        // console.log(this.model.data.song.lyrics)
      this.view.render(this.model.data)
     
      })
      this.bindEvents()
     
    },
    bindEvents(){
      $(this.view.el).on('click','.icon-play',()=>{
        this.model.data.status='playing'
        this.view.render(this.model.data)
        this.view.play()
      })
      $(this.view.el).on('click','.icon-pause',()=>{
        this.model.data.status='paused'
        this.view.render(this.model.data)
        this.view.pause()
      })
     window.eventHub.on('songEnd',()=>{
       this.model.data.status='paused'
       this.view.render(this.model.data)
     })

    
    },
    getSongId() {
      let search = window.location.search//获取查询参数
      if (search.indexOf('?') === 0) {
        search = search.substring(1)//将查询参数的？，得到一个字符串
      }
      let array = search.split('&').filter((v => v))//将search字符串变为数组，然后过滤空字符串
      let id = ''
      for (let i = 0; i < array.length; i++) {
        let kv = array[i].split('=')
        let key = kv[0]
        let value = kv[1]
        if (key === 'id') {
          id = value
          break
        }
      }
      return id

    }
  }
  controller.init(view,model)
}












