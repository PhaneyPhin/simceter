let utility = require('utility.js'),
    utcp = require('Utility_tcp.js'),
    ipg = require('pgConnection.js'),
    config = require('config.js'),
    linq = require('linq'),
    moment = require('moment'),
    excel = require('node-excel-export'),
    async = require('async'),
    Excel = require('node-xlsx')
let month = moment().format("MM")
let year = moment().format("YYYY")
let dbname = "sim_center"

function get_login(req, res) {
    let user = req.query["user"];
    let pwd = req.query["pwd"];
    let sql = `SELECT * FROM user_master WHERE username='${user}' AND password=md5('${pwd}')`;

    ipg.get(sql, config.connectionString(), function (data) {
        if (data.length > 0) {
            res.send(data)
            return
        } else {
            res.send([])
        }
    })
}
function get_getconfig(req, res) {
    let i = 1;
    let ip = req.query["ip"];
    let sql
    if (ip != '' && ip != 'undefined') {
        sql = `SELECT * FROM get_config WHERE ip_receive= '${ip}' ORDER BY time_inserver DESC`
    } else {
        sql = `SELECT * FROM get_config ORDER BY time_inserver DESC`
    }

    ipg.get(sql, config.connectionString(), function (data) {
        if (data.length > 0) {
            cc = linq.Enumerable.From(data)
                .GroupBy(p => p.sim)
                .Select(x => {
                    return {
                        num: i++,
                        blackbox_id: x.source[0].blackbox_id,
                        serial_sim: x.source[0].serial_sim,
                        sim: x.source[0].sim,
                        time_inserver: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("DD-MM-YYYY")),
                        type_sim: x.source[0].type_sim,
                        sim_service: x.source[0].sim_service,
                        time_config: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("DD-MM-YYYY HH:mm:ss"),
                        ip_receive: x.source[0].ip_receive,
                        erp_status: x.source[0].erp_status != 0 ? 'bg-success' : 'bg-danger'
                    }
                }).ToArray()
            res.send(cc)
            return
        } else {
            res.send([])
        }
    })
}

