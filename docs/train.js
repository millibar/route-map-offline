/**
 * 電車の運行表を与えると、現在時刻と運行表の時刻をもとに、電車の座標を計算する。
 */
class Train {
    constructor (route, rosen) {
        this.x = 0
        this.y = 0
        this.angle = 0
        this.route = route //　この電車が順次停車する駅の配列 [{time: 'hh:mm', sta: Station}, ]
        this.position = 0 // routeのインデックス
        this.reqId = null
        this.ul = document.getElementById('routemap')
        this.li = null
        this.rosen = rosen

    }

    start () {
        // 地図上に電車を追加する
        this.li = document.createElement('li')
        this.li.classList.add('train', 'hidden', this.rosen)
        this.ul.appendChild(this.li)
        this.reqId = window.requestAnimationFrame(this.update.bind(this))
        this.li.addEventListener('click', this.showRoute.bind(this), false)
    }

    pause () {
        window.cancelAnimationFrame(this.reqId)
    }

    showRoute () {
        closeTimeTable ()

        const dl = createTimeTable (this.route)
        const nav = document.getElementById('timetable')
        nav.appendChild(dl)
        this.li.classList.add('active')

        const UItimetable = new UIpositioning (nav, 'right', 'bottom')
        
        while (handler.UIs.length > 2) {
            handler.popUI()
        }
        handler.addUI(UItimetable)
    }

    // フレームの更新ごとに呼び出され、現在時刻とルート情報をもとに
    // 自身の位置（x, y, angle, position）を更新する。終点に来たらループを抜ける。
    update () {
        if (this.position + 1 >= this.route.length) {
            console.log('終点')
            this.remove()
            return
        }

        let t = toSecFromNow()

        let prev = this.route[this.position]
        let prevSta = prev.sta
        let prevTime_s = toSecFromTimeStr(prev.time)

        if (t < prevTime_s) {
            
            console.log('発車前')
            let sleepTime_s = prevTime_s - t
            
            window.cancelAnimationFrame(this.reqId)

            if (sleepTime_s < 300) {
                setTimeout(this.update.bind(this), sleepTime_s * 1000)

            } else {
                this.remove()
            }
            
            return
        }

        const waitTime_s = 30
                
        let next = this.route[this.position + 1]
        let nextSta = next.sta
        let nextTime_s = toSecFromTimeStr(next.time)

        let dX = nextSta.getX() - prevSta.getX()
        let dY = nextSta.getY() - prevSta.getY()
        let dT = nextTime_s - waitTime_s - prevTime_s
        let Vx = dX/dT
        let Vy = dY/dT

        this.angle = getRotateAngle(dX, dY)

        if (prevTime_s <= t && t <= nextTime_s - waitTime_s) {
            let elapsed_s = t - prevTime_s
            this.x = prevSta.getX() + Math.round(Vx * elapsed_s)
            this.y = prevSta.getY() + Math.round(Vy * elapsed_s)
            this.li.classList.remove('wait')
            this.go()

        } else if (nextTime_s - waitTime_s < t && t < nextTime_s) {
            this.x = nextSta.getX()
            this.y = nextSta.getY()
            this.li.classList.add('wait')
            this.go()

        } else if (nextTime_s <= t) {
            this.position += 1
        }

        this.reqId = window.requestAnimationFrame(this.update.bind(this))
    }

    // 地図上での電車の位置を更新する
    go () {
        this.li.style.left = `${this.x}px`
        this.li.style.top = `${this.y}px`
        this.li.style.transform = `rotate(${this.angle}deg) translate(-12px, -12px)`
        this.li.classList.remove('hidden')
    }

    // 電車を削除する
    remove () {
        this.ul.removeChild(this.li)
        window.cancelAnimationFrame(this.reqId)
    }
}



// ここからメインの処理
setDayToRadioBtn()

const routemap = document.getElementById('routemap')
const handler = new ScaleHandler (routemap)

const daySwitch = document.getElementById('day')
const reloadBtn = document.getElementById('reload')

const UIdaySwitch = new UIpositioning (daySwitch, 'left', 'top')
const UIreloadBtn = new UIpositioning (reloadBtn, 'right', 'top')

handler.addUI(UIdaySwitch)
handler.addUI(UIreloadBtn)

daySwitch.addEventListener('click', () => {
    daySwitch.style.opacity = 1;
    setTimeout(function (){
        daySwitch.style.opacity = 0.7;
    }, 2000)
}, false)

reloadBtn.addEventListener('click', () => {
    reloadBtn.style.opacity = 1;
    setTimeout(function (){
        reloadBtn.style.opacity = 0.7;
    }, 2000)
}, false)




