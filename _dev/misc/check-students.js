const fs = require('fs')
const path = require('path')
const async = require('async')
const request = require('request')

const students = fs.readFileSync(path.join(__dirname, 'students.txt')).toString().split('\n')
students.pop() // remove last empty entry

function checkStudent (student, cb) {
  request(`http://voyager.deanza.edu/~${student}/`, (err, res, body) => {
    if (err) {
      console.error(`ERROR: ${student}`)
      cb(err)
    } else {
      const pass = body && body.length
      console.log(`${student}: ${pass || 0}`)
      cb(null, pass)
    }
  })
}

async.mapSeries(students, checkStudent, (err, results) => {
  if (err) {
    console.error(err)
  } else {
    const passedStudents = students.filter((_, index) => results[index])
    fs.writeFileSync(path.join(__dirname, 'students-passed.txt'), passedStudents.join('\n') + '\n')
    console.log(`Wrote to ${path.join(__dirname, 'students-passed.txt')}`)
  }
})
