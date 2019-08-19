/**
 * 地図の拡大縮小、ドラッグでの移動を制御する。
 */
class ScaleHandler {
    constructor (element) {
        this.area = element
        this.baseDistanse = 0 // Zoomの基準となる指の距離
        this.isMouseDown = false // マウスドラッグ中か判定するフラグ
        this.isZooming = false // ズームと移動を区別するためのフラグ
        this.startX = 0
        this.startY = 0
        this.dX = 0
        this.dY = 0
        this.ratio = 1
        this.UIs = [] // 地図の拡大縮小・移動に伴い、位置の再設定が必要となるUI部品を保持する

        //this.timeoutId = null

        this.initScale()

        window.addEventListener('mousedown', this.onMouseDown.bind(this), false)
        window.addEventListener('mouseup', this.onMouseUp.bind(this), false)
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false)

        window.addEventListener('touchstart', this.onTouchStart.bind(this), false)
        window.addEventListener('touchend', this.onTouchEnd.bind(this), false)
        window.addEventListener('touchmove', this.onTouchMove.bind(this), false)
        window.addEventListener('touchmove', this.zoom.bind(this), false)
    }

    addUI (UI) {
        this.UIs.push(UI)
    }

    popUI () {
        this.UIs.pop()
    }

    UIfadeOut () {
        this.UIs.forEach(UI => UI.fadeOut())
    }

    UIfadeIn () {
        this.UIs.forEach(UI => UI.fadeIn())
    }

    UIhide () {
        this.UIs.forEach(UI => UI.hide())
    }

    UIshow () {
        this.UIs.forEach(UI => UI.show())
    }

    onTouchStart (event) {
        event.preventDefault()
        const touches = event.changedTouches
        if (touches.length < 2) {
            this.startX = touches[0].pageX
            this.startY = touches[0].pageY

        } else {
            /* 指1と指2の距離を求める */
            let x1 = touches[0].pageX
            let y1 = touches[0].pageY
            let x2 = touches[1].pageX
            let y2 = touches[1].pageY
            this.baseDistanse = Math.hypot(x2 - x1, y2 - y1)/this.ratio
            this.isZooming = true
        }
        
    }

    onMouseDown (event) {
        event.preventDefault()
        this.isMouseDown = true
        this.startX = event.clientX
        this.startY = event.clientY
    }

    onTouchEnd (event) {
        this.baseDistanse = 0 // Zoom開始時の指の距離をリセット

        setTimeout(() => { 
            this.isZooming = false
            this.UIfadeIn()
         }, 100)
        
    }

    onMouseUp (event) {
        event.preventDefault()
        this.isMouseDown = false

        this.UIfadeIn()
    }

    onTouchMove (event) {
        event.preventDefault()

        this.UIfadeOut()
        
        const touches = event.changedTouches

        if (touches.length > 1 || this.isZooming) {
            return
        }

        const speed = 0.7

        let dx = (touches[0].pageX - this.startX)
        let dy = (touches[0].pageY - this.startY)
        this.dX += dx * speed
        this.dY += dy * speed

        this.scroll()

        this.startX = touches[0].pageX
        this.startY = touches[0].pageY
    }

    onMouseMove (event) {
        event.preventDefault()
        if (!this.isMouseDown) {
            return
        }
        this.UIfadeOut()

        const speed = 0.3

        let dx = (event.clientX - this.startX)
        let dy = (event.clientY - this.startY)
        this.dX += dx * speed
        this.dY += dy * speed

        this.scroll()
    }

    initScale () {
        const innerWidth = window.innerWidth
        const innerHieght = window.innerHeight
        this.ratio = Math.max(innerWidth/(1000 + 50), innerHieght/(777 + 50))
        this.dX = 0
        this.dY = 0
        this.update()
        console.log(`拡大率: ${this.ratio}`)
    }

    scroll () {
        const maxX = Math.max((this.area.clientWidth * this.ratio - window.innerWidth)/2, 30)
        const minX = - maxX
        const maxY = Math.max((this.area.clientHeight * this.ratio - window.innerHeight)/2, 30)
        const minY = - maxY
        
        if (this.dX < minX) {this.dX = minX}
        if (this.dX > maxX) {this.dX = maxX}
        if (this.dY < minY) {this.dY = minY}
        if (this.dY > maxY) {this.dY = maxY}

        this.update()
    }

    update() {
        this.area.style.transform= `scale(${this.ratio}) translate(${this.dX}px, ${this.dY}px)`
    }

    zoom (event) {
        event.preventDefault()
        const touches = event.changedTouches

        if (touches.length < 2) {
            return
        }

        this.isZooming = true

        /* 指1と指2の距離を求める */
        let x1 = touches[0].pageX
        let y1 = touches[0].pageY
        let x2 = touches[1].pageX
        let y2 = touches[1].pageY
        let distance = Math.hypot(x2 - x1, y2 - y1)/this.ratio

        if (this.baseDistanse > 0) {
            let scale = this.ratio * distance / this.baseDistanse 

            if (scale < 0.9) {scale = 0.9}
            if (scale > 3) {scale = 3}

            this.ratio = scale
            this.update()

        } else {
            this.baseDistanse = distance
        }
    }
}

/**
 * 地図の拡大縮小、位置の移動に伴い、UI部品の大きさや位置を調整する。
 */
class UIpositioning {
    constructor (element, x, y) {
        this.element = element
        this.x = x // left or right
        this.y = y // top or bottom

        this.xOffset = 20
        this.yOffset = 20

        this.fadeOut()
        this.fadeIn()
    }

    fadeOut () {
        this.element.classList.remove('fade-in')
        this.element.classList.add('fade-out')
        this.resize()
        this.reposition()
    }

    fadeIn () {
        setTimeout(() => {
            this.resize()
            this.reposition()
            this.element.classList.remove('fade-out')
            this.element.classList.add('fade-in')
        }, 300)
    }

    resize () {
        const ratio = document.body.clientWidth / window.innerWidth // iOSでの拡大率

        this.element.style.fontSize = `${2.5/ratio}vh`

    }

    reposition () {
        if (this.x === 'left') {
            let offsetX = Math.max(window.pageXOffset, 0) + this.xOffset
            this.element.style.left = `${offsetX}px`

        } else if (this.x === 'right') {
            let offsetX = Math.abs(window.innerWidth - document.body.clientWidth) - Math.max(window.pageXOffset, 0) + this.xOffset
            this.element.style.right = `${offsetX}px`

        } else {
            console.log(`キーワードが想定外：${this.x}`)
        }

        if (this.y === 'top') {
            let offsetY = Math.max(window.pageYOffset, 0) + this.yOffset
            this.element.style.top = `${offsetY}px`

        } else if (this.y === 'bottom') {
            let offsetY = Math.abs(window.innerHeight - document.body.clientHeight) - Math.max(window.pageYOffset, 0) + this.yOffset
            this.element.style.bottom = `${offsetY}px`

        } else {
            console.log(`キーワードが想定外：${this.y}`)
        }
    }

    hide () {
        this.element.classList.add('hidden')
    }

    show () {
        this.element.classList.remove('hidden')
    }
}