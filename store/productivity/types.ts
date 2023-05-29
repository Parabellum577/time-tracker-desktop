import { IChartData, IFocusChart } from '@types'

export interface IAverageData {
  Points: number
  Focus: number
  UsefullActivityPercent: number
  AverageWork: number
  AverageCommunication: number
  AverageEntertainment: number
  AverageLearning: number
  AverageOther: number
}

export interface IProductivities {
  chartData: IChartData[]
  focuses: IFocusChart[]
  averageData: IAverageData
}