const 運行表_東山線_金_昇 = makeTrainTimeTable (transpose(東山線_金_昇), 東山線) // transpose()はもとの配列を壊すので注意！
const 運行表_東山線_平_昇 = makeTrainTimeTable (transpose(東山線_平_昇), 東山線)
const 運行表_東山線_休_昇 = makeTrainTimeTable (transpose(東山線_休_昇), 東山線)
const 運行表_東山線_金_降 = makeTrainTimeTable (transpose(東山線_金_降), 東山線.reverse())
const 運行表_東山線_平_降 = makeTrainTimeTable (transpose(東山線_平_降), 東山線) // リバースされている
const 運行表_東山線_休_降 = makeTrainTimeTable (transpose(東山線_休_降), 東山線) // リバースされている

const 運行表_桜通線_平_昇 = makeTrainTimeTable (transpose(桜通線_平_昇), 桜通線)
const 運行表_桜通線_休_昇 = makeTrainTimeTable (transpose(桜通線_休_昇), 桜通線)
const 運行表_桜通線_平_降 = makeTrainTimeTable (transpose(桜通線_平_降), 桜通線.reverse())
const 運行表_桜通線_休_降 = makeTrainTimeTable (transpose(桜通線_休_降), 桜通線) // リバースされている

const 運行表_名城線_平_左 = makeTrainTimeTable (transpose(名城線_平_左), 名城線_左)
const 運行表_名城線_休_左 = makeTrainTimeTable (transpose(名城線_休_左), 名城線_左)
const 運行表_名城線_平_右 = makeTrainTimeTable (transpose(名城線_平_右), 名城線_右)
const 運行表_名城線_休_右 = makeTrainTimeTable (transpose(名城線_休_右), 名城線_右)

const 運行表_名港線_平_昇 = makeTrainTimeTable (transpose(名港線_平_昇), 名港線_昇)
const 運行表_名港線_休_昇 = makeTrainTimeTable (transpose(名港線_休_昇), 名港線_昇)
const 運行表_名港線_平_降 = makeTrainTimeTable (transpose(名港線_平_降), 名港線.reverse())
const 運行表_名港線_休_降 = makeTrainTimeTable (transpose(名港線_休_降), 名港線) // リバースされている

const 運行表_鶴舞線_平_昇 = makeTrainTimeTable (transpose(鶴舞線_平_昇), 鶴舞線)
const 運行表_鶴舞線_休_昇 = makeTrainTimeTable (transpose(鶴舞線_休_昇), 鶴舞線)
const 運行表_鶴舞線_平_降 = makeTrainTimeTable (transpose(鶴舞線_平_降), 鶴舞線.reverse())
const 運行表_鶴舞線_休_降 = makeTrainTimeTable (transpose(鶴舞線_休_降), 鶴舞線) // リバースされている

const 運行表_上飯田線_平_昇 = makeTrainTimeTable (transpose(上飯田線_平_昇), 上飯田線)
const 運行表_上飯田線_休_昇 = makeTrainTimeTable (transpose(上飯田線_休_昇), 上飯田線)
const 運行表_上飯田線_平_降 = makeTrainTimeTable (transpose(上飯田線_平_降), 上飯田線.reverse())
const 運行表_上飯田線_休_降 = makeTrainTimeTable (transpose(上飯田線_休_降), 上飯田線) // リバースされている



const trains_東山線_金_昇 = createTrains(運行表_東山線_金_昇, '東山線')
const trains_東山線_金_降 = createTrains(運行表_東山線_金_降, '東山線')
const trains_東山線_平_昇 = createTrains(運行表_東山線_平_昇, '東山線')
const trains_東山線_平_降 = createTrains(運行表_東山線_平_降, '東山線')
const trains_東山線_休_昇 = createTrains(運行表_東山線_休_昇, '東山線')
const trains_東山線_休_降 = createTrains(運行表_東山線_休_降, '東山線')

const trains_桜通線_平_昇 = createTrains(運行表_桜通線_平_昇, '桜通線')
const trains_桜通線_平_降 = createTrains(運行表_桜通線_平_降, '桜通線')
const trains_桜通線_休_昇 = createTrains(運行表_桜通線_休_昇, '桜通線')
const trains_桜通線_休_降 = createTrains(運行表_桜通線_休_降, '桜通線')

const trains_名城線_平_左 = createTrains(運行表_名城線_平_左, '名城線')
const trains_名城線_平_右 = createTrains(運行表_名城線_平_右, '名城線')
const trains_名城線_休_左 = createTrains(運行表_名城線_休_左, '名城線')
const trains_名城線_休_右 = createTrains(運行表_名城線_休_右, '名城線')

const trains_名港線_平_昇 = createTrains(運行表_名港線_平_昇, '名港線')
const trains_名港線_平_降 = createTrains(運行表_名港線_平_降, '名港線')
const trains_名港線_休_昇 = createTrains(運行表_名港線_休_昇, '名港線')
const trains_名港線_休_降 = createTrains(運行表_名港線_休_降, '名港線')

