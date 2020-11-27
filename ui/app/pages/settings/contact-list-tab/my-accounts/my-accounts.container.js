import ViewContact from './my-accounts.component'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { accountsWithSendEtherInfoSelector } from '../../../../selectors'

const mapStateToProps = (state) => {
  const myAccounts = accountsWithSendEtherInfoSelector(state)

  return {
    myAccounts,
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps),
)(ViewContact)
