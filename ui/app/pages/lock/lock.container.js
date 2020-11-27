import Lock from './lock.component'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { lockMetamask } from '../../store/actions'

const mapStateToProps = (state) => {
  const { metamask: { isUnlocked } } = state

  return {
    isUnlocked,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    lockMetamask: () => dispatch(lockMetamask()),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Lock)
