import DeployedAddressesAVM from './deployed-avm.json'
import DeployedAddressesMainnet from './deployed-mainnet.json'
import DeployedAddressesRinkeby from './deployed-rinkeby.json'
import DeployedAddressesTestAVML1 from './deployed-test-avm-l1.json'
import DeployedAddressesTestAVML2 from './deployed-test-avm-l2.json'
import DeployedAddressesTest from './deployed-test.json'

export function getDeployedAddresses(network: string) {
  switch (network) {
    case 'avm':
      return DeployedAddressesAVM
    case 'mainnet':
      return DeployedAddressesMainnet
    case 'rinkeby':
      return DeployedAddressesRinkeby
    case 'test-avm-l1':
      return DeployedAddressesTestAVML1
    case 'test-avm-l2':
      return DeployedAddressesTestAVML2
    case 'test':
      return DeployedAddressesTest
    default:
      return null
  }
}
