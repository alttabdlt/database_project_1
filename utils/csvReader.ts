import fs from 'fs'
import csv from 'csv-parser'

interface CsvData {
  [key: string]: string
}

const readCSV = (filePath: string): Promise<CsvData[]> => {
  return new Promise((resolve, reject) => {
    const results: CsvData[] = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CsvData) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

export default readCSV