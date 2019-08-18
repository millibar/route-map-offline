/**
 * 文字列で与えられた時刻を0:00からの経過時間（秒）として整数値で返す。
 * @param {string} str '10:35'のような時刻を表す文字列
 * @return {number} 38100のような整数
 */
const toSecFromTimeStr = (str) => {
    let min, sec
    [min, sec] = str.split(':')
    return Number(min) * 3600 + Number(sec) * 60
}

const test_toSecFromTimeStr = () => {
    let inputs = ['0:00', '00:00', '5:32', '05:32', '24:05']
    let expecteds = [0, 0, 19920, 19920, 86700]
    for (let i = 0, len = inputs.length; i < len; i++) {
        let input = inputs[i]
        let expected = expecteds[i]
        let actual = toSecFromTimeStr(input)
        console.assert(actual === expected,
         `toSecFromTimeStr(${input}) => ${actual}, expected: ${expected}`)
    }
}
test_toSecFromTimeStr()

/**
 * 現在時刻を当日0:00からの経過時間（秒）として整数値で返す。
 * 0:00～4:00までは24時～28時とみなす
 * たとえば、5:32 => 19920, 0:05 => 86405
 */
const toSecFromNow = () => {
    const now = new Date()
    let hour, min, sec
    [hour, min, sec] = [now.getHours(), now.getMinutes(), now.getSeconds()]
    if (hour < 5) {
        hour += 24
    }
    return hour * 3600 + min * 60 + sec
}

/**
 * 2次元配列の行と列を入れ替えた2次元配列を返す
 * [[1, 2, 3],
 *  [4, 5, 6]] => 
 * [[1, 4], 
 *  [2, 5],
 *  [3, 6]]
 * @param {Array.<Array>} array 二次元配列
 * @return {Array.<Array>} 二次元配列
 */
const transpose = (array) => {
    let outers = []

    for (let i = 0, len = array[0].length; i < len; i++) {
        let inners = []
        for (let j = 0, len = array.length; j < len; j++) {
            let e = array[j].shift()
            inners.push(e)
        }
        outers.push(inners)
    }
    
    return outers
}

const test_transpose = () => {
    let input1 = [[1,2,3], [4,5,6]]
    let input2 = [[1,2], [3,4], [5,6]]
    let expected1 = [[1,4], [2,5], [3,6]]
    let expected2 = [[1,3,5], [2,4,6]]

    let actual1 = transpose(input1)
    let actual2 = transpose(input2)

    let actuals = [actual1, actual2]
    let expecteds = [expected1, expected2]
    
    /**
     * 2次元配列array1とarray2の各要素がすべて同じならtrue, そうでないならfalseを返す
     * @param {Array} array1 
     * @param {Array} array2 
     */
    const isEqual2DArray = (array1, array2) => {
        for (let i = 0, len = array1.length; i < len; i++) {
            for (let j = 0, len = array1[i].length; j < len; j++) {
                if (array1[i][j] === array2[i][j]) {
                    continue
                } else {
                    return false
                }
            }
        }
        return true
    }

    for (let i = 0, len = actuals.length; i < len; i++) {
        let actual = actuals[i]
        let expected = expecteds[i]
        console.assert(isEqual2DArray(actual, expected),
        `transpose() => ${actual}, expected: ${expected}`)
    }
}
test_transpose()

/**
 * 駅Aから駅Bに向かうとき、線分ABと垂直線のなす角度を求める。
 * CSSのtransform: rotate()の回転角に使う想定。
 * @param {numbar} dX 右側を正とする水平方向の変位
 * @param {number} dY 下側を正とする垂直方向の変位
 * @return {number} deg
 */
const getRotateAngle = (dX, dY) => {
    if (dX === 0 && dY >= 0) {
        return 0
    }

    if (dX === 0 && dY < 0) {
        return 180
    }


    let rad = Math.atan(Math.abs(dY/dX))
    let deg = rad * 180/Math.PI

    let angle
    if (dX > 0 && dY < 0) {
        angle = -(90 + deg)
    } else if (dX > 0 && dY > 0) {
        angle = -(90 - deg)
    } else if (dX < 0 && dY < 0) {
        angle = 90 + deg
    } else if (dX < 0 && dY > 0) {
        angle = 90 - deg
    }
    return angle
} 

