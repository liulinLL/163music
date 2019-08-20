{
    let view = {
        el: '#songList-container',
        template: `
        <ul class="songList">
    </ul>
        `,
        render(data) {
            let $el=$(this.el)
            $el.html(this.template)//先放入ul
            let {songs}=data
            let liList=songs.map((song)=>{
                 return $('<li></li>').text(song.name).attr('data-song-id',song.id)//创建li标签，内容是传入data中的name
            })
            $el.find('ul').empty()//找到ul,清空ul
            liList.map((domLi)=>{//将创建的Li标签插入到ul中
                $el.find('ul').append(domLi)
            })
        },
        activeItem(li){
            let $li=$(li)
            $li.addClass('active')
            .siblings('.active').removeClass('active')

        }
        ,
        clearActive() {
            $(this.el).find('.active').removeClass('active')
        }
    }
    let model = {
        data: {
            songs: [
              
            ]
        },
        find(){//查找数据库中歌曲返回歌曲信息，成功后调用then方法
            var query=new AV.Query('Song');
            return query.find().then((songs)=>{
               this.data.songs=songs.map((song)=>{
                return{id:song.id,...song.attributes}

               })
               return songs
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEventHub()//eventHub事件
            this.getAllSongs()//获取所有歌曲显示到歌曲列表
            this.bindEvents()//点击歌曲列表事件
          
        },
        bindEvents(){
            $(this.view.el).on('click','li',(e)=>{
               this.view.activeItem(e.currentTarget)//实现点击某个歌曲，出现高亮
               let songId=e.currentTarget.getAttribute('data-song-id')//得到数据库中歌曲的id
               let data
               let songs=this.model.data.songs//得到model中的歌曲
               for(let i=0;i<songs.length;i++){//遍历songs，如果有歌曲和当前点击歌曲id一样，就将该歌曲的信息加入data中，用于之后的操作
                   if(songs[i].id===songId){
                       data=songs[i]
                       break
                   }
               }
               let object=JSON.parse(JSON.stringify(data))//深拷贝
               window.eventHub.emit('select',object)//
            })
           
            
        },
        bindEventHub(){
            window.eventHub.on('upload', () => {
                this.view.clearActive()

            })
            window.eventHub.on('create', (songData) => {
                this.model.data.songs.push(songData)
                this.view.render(this.model.data)

            })

            
            window.eventHub.on('new',()=>{
                this.view.clearActive()//订阅new，new发布时会触发clearActive,会清除li的active 高亮

            })

            window.eventHub.on('update',(song)=>{//收到数据库中最新更新的数据
                let songs=this.model.data.songs
                for(let i=0;i<songs.length;i++){//如果传过来跟新的id与model中id一样，就更新当前songs的所有数据
                    if(songs[i].id===song.id){
                        Object.assign(songs[i],song)
                           // songs[i]=song
                    }
                }
                this.view.render(this.model.data)//然后渲染到页面上
            })

        },
        getAllSongs(){
            return this.model.find().then(()=>{
                // 将find()返回的信息渲染到页面中
                    this.view.render(this.model.data)
                    // console.log(this.model.data)
            })

        }
    }
    controller.init(view, model)


}