const version = 32
import { cloneDeep } from 'lodash'

/**
 * The purpose of this migration is to set the {@code completedUiMigration} flag based on the user's UI preferences
 */
export default {
  version,
  migrate: async function (originalVersionedData) {
    const versionedData = cloneDeep(originalVersionedData)
    versionedData.meta.version = version
    const state = versionedData.data
    versionedData.data = transformState(state)
    return versionedData
  },
}

function transformState (state) {
  const { PreferencesController } = state

  if (PreferencesController) {
    const { betaUI } = PreferencesController.featureFlags || {}
    // Users who have been using the "beta" UI are considered to have completed the migration
    // as they'll see no difference in this version
    PreferencesController.completedUiMigration = betaUI
  }

  return state
}