/**
 * 駅のリストを与えると、駅間をつなぐ線を生成する。
 * @param {Array.<Station>} stations 駅のリスト
 * @param {string} name 線の名前（例）名城線
 */
const createLine = (stations, name) => {
    for (let i = 0, len = stations.length; i < len - 1; i++) {
        let A = stations[i]
        let B = stations[i + 1]
        let dX = B.getX() - A.getX()
        let dY = B.getY() - A.getY()
        let r = Math.hypot(dX, dY)
        let angle = getRotateAngle(dX, dY)

        const ul = document.getElementById('routemap')
        const li = document.createElement('li')
        
        li.style.left = `${A.getX()}px`
        li.style.top = `${A.getY()}px`
        li.style.height = `${r}px`
        li.style.transform = `rotate(${angle}deg) translate(-3px, 0px)` // widthの半分
        li.classList.add('line', name)
        ul.appendChild(li)
    }
}

/**
 * 各電車の出発時刻の配列と駅順の配列を与えると、各列車の運行表を返す
 * @param {Array.<Array>} trains 
 * @param {Array.<Station>} stations
 * @return {Array.<Object>} 電車の運行表 [{time: 'hh:mm', sta: Station}, ]
 */
const makeTrainTimeTable = (trains, stations) => {
    let trainTimeTable = []
    
    for (let i = 0, len = trains.length; i < len; i++) {

        let route = []
        for (let j = 0, len = stations.length; j < len; j++) {
            let timeStr = trains[i][j]
            let station = stations[j]
            if (timeStr === "") {
                continue
            } else {
                route.push({time: timeStr, sta: station})
            }
        }
        trainTimeTable.push(route)
    }
    return trainTimeTable
}

/**
 * 電車の運行表を与えると、運行表に基づくTrainインスタンスを生成する。
 * Trainインスタンスの配列を返す
 * @param {Array.<Object>} trainTimeTable
 * @param {string} rosen 路線名
 * @return {Array.<Train>} 
 */
const createTrains = (trainTimeTable, rosen) => {
    let trains = []
    for (let i = 0, len = trainTimeTable.length; i < len; i++) {
        let train = new Train (trainTimeTable[i], rosen)
        trains.push(train)
    }
    return trains
}

/**
 * 電車のリストを与えると、それぞれの電車をstartさせる。
 * @param {Array.<Train>} trains Trainインスタンスの配列
 */
const startTrains = (trains) => {
    for (let i = 0, len = trains.length; i < len; i++) {
        trains[i].start()
    }
}

/**
 * 電車のリストを与えると、それぞれの電車をpauseさせる。
 * @param {Array.<Train>} trains Trainインスタンスの配列
 */
const pauseTrains = (trains) => {
    for (let i = 0, len = trains.length; i < len; i++) {
        trains[i].pause()
    }
}

/**
 * 第一引数で与えた要素の子要素のうち、第二引数で与えたクラス名を持つ要素を削除する。
 * @param {HTMLelment} element 要素
 * @param {string} className 削除する要素のクラス名
 */
const removeElements = (element, className) => {
    let targets = element.querySelectorAll(`.${className}`)
    for (let i = 0, len = targets.length; i < len; i++) {
        element.removeChild(targets[i])
    }
}

const removeElementsByClassName = (className) => {
    const body = document.querySelector('body')
    let targets = body.querySelectorAll(`.${className}`)
    for (let i = 0, len = targets.length; i < len; i++) {
        let target = targets[i]
        let parent = target.parentElement
        parent.removeChild(target)
    }
}

/**
 * 2次元配列の各要素が小さい順に並んでいるか確認する
 * @param {Array.<Array>} array 2次元配列
 * @return {boolean} すべて昇順ならtrue
 */
const isAscending = (array) => {
    
    for (let inners of array) {
        let min = -Infinity

        for (let element of inners) {
            if (element === "") {
                continue
            }

            let sec = toSecFromTimeStr(element)
            if (sec > min) {
                min = sec
                
            } else {
                console.log(`NG: ${element}`)
                return false
            }
        }

    }
    return true
}

