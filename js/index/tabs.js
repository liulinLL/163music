{
  let view={
    el:"#tabs",
    init(){
      this.$el=$(this.el)
    }
  }
  let model={}
  let controller={
    init(view,model){
     
      this.view=view
      this.view.init()
      this.model=model
      this.bindEvents()
    },
    bindEvents(){
      this.view.$el.on('click','.tabs-nav>li',(e)=>{
        let $li=$(e.currentTarget)
        let tabName=$li.attr("data-tab-name")
        $li.addClass('active')//切换导航栏
        .siblings().removeClass('active')

        window.eventHub.emit('selectTab',tabName)//当用户，点击切换导航栏，时发布一个selectTab事件
      })
    }
  }
  controller.init(view,model)
}