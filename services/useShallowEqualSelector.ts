import { IRootState } from '@store/rootReducer'
import { useSelector, shallowEqual } from 'react-redux'

export default <TReturn>(selector: (state: IRootState) => TReturn) =>
  useSelector<IRootState, TReturn>(selector, shallowEqual)