function get_getconfigExport(req, res) {
    let bh_boo = false
    let cc
    let ip = req.query["ip"];
    let sql
    if (ip != '') {
        sql = `SELECT * FROM get_config WHERE ip_receive= '${ip}' ORDER BY time_inserver DESC `
    } else {
        sql = `SELECT * FROM get_config ORDER BY time_inserver DESC`
    }
    ipg.get(sql, config.connectionString(), function (data) {
        if (data.length > 0) {
            cc = linq.Enumerable.From(data)
                .GroupBy(p => p.sim)
                .Select(x => {
                    return {
                        blackbox_id: x.source[0].blackbox_id,
                        serial_sim: x.source[0].serial_sim,
                        sim: x.source[0].sim,
                        time_inserver: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("DD-MM-YYYY")),
                        type_sim: x.source[0].type_sim,
                        sim_service: x.source[0].sim_service,
                        time_config: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("DD-MM-YYYY HH:mm:ss"),
                        ip_receive: x.source[0].ip_receive,
                        erp_status: x.source[0].erp_status,
                        erp_time: x.source[0].erp_time == 'Invalid date' ? '-' : moment(x.source[0].erp_time).format("DD-MM-YYYY HH:mm:ss")
                    }
                }).ToArray()
        }
        //res.send([])
        bh_boo = true
        excelExport()
    })
    let excelExport = () => {
        if (bh_boo) {
            let styles = {
                headerDark: {
                    font: {
                        bold: true
                    }
                }
            }
            let headCC = {
                blackbox_id: {
                    displayName: 'Blackbox id',
                    headerStyle: styles.headerDark,
                    width: 160
                },
                serial_sim: {
                    displayName: 'Serial Sim',
                    headerStyle: styles.headerDark,
                    width: 150
                },
                sim: {
                    displayName: 'Sim',
                    headerStyle: styles.headerDark,
                    width: 160
                },
                time_inserver: {
                    displayName: 'Last update',
                    headerStyle: styles.headerDark,
                    width: 160
                },
                type_sim: {
                    displayName: 'Type Sim',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                sim_service: {
                    displayName: 'Sim service',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                time_config: {
                    displayName: 'Time Config',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                ip_receive: {
                    displayName: 'IP Address',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                erp_status: {
                    displayName: 'ERP Status',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                erp_time: {
                    displayName: 'Time get ERP',
                    headerStyle: styles.headerDark,
                    width: 170
                }
            }
            let report = excel.buildExport([{
                name: 'getconfig',
                specification: headCC,
                data: cc
            }])
            res.attachment(`get_config.xlsx`)
            res.send(report)
        }
    }
}
// function get_getconfigExportpost(req, res) {
//     let bh_boo = false
//     let cc
//     let data = req.body.data
//     let sql

//     let excelExport = () => {
//         if (bh_boo) {
//             let styles = {
//                 headerDark: {
//                     font: {
//                         bold: true
//                     }
//                 }
//             }
//             let headCC = {
//                 blackbox_id: {
//                     displayName: 'Blackbox id',
//                     headerStyle: styles.headerDark,
//                     width: 160
//                 },
//                 serial_sim: {
//                     displayName: 'Serial Sim',
//                     headerStyle: styles.headerDark,
//                     width: 150
//                 },
//                 sim: {
//                     displayName: 'Sim',
//                     headerStyle: styles.headerDark,
//                     width: 160
//                 },
//                 time_inserver: {
//                     displayName: 'Last update',
//                     headerStyle: styles.headerDark,
//                     width: 160
//                 },
//                 type_sim: {
//                     displayName: 'Type Sim',
//                     headerStyle: styles.headerDark,
//                     width: 170
//                 },
//                 sim_service: {
//                     displayName: 'Sim service',
//                     headerStyle: styles.headerDark,
//                     width: 170
//                 },
//                 time_config: {
//                     displayName: 'Time Config',
//                     headerStyle: styles.headerDark,
//                     width: 170
//                 },
//                 ip_receive: {
//                     displayName: 'IP Address',
//                     headerStyle: styles.headerDark,
//                     width: 170
//                 },
//                 erp_status: {
//                     displayName: 'ERP Status',
//                     headerStyle: styles.headerDark,
//                     width: 170
//                 },
//                 erp_time: {
//                     displayName: 'Time get ERP',
//                     headerStyle: styles.headerDark,
//                     width: 170
//                 }
//             }
//             let report = excel.buildExport([{
//                 name: 'getconfig',
//                 specification: headCC,
//                 data: data
//             }])
//             res.attachment(`get_config.xlsx`)
//             res.send(report)
//             return
//         }
//     }
//     if (data.length > 0) {
//         bh_boo = true
//         excelExport()
//     } else {
//         bh_boo = false
//         excelExport()
//     }
// }
function get_countupdate(req, res) {
    let ip = req.query["ip"];
    let sql
    if (ip != '') {
        sql = `SELECT( SELECT COUNT (sim) FROM get_config WHERE EXTRACT (MONTH FROM time_inserver) = ${month} AND EXTRACT (YEAR FROM time_inserver) = ${year} AND ip_receive= '${ip}' ) AS updatetruck, ( SELECT COUNT (sim) FROM get_config WHERE EXTRACT (MONTH FROM time_inserver) != ${month} AND EXTRACT (YEAR FROM time_inserver) <= ${year} AND ip_receive= '${ip}') AS noupdatetruck`
    } else {
        sql = `SELECT( SELECT COUNT (sim) FROM get_config WHERE EXTRACT (MONTH FROM time_inserver) = ${month} AND EXTRACT (YEAR FROM time_inserver) = ${year} ) AS updatetruck, ( SELECT COUNT (sim) FROM get_config WHERE EXTRACT (MONTH FROM time_inserver) != ${month} AND EXTRACT (YEAR FROM time_inserver) <= ${year}) AS noupdatetruck`
    }
    ipg.get(sql, config.connectionString(), function (data) {
        if (data.length) {
            res.send(data)
        } else {
            res.send([])
        }
    })
}

function get_ipreseive(req, res) {
    let sql = `SELECT DISTINCT(ip_receive) FROM get_config `
    ipg.get(sql, config.connectionString(), function (data) {
        if (data.length) {
            res.send(data)
        } else {
            res.send([])
        }
    })
}
function get_configBytime(req, res) {
    let i = 1
    let j = 1
    let num = 0
    let sql = ``
    let ip = req.query["ip"];
    let start = req.query["start"] == 'undefined' ? moment().format("YYYY-MM-DD") : req.query["start"];
    let end = req.query["end"] == 'undefined' ? moment().format("YYYY-MM-DD") : req.query["end"];
    let start_month = moment(start).format("MM")
    let end_month = moment(end).format("MM")
    let year = moment(start).format("YY")
    let q_start = 0
    let q_end = 0
    if (start_month == '01' || start_month == '02' || start_month == '03') {
        q_start = 1
    } else if (start_month == '04' || start_month == '05' || start_month == '06') {
        q_start = 2
    } else if (start_month == '07' || start_month == '08' || start_month == '09') {
        q_start = 3
    } else if (start_month == '10' || start_month == '11' || start_month == '12') {
        q_start = 4
    } else {
        q_start = 1
    }
    if (end_month == '01' || end_month == '02' || end_month == '03') {
        q_end = 1
    } else if (end_month == '04' || end_month == '05' || end_month == '06') {
        q_end = 2
    } else if (end_month == '07' || end_month == '08' || end_month == '09') {
        q_end = 3
    } else if (end_month == '10' || end_month == '11' || end_month == '12') {
        q_end = 4
    } else {
        q_end = 1
    }

    if (q_end != 1 && start <= moment().format("YYYY-MM-DD")) {
        end = moment().format("YYYY-MM-DD")
        let end_month = moment(end).format("MM")
        if (end_month == '01' || end_month == '02' || end_month == '03') {
            q_end = 1
        } else if (end_month == '04' || end_month == '05' || end_month == '06') {
            q_end = 2
        } else if (end_month == '07' || end_month == '08' || end_month == '09') {
            q_end = 3
        } else if (end_month == '10' || end_month == '11' || end_month == '12') {
            q_end = 4
        } else {
            q_end = 1
        }
    }

    num = (q_end - q_start) + 1
    let arrdata = new Array(num)
    async.eachSeries(arrdata, function (row, next) {
        if (ip == '') {
            sql += `SELECT get_config.blackbox_id,get_config.serial_sim,get_config.sim,CASE WHEN s1.time_inserver IS NULL THEN get_config.time_inserver ELSE s1.time_inserver END as time_inserver,get_config.type_sim,get_config.sim_service,CASE WHEN s1.time_config IS NULL THEN get_config.time_config ELSE s1.time_config END as time_config,get_config.ip_receive,erp_status,CASE WHEN s1.time_inserver IS NULL THEN 0 ELSE 1 END as status FROM get_config
            LEFT JOIN
            (SELECT sim,MAX(time_inserver) as time_inserver,MAX(time_config) as time_config FROM get_config_0${q_start}${year} WHERE (time_inserver >= '${start}' AND time_inserver <= '${end}' ) GROUP BY sim) s1
            ON get_config.sim = s1.sim`
            i++
            next()
        } else {
            sql += `SELECT get_config.blackbox_id,get_config.serial_sim,get_config.sim,CASE WHEN s1.time_inserver IS NULL THEN get_config.time_inserver ELSE s1.time_inserver END as time_inserver,get_config.type_sim,get_config.sim_service,CASE WHEN s1.time_config IS NULL THEN get_config.time_config ELSE s1.time_config END as time_config,get_config.ip_receive,erp_status,CASE WHEN s1.time_inserver IS NULL THEN 0 ELSE 1 END as status FROM get_config
            LEFT JOIN
            (SELECT sim,MAX(time_inserver) as time_inserver,MAX(time_config) as time_config FROM get_config_0${q_start}${year} WHERE (time_inserver >= '${start}' AND time_inserver <= '${end}' ) GROUP BY sim) s1
            ON get_config.sim = s1.sim WHERE get_config.ip_receive ='${ip}'`
            i++
            next()
        }
    }, () => {
        ipg.get(sql, config.connectionString(), function (data) {
            if (data.length > 0) {
                cc = linq.Enumerable.From(data)
                    .GroupBy(p => p.sim)
                    .Select(x => {
                        return {
                            num: j++,
                            blackbox_id: x.source[0].blackbox_id,
                            serial_sim: x.source[0].serial_sim,
                            sim: x.source[0].sim,
                            time_inserver: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("DD-MM-YYYY")),
                            type_sim: x.source[0].type_sim,
                            sim_service: x.source[0].sim_service,
                            time_config: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("DD-MM-YYYY HH:mm:ss"),
                            ip_receive: x.source[0].ip_receive,
                            erp_status: x.source[0].erp_status != 0 ? 'bg-success' : 'bg-danger',
                            status: x.source[0].status != 0 ? '' : 'bg-danger'
                        }
                    }).ToArray()
                res.send(cc)
                return
            } else {
                res.send([])
            }
        })
    })
}
function get_configBytimeExport(req, res) {
    let i = 1
    let j = 1
    let num = 0
    let sql = ``
    let cc
    let bh_boo = false
    let ip = req.query["ip"];
    let start = req.query["start"] == 'undefined' ? moment().format("YYYY-MM-DD") : req.query["start"];
    let end = req.query["end"] == 'undefined' ? moment().format("YYYY-MM-DD") : req.query["end"];
    let start_month = moment(start).format("MM")
    let end_month = moment(end).format("MM")
    let year = moment(start).format("YY")
    let q_start = 0
    let q_end = 0
    if (start_month == '01' || start_month == '02' || start_month == '03') {
        q_start = 1
    } else if (start_month == '04' || start_month == '05' || start_month == '06') {
        q_start = 2
    } else if (start_month == '07' || start_month == '08' || start_month == '09') {
        q_start = 3
    } else if (start_month == '10' || start_month == '11' || start_month == '12') {
        q_start = 4
    } else {
        q_start = 1
    }
    if (end_month == '01' || end_month == '02' || end_month == '03') {
        q_end = 1
    } else if (end_month == '04' || end_month == '05' || end_month == '06') {
        q_end = 2
    } else if (end_month == '07' || end_month == '08' || end_month == '09') {
        q_end = 3
    } else if (end_month == '10' || end_month == '11' || end_month == '12') {
        q_end = 4
    } else {
        q_end = 1
    }

    if (q_end != 1 && start <= moment().format("YYYY-MM-DD")) {
        end = moment().format("YYYY-MM-DD")
        let end_month = moment(end).format("MM")
        if (end_month == '01' || end_month == '02' || end_month == '03') {
            q_end = 1
        } else if (end_month == '04' || end_month == '05' || end_month == '06') {
            q_end = 2
        } else if (end_month == '07' || end_month == '08' || end_month == '09') {
            q_end = 3
        } else if (end_month == '10' || end_month == '11' || end_month == '12') {
            q_end = 4
        } else {
            q_end = 1
        }
    }

    num = (q_end - q_start) + 1
    let arrdata = new Array(num)
    async.eachSeries(arrdata, function (row, next) {
        if (ip == '') {
            sql += `SELECT get_config.blackbox_id,get_config.serial_sim,get_config.sim,CASE WHEN s1.time_inserver IS NULL THEN get_config.time_inserver ELSE s1.time_inserver END as time_inserver,get_config.type_sim,get_config.sim_service,CASE WHEN s1.time_config IS NULL THEN get_config.time_config ELSE s1.time_config END as time_config,get_config.ip_receive,erp_status,CASE WHEN s1.time_inserver IS NULL THEN 0 ELSE 1 END as status FROM get_config
            LEFT JOIN
            (SELECT sim,MAX(time_inserver) as time_inserver,MAX(time_config) as time_config FROM get_config_0${q_start}${year} WHERE (time_inserver >= '${start}' AND time_inserver <= '${end}' ) GROUP BY sim) s1
            ON get_config.sim = s1.sim`
            i++
            next()
        } else {
            sql += `SELECT get_config.blackbox_id,get_config.serial_sim,get_config.sim,CASE WHEN s1.time_inserver IS NULL THEN get_config.time_inserver ELSE s1.time_inserver END as time_inserver,get_config.type_sim,get_config.sim_service,CASE WHEN s1.time_config IS NULL THEN get_config.time_config ELSE s1.time_config END as time_config,get_config.ip_receive,erp_status,CASE WHEN s1.time_inserver IS NULL THEN 0 ELSE 1 END as status FROM get_config
            LEFT JOIN
            (SELECT sim,MAX(time_inserver) as time_inserver,MAX(time_config) as time_config FROM get_config_0${q_start}${year} WHERE (time_inserver >= '${start}' AND time_inserver <= '${end}' ) GROUP BY sim) s1
            ON get_config.sim = s1.sim WHERE get_config.ip_receive ='${ip}'`
            i++
            next()
        }
    }, () => {
        ipg.get(sql, config.connectionString(), function (data) {
            if (data.length > 0) {
                cc = linq.Enumerable.From(data)
                    .GroupBy(p => p.sim)
                    .Select(x => {
                        return {
                            num: j++,
                            blackbox_id: x.source[0].blackbox_id,
                            serial_sim: x.source[0].serial_sim,
                            sim: x.source[0].sim,
                            time_inserver: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("DD-MM-YYYY")),
                            type_sim: x.source[0].type_sim,
                            sim_service: x.source[0].sim_service,
                            time_config: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("DD-MM-YYYY HH:mm:ss"),
                            ip_receive: x.source[0].ip_receive,
                            erp_status: x.source[0].erp_status != 0 ? 'bg-success' : 'bg-danger',
                            status: x.source[0].status != 0 ? '' : 'bg-danger'
                        }
                    }).ToArray()
                bh_boo = true
                excelExport()
            }

        })
        let excelExport = () => {
            if (bh_boo) {
                let styles = {
                    headerDark: {
                        font: {
                            bold: true
                        }
                    }
                }
                let headCC = {
                    blackbox_id: {
                        displayName: 'Blackbox id',
                        headerStyle: styles.headerDark,
                        width: 160
                    },
                    serial_sim: {
                        displayName: 'Serial Sim',
                        headerStyle: styles.headerDark,
                        width: 150
                    },
                    sim: {
                        displayName: 'Sim',
                        headerStyle: styles.headerDark,
                        width: 160
                    },
                    time_inserver: {
                        displayName: 'Last update',
                        headerStyle: styles.headerDark,
                        width: 160
                    },
                    type_sim: {
                        displayName: 'Type Sim',
                        headerStyle: styles.headerDark,
                        width: 170
                    },
                    sim_service: {
                        displayName: 'Sim service',
                        headerStyle: styles.headerDark,
                        width: 170
                    },
                    time_config: {
                        displayName: 'Time Config',
                        headerStyle: styles.headerDark,
                        width: 170
                    },
                    ip_receive: {
                        displayName: 'IP Address',
                        headerStyle: styles.headerDark,
                        width: 170
                    }
                }
                let report = excel.buildExport([{
                    name: 'getconfig_Time',
                    specification: headCC,
                    data: cc
                }])
                res.attachment(`get_configbytime.xlsx`)
                res.send(report)
            }
        }
    })
}


// exports.uploadexcel = function (req, res) {
//     let fileimport = Excel.parse(req.files[0].path)
//     let sim = ''
//     let start = req.body.start == 'undefined' ? moment().format("YYYY-MM-DD") : req.body.start
//     let end = req.body.end == 'undefined' ? moment().format("YYYY-MM-DD") : req.body.end
//     let start_month = moment(start).format("MM")
//     let end_month = moment(end).format("MM")
//     let year = moment(start).format("YY")
//     let q_start = 0
//     let q_end = 0
//     let sql = ``
//     let j = 1
//     let i = 1
//     let obj = []
//     let cc = null
//     let sqlinsert = `DELETE FROM get_config_temp;` 
//     if (start_month == '01' || start_month == '02' || start_month == '03') {
//         q_start = 1
//     } else if (start_month == '04' || start_month == '05' || start_month == '06') {
//         q_start = 2
//     } else if (start_month == '07' || start_month == '08' || start_month == '09') {
//         q_start = 3
//     } else if (start_month == '10' || start_month == '11' || start_month == '12') {
//         q_start = 4
//     } else {
//         q_start = 1
//     }
//     if (end_month == '01' || end_month == '02' || end_month == '03') {
//         q_end = 1
//     } else if (end_month == '04' || end_month == '05' || end_month == '06') {
//         q_end = 2
//     } else if (end_month == '07' || end_month == '08' || end_month == '09') {
//         q_end = 3
//     } else if (end_month == '10' || end_month == '11' || end_month == '12') {
//         q_end = 4
//     } else {
//         q_end = 1
//     }

//     if (q_end != 1 && start <= moment().format("YYYY-MM-DD")) {
//         end = moment().format("YYYY-MM-DD")
//         let end_month = moment(end).format("MM")
//         if (end_month == '01' || end_month == '02' || end_month == '03') {
//             q_end = 1
//         } else if (end_month == '04' || end_month == '05' || end_month == '06') {
//             q_end = 2
//         } else if (end_month == '07' || end_month == '08' || end_month == '09') {
//             q_end = 3
//         } else if (end_month == '10' || end_month == '11' || end_month == '12') {
//             q_end = 4
//         } else {
//             q_end = 1
//         }
//     }

//     num = (q_end - q_start) + 1
//     let arrdata = new Array(num)

//     console.log(fileimport[1].data.length)
//     fileimport[0].data.shift()
//     async.eachSeries(fileimport[1].data, function (rowsim, next1) {
//         console.log(rowsim[0])
//         async.eachSeries(arrdata, function (row, next) {
//             sql = `SELECT get_config.blackbox_id,get_config.serial_sim,get_config.sim,CASE WHEN s1.time_inserver IS NULL THEN get_config.time_inserver ELSE s1.time_inserver END as time_inserver,get_config.type_sim,get_config.sim_service,CASE WHEN s1.time_config IS NULL THEN get_config.time_config ELSE s1.time_config END as time_config,get_config.ip_receive,erp_status,CASE WHEN s1.time_inserver IS NULL THEN 0 ELSE 1 END as status FROM get_config
//             LEFT JOIN
//             (SELECT sim,MAX(time_inserver) as time_inserver,MAX(time_config) as time_config FROM get_config_0${q_start}${year} WHERE (time_inserver >= '${start}' AND time_inserver <= '${end}' ) GROUP BY sim) s1
//             ON get_config.sim = s1.sim WHERE get_config.sim IN ('${rowsim[0]}') LIMIT 100`
//             next()
//         }, () => {
//             ipg.get(sql, config.connectionString(), function (data) {
//                 if (data.length > 0) {
//                     //console.log(j)
//                     cc = linq.Enumerable.From(data)
//                         .GroupBy(p => p.sim)
//                         .Select(x => {
//                             return {
//                                 num: j++,
//                                 blackbox_id: x.source[0].blackbox_id,
//                                 serial_sim: x.source[0].serial_sim,
//                                 sim: x.source[0].sim,
//                                 time_inserver: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("DD-MM-YYYY")),
//                                 time_inserver_in: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("YYYY-MM-DD")),
//                                 type_sim: x.source[0].type_sim,
//                                 sim_service: x.source[0].sim_service,
//                                 time_config: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("DD-MM-YYYY HH:mm:ss"),
//                                 time_config_in: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("YYYY-MM-DD HH:mm:ss"),
//                                 ip_receive: x.source[0].ip_receive,
//                                 erp_status_in: x.source[0].erp_status,
//                                 erp_status: x.source[0].erp_status != 0 ? 'bg-success' : 'bg-danger',
//                                 status: x.source[0].status != 0 ? '' : 'bg-danger'
//                             }
//                         }).ToArray()
//                     obj.push(cc[0])
//                     next1()
//                 } else {
//                     next1()
//                 }
//             })
//         })
//     }, () => {
//         async.eachSeries(obj, function (rowdataobj, nextobj) {
//             sqlinsert += `INSERT INTO get_config_temp (blackbox_id, serial_sim, sim, time_inserver, type_sim, sim_service, time_config, ip_receive, erp_status) VALUES ('${rowdataobj.blackbox_id}', '${rowdataobj.serial_sim}', '${rowdataobj.sim}', '${rowdataobj.time_inserver_in}', '${rowdataobj.type_sim}', '${rowdataobj.sim_service}', '${rowdataobj.time_config_in}', '${rowdataobj.ip_receive}', '${rowdataobj.erp_status_in}');`
//             nextobj()
//         },()=>{
//             debugger
//             ipg.excute(dbname,sqlinsert,config.connectionString(),(rescommand)=>{
//                 if(rescommand == 'ok'){
//                     res.send(obj)
//                 }else{
//                     res.send(obj)
//                 }
//             })
//         })


//     })

// }
exports.uploadexcel = function (req, res) {
    let fileimport = Excel.parse(req.files[0].path)
    let sim
    let start = req.body.start == 'undefined' ? moment().format("YYYY-MM-DD") : req.body.start
    let end = req.body.end == 'undefined' ? moment().format("YYYY-MM-DD") : req.body.end
    let start_month = moment(start).format("MM")
    let end_month = moment(end).format("MM")
    let year = moment(start).format("YY")
    let q_start = 0
    let q_end = 0
    let sql = ``
    let j = 1
    let i = 1
    let obj = []
    let cc
    if (start_month == '01' || start_month == '02' || start_month == '03') {
        q_start = 1
    } else if (start_month == '04' || start_month == '05' || start_month == '06') {
        q_start = 2
    } else if (start_month == '07' || start_month == '08' || start_month == '09') {
        q_start = 3
    } else if (start_month == '10' || start_month == '11' || start_month == '12') {
        q_start = 4
    } else {
        q_start = 1
    }
    sql = `SELECT get_config.blackbox_id,get_config.serial_sim,get_config.sim,CASE WHEN s1.time_inserver IS NULL THEN get_config.time_inserver ELSE s1.time_inserver END as time_inserver,get_config.type_sim,get_config.sim_service,CASE WHEN s1.time_config IS NULL THEN get_config.time_config ELSE s1.time_config END as time_config,get_config.ip_receive,erp_status,CASE WHEN s1.time_inserver IS NULL THEN 0 ELSE 1 END as status FROM get_config
            LEFT JOIN
            (SELECT sim,MAX(time_inserver) as time_inserver,MAX(time_config) as time_config FROM get_config_0${q_start}${year} WHERE (time_inserver >= '${start}' AND time_inserver <= '${end}' ) GROUP BY sim) s1
            ON get_config.sim = s1.sim`
    ipg.get(sql, config.connectionString(), function (data) {
        if (data.length > 0) {
            cc = linq.Enumerable.From(data)
                .GroupBy(p => p.sim)
                .Select(x => {
                    return {
                        num: j++,
                        blackbox_id: x.source[0].blackbox_id,
                        serial_sim: x.source[0].serial_sim,
                        sim: x.source[0].sim,
                        time_inserver: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("DD-MM-YYYY")),
                        time_inserver_in: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("YYYY-MM-DD")),
                        type_sim: x.source[0].type_sim,
                        sim_service: x.source[0].sim_service,
                        time_config: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("DD-MM-YYYY HH:mm:ss"),
                        time_config_in: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("YYYY-MM-DD HH:mm:ss"),
                        ip_receive: x.source[0].ip_receive,
                        erp_status_in: x.source[0].erp_status,
                        erp_status: x.source[0].erp_status != 0 ? 'bg-success' : 'bg-danger',
                        status: x.source[0].status != 0 ? '' : 'bg-danger'
                    }
                }).ToArray()
            if (cc.length > 0) {
                try {
                    console.log(fileimport[1].data.length +" "+ cc.length)
                    //fileimport[1].data.shift()
                    async.eachSeries(fileimport[1].data, function (rowsim, next1) {
                        console.log(rowsim + " " + i)
                        
                        // sim = linq.Enumerable.From(cc)
                        //     .Where(function (x) { return x.sim == rowsim[0]})
                        //     .ToArray()
                        // if (sim.length > 0) {
                        //     //obj.push(sim[0])
                        //     next1()
                        // } else {
                        //     next1()
                        // }
                        i++;
                        next1()
                       

                    }, () => {
                        debugger
                       // res.send(obj)
                    })
                } catch (e) {
                    console.log(e)
                }
            }else{
                debugger
            }
        } else {
            res.send([])
        }
    })
}
function get_getconfigExcelExport(req, res) {
    let bh_boo = false
    let cc
    let sql
    sql = `SELECT * FROM get_config_temp ORDER BY time_inserver DESC`
    ipg.get(sql, config.connectionString(), function (data) {
        if (data.length > 0) {
            cc = linq.Enumerable.From(data)
                .GroupBy(p => p.sim)
                .Select(x => {
                    return {
                        blackbox_id: x.source[0].blackbox_id,
                        serial_sim: x.source[0].serial_sim,
                        sim: x.source[0].sim,
                        time_inserver: x.source[0].time_inserver == 'Invalid date' ? '-' : x.Max(p => moment(p.time_inserver).format("DD-MM-YYYY")),
                        type_sim: x.source[0].type_sim,
                        sim_service: x.source[0].sim_service,
                        time_config: x.source[0].time_config == 'Invalid date' ? '-' : moment(x.source[0].time_config).format("DD-MM-YYYY HH:mm:ss"),
                        ip_receive: x.source[0].ip_receive,
                        erp_status: x.source[0].erp_status,
                        erp_time: x.source[0].erp_time == 'Invalid date' ? '-' : moment(x.source[0].erp_time).format("DD-MM-YYYY HH:mm:ss")
                    }
                }).ToArray()
        }
        //res.send([])
        bh_boo = true
        excelExport()
    })
    let excelExport = () => {
        if (bh_boo) {
            let styles = {
                headerDark: {
                    font: {
                        bold: true
                    }
                }
            }
            let headCC = {
                blackbox_id: {
                    displayName: 'Blackbox id',
                    headerStyle: styles.headerDark,
                    width: 160
                },
                serial_sim: {
                    displayName: 'Serial Sim',
                    headerStyle: styles.headerDark,
                    width: 150
                },
                sim: {
                    displayName: 'Sim',
                    headerStyle: styles.headerDark,
                    width: 160
                },
                time_inserver: {
                    displayName: 'Last update',
                    headerStyle: styles.headerDark,
                    width: 160
                },
                type_sim: {
                    displayName: 'Type Sim',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                sim_service: {
                    displayName: 'Sim service',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                time_config: {
                    displayName: 'Time Config',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                ip_receive: {
                    displayName: 'IP Address',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                erp_status: {
                    displayName: 'ERP Status',
                    headerStyle: styles.headerDark,
                    width: 170
                },
                erp_time: {
                    displayName: 'Time get ERP',
                    headerStyle: styles.headerDark,
                    width: 170
                }
            }
            let report = excel.buildExport([{
                name: 'getconfig',
                specification: headCC,
                data: cc
            }])
            res.attachment(`get_config.xlsx`)
            res.send(report)
        }
    }
}

exports.get_login = get_login
exports.get_getconfig = get_getconfig
exports.get_getconfigExport = get_getconfigExport
//exports.get_getconfigExportpost = get_getconfigExportpost
exports.get_countupdate = get_countupdate
exports.get_ipreseive = get_ipreseive
exports.get_configBytime = get_configBytime
exports.get_configBytimeExport = get_configBytimeExport
exports.get_getconfigExcelExport = get_getconfigExcelExport