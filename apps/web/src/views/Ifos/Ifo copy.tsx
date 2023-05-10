import { ifosConfig } from 'config/constants'
import CurrentIfo from './CurrentIfo'
import SoonIfo from './SoonIfo'

/**
 * Note: currently there should be only 1 active IFO at a time
 */
const activeIfo = ifosConfig.find((ifo) => ifo.isActive)

const active = true;

const Ifo = () => {
  // console.log('6666666', activeIfo, ifosConfig);
  // 当前active的ifo，或者空的ifo
  return active ? <CurrentIfo activeIfo={activeIfo} /> : <SoonIfo />
}

export default Ifo