const trains_鶴舞線_平_昇 = createTrains(運行表_鶴舞線_平_昇, '鶴舞線')
const trains_鶴舞線_平_降 = createTrains(運行表_鶴舞線_平_降, '鶴舞線')
const trains_鶴舞線_休_昇 = createTrains(運行表_鶴舞線_休_昇, '鶴舞線')
const trains_鶴舞線_休_降 = createTrains(運行表_鶴舞線_休_降, '鶴舞線')

const trains_上飯田線_平_昇 = createTrains(運行表_上飯田線_平_昇, '上飯田線')
const trains_上飯田線_平_降 = createTrains(運行表_上飯田線_平_降, '上飯田線')
const trains_上飯田線_休_昇 = createTrains(運行表_上飯田線_休_昇, '上飯田線')
const trains_上飯田線_休_降 = createTrains(運行表_上飯田線_休_降, '上飯田線')


const trains_平日 = [
    trains_桜通線_平_昇,
    trains_桜通線_平_降,
    trains_名城線_平_左,
    trains_名城線_平_右,
    trains_名港線_平_昇,
    trains_名港線_平_降,
    trains_鶴舞線_平_昇,
    trains_鶴舞線_平_降,
    trains_上飯田線_平_昇,
    trains_上飯田線_平_降
]

const trains_東山線_平日 = [
    trains_東山線_平_昇,
    trains_東山線_平_降
]

const trains_東山線_金曜 = [
    trains_東山線_金_昇,
    trains_東山線_金_降
]

const trains_休日 = [
    trains_東山線_休_昇,
    trains_東山線_休_降,
    trains_桜通線_休_昇,
    trains_桜通線_休_降,
    trains_名城線_休_左,
    trains_名城線_休_右,
    trains_名港線_休_昇,
    trains_名港線_休_降,
    trains_鶴舞線_休_昇,
    trains_鶴舞線_休_降,
    trains_上飯田線_休_昇,
    trains_上飯田線_休_降
]

const trains_all = [].concat(trains_平日).concat(trains_東山線_平日).concat(trains_東山線_金曜).concat(trains_休日)

const start = () => {
    const day = getVirtualDay ()

    switch (day) {
        case '平':
                for (let i = 0, len = trains_平日.length; i < len; i++) {
                    startTrains(trains_平日[i])
                }
                startTrains(trains_東山線_平_昇)
                startTrains(trains_東山線_平_降)
            break
        case '金':
                for (let i = 0, len = trains_平日.length; i < len; i++) {
                    startTrains(trains_平日[i])
                }
                startTrains(trains_東山線_金_昇)
                startTrains(trains_東山線_金_降)
            break
        case '休':
                for (let i = 0, len = trains_休日.length; i < len; i++) {
                    startTrains(trains_休日[i])
                }
            break
    }
}

const restart = () => {

    closeTimeTable ()
    removeElements (routemap, 'train')

    for (let i = 0, len = trains_all.length; i < len; i++) {
        pauseTrains(trains_all[i])
    }

    start ()
}

start()

const radios = document.querySelectorAll('#day input')

for (let i = 0, len = radios.length; i < len; i++) {
    radios[i].addEventListener('change', restart, false)
}


reloadBtn.addEventListener('click', () => {
    setDayToRadioBtn()
    handler.initScale()
    restart()

}, false)


/*

let testCases = {
    '東山線_金_昇':東山線_金_昇,
    '東山線_平_昇':東山線_平_昇,
    '東山線_休_昇':東山線_休_昇,
    '東山線_金_降':東山線_金_降,
    '東山線_平_降':東山線_平_降,
    '東山線_休_降':東山線_休_降,

    '桜通線_平_昇':桜通線_平_昇,
    '桜通線_休_昇':桜通線_休_昇,
    '桜通線_平_降':桜通線_平_降,
    '桜通線_休_降':桜通線_休_降,

    '名城線_平_左':名城線_平_左,
    '名城線_休_左':名城線_休_左,
    '名城線_平_右':名城線_平_右,
    '名城線_休_右':名城線_休_右,

    '名港線_平_昇':名港線_平_昇,
    '名港線_休_昇':名港線_休_昇,
    '名港線_平_降':名港線_平_降,
    '名港線_休_降':名港線_休_降,

    '鶴舞線_平_昇':鶴舞線_平_昇,
    '鶴舞線_休_昇':鶴舞線_休_昇,
    '鶴舞線_平_降':鶴舞線_平_降,
    '鶴舞線_休_降':鶴舞線_休_降,

    '上飯田線_平_昇':上飯田線_平_昇,
    '上飯田線_休_昇':上飯田線_休_昇,
    '上飯田線_平_降':上飯田線_平_降,
    '上飯田線_休_降':上飯田線_休_降
}

for (let key in testCases) {
    console.assert(isAscending(testCases[key]), `行：${key}`)
    console.assert(isAscending(transpose(testCases[key])), `列：${key}`)
}
*/