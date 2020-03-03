/* eslint-disable camelcase */
import yargs from 'yargs';
import * as BCH from '../chains/bch';
import * as BSV from '../chains/bsv';
import * as BTC from '../chains/btc';
import * as ETH from '../chains/eth';
import { init } from '../index';
import { Address } from '../pojo';
import { USER_CONFIG } from '../user_config';
import { stringifyOrder } from '../utils';
import { readConfig, SUPPORTED_SYMBOLS } from './common';

function getAddress(symbol: string): Address {
  switch (symbol) {
    case 'BCH': {
      const bchAddress = BCH.getAddressFromMnemonic(USER_CONFIG.MNEMONIC!);
      const address: Address = {
        symbol: 'BCH',
        address: BCH.getAddressFromMnemonic(USER_CONFIG.MNEMONIC!).cashAddress,
      };
      address.legacyAddress = bchAddress.legacyAddress;
      address.cashAddress = bchAddress.cashAddress;
      return address;
    }
    case 'BSV':
      return {
        symbol: 'BSV',
        address: BSV.getAddressFromMnemonic(USER_CONFIG.MNEMONIC!).address,
      };
    case 'BTC':
      return { symbol: 'BTC', address: BTC.getAddressFromMnemonic(USER_CONFIG.MNEMONIC!).address };
    case 'EOS':
      return { symbol: 'EOS', address: USER_CONFIG.eosAccount! };
    case 'ETH': {
      const tmp = ETH.getAddressFromMnemonic(USER_CONFIG.MNEMONIC!);
      return { symbol: 'ETH', address: tmp.address };
    }
    default:
      throw new Error(`Unsupported symbol ${symbol}`);
  }
}

const commandModule: yargs.CommandModule = {
  command: 'addresses',
  describe: 'List all addresses.',
  // eslint-disable-next-line no-shadow
  builder: yargs =>
    yargs.options({
      symbol: {
        choices: SUPPORTED_SYMBOLS,
        type: 'string',
        describe: 'The currency symbol to query, empty means all',
        demandOption: false,
      },
    }),
  handler: argv => {
    const params = (argv as any) as {
      symbol: string;
    };

    const userConfig = readConfig();
    init(userConfig);

    const symbols = params.symbol ? [params.symbol] : SUPPORTED_SYMBOLS;

    const result: { [key: string]: Address } = {};
    for (let i = 0; i < symbols.length; i += 1) {
      const symbol = symbols[i];
      const address = getAddress(symbol); // eslint-disable-line no-await-in-loop
      result[symbol] = address;
    }
    console.info(stringifyOrder(result));
  },
};

export default commandModule;