const test_isAscending = () => {
    let case1 = [['18:40','18:42','18:44'],['18:47','18:49','18:51'],['18:49','18:50','18:52']]
    let case2 = [["","18:36","18:37"],['18:44','18:45','18:47'],['23:58','24:00','24:02']]
    let case3 = [['18:40','18:42','18:44'],['18:47','18:49','18:51'],['18:49','18:38','18:39']]
    

    let cases = [case1, case2, case3]
    let expecteds = [true, true, false]
    for (let i= 0, len = cases.length; i < len; i++) {
        let actual = isAscending(cases[i]) 
        let expected = expecteds[i]
        console.assert(actual === expected,
        `isAscending(${cases[i]}) => ${actual}, expected: ${expected}`)
    }
}
//test_isAscending()

/**
 * 今日の曜日を文字列で返す
 * @return {string} 平,金,休のいずれかの文字
 */
const getDayOfWeekStr = () => {
    const today = new Date()
    let hour = today.getHours()
    let dayOfWeek = today.getDay()
    // 0:00～5:00までは今日とする。月曜0:10は日曜24:10とみなし、日曜と判定する
    if (hour < 5) {
        dayOfWeek -= 1
    }

    if (dayOfWeek < 0) {
        dayOfWeek +=6
    }

    let dayOfWeekStr = ['休','平','平','平','平','金','休']

    return dayOfWeekStr[dayOfWeek]

}

/**
 * 現在の曜日に応じて、曜日のラジオボタンの選択状態を変える
 */
const setDayToRadioBtn = () => {
    const weekdayRadio = document.getElementById('weekday')
    const holidayRadio = document.getElementById('holiday')
    const dayStr = getDayOfWeekStr ()


    if (dayStr === '休') {
        weekdayRadio.checked = false
        holidayRadio.checked = true

    } else { // 平 or 金
        weekdayRadio.checked = true
        holidayRadio.checked = false
    }

}

/**
 * ラジオボタンの選択状態を返す
 * @return {string} 平 or 休
 */
const getDayFromRadioBtn = () => {
    const weekdayRadio = document.getElementById('weekday')
    
    if (weekdayRadio.checked) {
        return '平'
    } else {
        return '休'
    }
}

/**
 * 現在の曜日を返す。ただし、ラジオボタンの選択状態が優先。
 * @return {string} 平 or 金 or 休
 */
const getVirtualDay = () => {
    let day = getDayOfWeekStr ()
    let radioDay = getDayFromRadioBtn ()

    switch (radioDay) {
        case '休':
            return '休'
        case '平':
            if (day === '金') {
                return '金'
            } else {
                return '平'
            }
    }

}

/**
 * 引数で与えたclass名を持つ要素から、そのclass名を取り除く
 * @param {string} className 
 */
const removeClassName = (className) => {
    let targets = document.getElementsByClassName(className)
    for (let i = 0, len = targets.length; i < len; i++) {
        targets[i].classList.remove(className)
    }
}

/**
 * 電車の運行表のHTML片を作成する
 * 配列の各要素は{time: 'h:mm', sta: '新瑞橋'}形式のオブジェクト
 * @param {Array.<Object>} array
 * @return {HTMLelement} dl要素
 */
const createTimeTable = (array) => {

    const dl = document.createElement('dl')
    
    let t1 = toSecFromNow()

    let count = 0
   
    for (let i = 0, len = array.length; i < len; i++) {

        if (count > 14) {
            break
        }

        let timeStr = array[i].time
        let t2= toSecFromTimeStr(timeStr)

        if (t1 > t2) { // 過ぎた駅は表示しない
            continue
        }

        let stationName = array[i].sta.name
        let dt = document.createElement('dt')
        let dd = document.createElement('dd')
        dt.textContent = timeStr
        dd.textContent = stationName
        dl.appendChild(dt)
        dl.appendChild(dd)

        count += 1
    }

   dl.addEventListener('click', closeTimeTable, false)

   setTimeout(() => { 
       document.getElementById('routemap').addEventListener('click', closeTimeTable, false)
    }, 100)

    return dl
}

const closeTimeTable = () => {
    const nav = document.getElementById('timetable')
    const dl = nav.getElementsByTagName('dl')[0]
    if (dl) {
        nav.removeChild(dl)
        removeClassName ('active')
        document.getElementById('routemap').removeEventListener('click', closeTimeTable)
    }
}
