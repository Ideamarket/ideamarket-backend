import ABIsAVM from './abis-avm.json'
import ABIsMainnet from './abis-mainnet.json'
import ABIsRinkeby from './abis-rinkeby.json'
import ABIsTestAVML1 from './abis-test-avm-l1.json'
import ABIsTestAVML2 from './abis-test-avm-l2.json'
import ABIsTest from './abis-test.json'

export function getDeployedABIs(network: string) {
  switch (network) {
    case 'avm':
      return ABIsAVM
    case 'mainnet':
      return ABIsMainnet
    case 'rinkeby':
      return ABIsRinkeby
    case 'test-avm-l1':
      return ABIsTestAVML1
    case 'test-avm-l2':
      return ABIsTestAVML2
    case 'test':
      return ABIsTest
    default:
      return ABIsTestAVML2
  }
}
