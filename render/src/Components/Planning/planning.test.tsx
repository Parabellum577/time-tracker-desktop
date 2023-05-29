import * as React from 'react'
import { shallow } from 'enzyme'

import Planning from './index'
import { SIMPLE_PLANNING } from '@test-helpers/sample'

describe('components/planning', () => {
  xit('should render NOT expired, NOT active and NOT outdated planning', () => {
    const planning: any = { ...SIMPLE_PLANNING, Outdated: false, Estimation: 3600 }
    const startPlanning = jest.fn()
    const PlanningComponent: any = Planning
    const wrapper = shallow(
      <PlanningComponent
        bookmarks={[]}
        planning={planning}
        key={planning.ID}
        startPlanning={startPlanning}
        userTrackers={[]}
      />,
    )
    expect(wrapper).toMatchSnapshot()
    wrapper.find('.activateButton').simulate('click')
    expect(wrapper.find('.activateButton')).toMatchSnapshot()
    expect(startPlanning).toBeCalledTimes(1)
  })

  xit('should render NOT expired, active and NOT outdated planning', () => {
    const planning: any = { ...SIMPLE_PLANNING, Active: true, Outdated: false, Estimation: 3600 }
    const stopPlanning = jest.fn()
    const PlanningComponent: any = Planning
    const wrapper = shallow(
      <PlanningComponent
        bookmarks={[]}
        planning={planning}
        key={planning.ID}
        stopPlanning={stopPlanning}
        userTrackers={[]}
      />,
    )
    expect(wrapper).toMatchSnapshot()
    wrapper.find('.activateButton').simulate('click')
    expect(wrapper.find('.activateButton')).toMatchSnapshot()
    expect(stopPlanning).toBeCalledTimes(1)
  })

  xit('should render NOT expired, NOT active and outdated planning', () => {
    const planning: any = { ...SIMPLE_PLANNING, Estimation: 3600 }
    const startPlanning = jest.fn()
    const stopPlanning = jest.fn()
    const PlanningComponent: any = Planning
    const wrapper = shallow(
      <PlanningComponent
        bookmarks={[]}
        planning={planning}
        key={planning.ID}
        startPlanning={startPlanning}
        stopPlanning={stopPlanning}
        userTrackers={[]}
      />,
    )
    expect(wrapper).toMatchSnapshot()
    wrapper.find('.activateButton').simulate('click')
    expect(wrapper.find('.activateButton')).toMatchSnapshot()
    expect(startPlanning).not.toBeCalled()
    expect(stopPlanning).not.toBeCalled()
  })

  xit('should render expired, NOT active and NOT outdated planning', () => {
    const planning: any = {
      ...SIMPLE_PLANNING,
      Outdated: false,
      Estimation: 3600,
      SpentOnline: 7200,
    }
    const startPlanning = jest.fn()
    const PlanningComponent: any = Planning
    const wrapper = shallow(
      <PlanningComponent
        bookmarks={[]}
        planning={planning}
        key={planning.ID}
        startPlanning={startPlanning}
        userTrackers={[]}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
