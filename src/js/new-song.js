{
    let view={
        el:'.newSong',
        template:`
        新建歌曲
        `,
        render(data) {
            $(this.el).html(this.template)
        }
    }
    let model={
        data:{
            name: '',
            singer: '',
            url: '',
            id: ''
        }     
    }
    let controller={
        init(view,model){
            this.view=view
            this.model=model
            this.view.render(this.model.data)
            this.active()
            window.eventHub.on('upload',(data)=>{
                console.log('new song得到了data')
                console.log(data)
                this.model.data=data
                $(this.view.el).addClass('active')
            })
          
            window.eventHub.on('select',(data)=>{
                this.deActive()
            })
            $(this.view.el).on('click',this.active.bind(this))//监听click事件，如果调用active高亮
        },
        active(){
            let data=JSON.parse(JSON.stringify(this.model.data))//深拷贝
            $(this.view.el).addClass('active')
            window.eventHub.emit('new',data)//active被调用就发部一个new事件，列表和歌单都会订阅此new事件
        },
        deActive(){
            $(this.view.el).removeClass('active')
        }
    }
    controller.init(view,model)

   
}