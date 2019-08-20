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
            this.bindEventHub()
            this.getAllSongs()
            this.bindEvents()
          
        },
        bindEvents(){
            $(this.view.el).on('click','li',(e)=>{
               this.view.activeItem(e.currentTarget)
               let songId=e.currentTarget.getAttribute('data-song-id')
               window.eventHub.emit('select',{id:songId})
             
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