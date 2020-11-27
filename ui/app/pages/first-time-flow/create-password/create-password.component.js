import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import NewAccount from './new-account'
import MetaFoxLogo from '../../../components/ui/metafox-logo'
import ImportWithSeedPhrase from './import-with-seed-phrase'
import {
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE,
  INITIALIZE_SEED_PHRASE_ROUTE,
} from '../../../helpers/constants/routes'

export default class CreatePassword extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    isInitialized: PropTypes.bool,
    onCreateNewAccount: PropTypes.func,
    onCreateNewAccountFromSeed: PropTypes.func,
  }

  componentDidMount () {
    const { isInitialized, history } = this.props

    if (isInitialized) {
      history.push(INITIALIZE_SEED_PHRASE_ROUTE)
    }
  }

  render () {
    const { onCreateNewAccount, onCreateNewAccountFromSeed } = this.props

    return (
      <div className="first-time-flow__wrapper">
        <MetaFoxLogo />
        <Switch>
          <Route
            exact
            path={INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE}
            render={(routeProps) => (
              <ImportWithSeedPhrase
                { ...routeProps }
                onSubmit={onCreateNewAccountFromSeed}
              />
            )}
          />
          <Route
            exact
            path={INITIALIZE_CREATE_PASSWORD_ROUTE}
            render={(routeProps) => (
              <NewAccount
                { ...routeProps }
                onSubmit={onCreateNewAccount}
              />
            )}
          />
        </Switch>
      </div>
    )
  }
}
