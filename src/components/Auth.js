import React, { Component, Fragment } from 'react'
import cx from 'classnames'
import caver from 'klaytn/caver'

import './Auth.scss'

/**
 * Auth component manages authentication.
 * It provides two different access method.
 * 1) By keystore(json file) + password
 * 2) By privatekey
 */
class Auth extends Component {
  constructor() {
    super()
    this.state = {
      accessType: 'keystore', // || 'privateKey'
      keystore: '',
      keystoreMsg: '',
      password: '',
      privateKey: '',
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  /**
   * reset method reset states to intial state.
   */
  reset = () => {
    this.setState({
      keystore: '',
      privateKey: '',
      password: '',
      keystoreMsg: ''
    })
  }

  /**
   * handleImport method takes a file, read
   */
  handleImport = (e) => {
    const keystore = e.target.files[0]
    // 'FileReader' is used for reading contents of file.
    // We would use 'onload' handler and 'readAsText' method.
    // * FileReader.onload
    // - This event is triggered each time the reading operation is completed.
    // * FileReader.readAsText()
    // - Starts reading the contents.
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      try {
        if (!this.checkValidKeystore(e.target.result)) {
          // If key store file is invalid, show message "Invalid keystore file."
          this.setState({ keystoreMsg: 'Invalid keystore file.' })
          return
        }
        // If key store file is valid,
        // 1) set e.target.result keystore
        // 2) show message "It is valid keystore. input your password."
        this.setState({
          keystore: e.target.result,
          keystoreMsg: 'It is valid keystore. input your password.',
          keystoreName: keystore.name,
        }, () => document.querySelector('#input-password').focus())
      } catch (e) {
        this.setState({ keystoreMsg: 'Invalid keystore file.' })
        return
      }
    }
    fileReader.readAsText(keystore)
  }

  checkValidKeystore = (keystore) => {
    // e.target.result is popultaed by keystore contents.
    // Since keystore contents is JSON string, we should parse it to use.
    const parsedKeystore = JSON.parse(keystore)

    // Valid key store has 'version', 'id', 'address', 'crypto' properties.
    const isValidKeystore = parsedKeystore.version &&
      parsedKeystore.id &&
      parsedKeystore.address &&
      parsedKeystore.crypto

    return isValidKeystore
  }

  /**
   * handleLogin method
   */
  handleLogin = () => {
    const { accessType, keystore, password, privateKey } = this.state

    // Access type2: access thorugh private key
    if (accessType == 'privateKey') {
      this.integrateWallet(privateKey)
      return
    }

    // Access type1: access through keystore + password
    try {
      const { privateKey: privateKeyFromKeystore } = caver.klay.accounts.decrypt(keystore, password)
      this.integrateWallet(privateKeyFromKeystore)
    } catch (e) {
      this.setState({ keystoreMsg: `Password doesn't match.` })
    }
  }

  /**
   * getWallet method get wallet instance from caver.
   */
  getWallet = () => {
    if (caver.klay.accounts.wallet.length) {
      return caver.klay.accounts.wallet[0]
    }
  }

  /**
   * integrateWallet method integrate wallet instance to caver.
   * In detail, this method works like the step below:
   * 1) it takes private key as an input argument.
   * 2) get wallet instance through caver with private key.
   * 3) set wallet instance to session storage for storing wallet instance
   * cf) session storage stores item until tab is closed.
   */
  integrateWallet = (privateKey) => {
    const walletInstance = caver.klay.accounts.privateKeyToAccount(privateKey)
    caver.klay.accounts.wallet.add(walletInstance)
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance))
    this.reset()
  }

  /**
   * removeWallet method removes
   * 1) wallet instance from caver.klay.accounts
   * 2) 'walletInstance' value from session storage.
   */
  removeWallet = () => {
    caver.klay.accounts.wallet.clear()
    sessionStorage.removeItem('walletInstance')
    this.reset()
  }

  /**
   * toggleAccessType method toggles access type
   * 1) By keystore.
   * 2) By private key.
   * After toggling access type, reset current state to intial state.
   */
  toggleAccessType = () => {
    const { accessType } = this.state
    this.setState({
      accessType: accessType === 'privateKey' ? 'keystore' : 'privateKey'
    }, this.reset)
  }

  renderAuth = () => {
    const { keystore, keystoreMsg, keystoreName, accessType } = this.state
    const walletInstance = this.getWallet()
    // 'walletInstance' exists means that wallet is already integrated.
    if (walletInstance) {
      return (
        <Fragment>
          <label className="Auth__label">Integrated: </label>
          <p className="Auth__address">{walletInstance.address}</p>
          <button className="Auth__logout" onClick={this.removeWallet}>Logout</button>
        </Fragment>
      )
    }

    return (
      <Fragment>
        {accessType === 'keystore'
          // View 1: Access by keystore + password.
          ? (
            <Fragment>
              <div className="Auth__keystore">
                <p className="Auth__label" htmlFor="keystore">Keystore:</p>
                <label className="Auth__button" htmlFor="keystore">Upload</label>
                <input
                  className="Auth__file"
                  id="keystore"
                  type="file"
                  onChange={this.handleImport}
                  accept=".json"
                />
                <p
                  className="Auth__fileName">
                  {keystoreName || 'No keystore file...'}
                </p>
              </div>
              <label className="Auth__label" htmlFor="password">Password:</label>
              <input
                id="input-password"
                className="Auth__passwordInput"
                name="password"
                type="password"
                onChange={this.handleChange}
              />
            </Fragment>
          )
          // View 2: Access by private key.
          : (
            <Fragment>
              <label className="Auth__label">Private Key:</label>
              <input
                className="Auth__input"
                name="privateKey"
                onChange={this.handleChange}
              />
            </Fragment>
          )
        }
        <button className="Auth__button" onClick={this.handleLogin}>Login</button>
        <p className="Auth__keystoreMsg">{keystoreMsg}</p>
        <p className="Auth__toggleAccessButton" onClick={this.toggleAccessType}>
          {accessType === 'privateKey'
            ? 'Want to login with keystore? (click)'
            : 'Want to login with privatekey? (click)'
          }
        </p>
      </Fragment>
    )
  }

  render() {
    const { keystore } = this.state
    return (
      <div className={cx('Auth', {
        // If keystore file is imported, Adds a 'Auth--active' classname.
        'Auth--active': !!keystore,
      })}
      >
        <div className="Auth__flag" />
        <div className="Auth__content">
          {this.renderAuth()}
        </div>
      </div>
    )
  }
}

export default Auth
