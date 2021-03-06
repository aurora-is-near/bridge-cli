/// This file contains all metrics that are being tracked.
/// To track new metrics read comment starting with [1] and [2]
import { flags } from '@oclif/command';
import { BridgeCommand } from '../base';
import HttpPrometheus from '../utils/http-prometheus';
import { Config } from '../config';
import { Logger } from 'tslog';
import { sleep } from '../utils/common';
import * as nearAPI from 'near-api-js';
import { AccountId, parseAccountId } from '../types';
import { ethers } from 'ethers';
import { CodeResult } from 'near-api-js/lib/providers/provider';

export default class Monitor extends BridgeCommand {
  static description = 'Expose bridge information through prometheus metrics';

  static flags = {
    ...BridgeCommand.flags,
    list: flags.boolean({ char: 'l', description: 'List information tracked' })
  };

  static args = [...BridgeCommand.args];

  // TODO: Fetch ethereum block hash/height from different endpoints to check they match
  async run(): Promise<void> {
    await setup(this.conf, this.logger);
  }
}

class Options {
  prometheus: HttpPrometheus;

  near: nearAPI.Near;

  config: Config;

  constructor(prometheus: HttpPrometheus, near: nearAPI.Near, config: Config) {
    this.prometheus = prometheus;
    this.near = near;
    this.config = config;
  }
}

async function setup(config: Config, logger: Logger) {
  // Build options
  const port = config.monitor.port;
  const prometheus = new HttpPrometheus(port, 'bridge_monitor_');
  const near = await config.NEAR;
  const options = new Options(prometheus, near, config);

  // [1] Register metrics to track in this array
  const builder = [
    nearChainBlock,
    nearAccountInfo(config.contracts.near.client, 'eth_client_on_near'),
    nearAccountInfo(config.eth2near.relayer, 'eth2near_relayer'),
    ethClientOnNear,
    ethChainBlock
  ];

  const updates = builder.map((builder) => builder(options));

  logger.info(`Metrics exposed at http://localhost:${port}`);

  /* eslint-disable no-await-in-loop */
  for (;;) {
    logger.info('Fetch information');

    const promises: Promise<void>[] = [];

    updates.forEach((update) => {
      promises.push(update());
    });

    await Promise.all(promises);
    await sleep(config.monitor.timeout);
  }
  /* eslint-enable no-await-in-loop */
}

/// [2] Each metric is created with a function that:
///     - Receives as arguments an Options object with all necessary information from the Config
///     - Should register the new metrics it will take care of (each function can register multiple metrics)
///     - Returns an async function that will be invoked to update the metrics
///
/// See following example for more details

function nearChainBlock(opt: Options): () => Promise<void> {
  const nearChainBlock = opt.prometheus.gauge(
    'near_chain_block',
    'NEAR chain height'
  );

  return async () => {
    const block = await opt.near.connection.provider.block({
      finality: 'final'
    });
    nearChainBlock.set(block.header.height);
  };
}

function nearAccountInfo(
  accountId: AccountId,
  name: string
): (opt: Options) => () => Promise<void> {
  const nearYocto2Nano = ethers.BigNumber.from(10).pow(15);

  return (opt: Options): (() => Promise<void>) => {
    const accountBalance = opt.prometheus.gauge(
      `${name}_nano_near`,
      'NEAR chain height'
    );

    const accountStorage = opt.prometheus.gauge(
      `${name}_bytes`,
      'NEAR chain height'
    );

    return async () => {
      const account = await opt.near.account(accountId.toString());
      const view = await account.state();

      const nanoNear = ethers.BigNumber.from(view.amount)
        .div(nearYocto2Nano)
        .toNumber();

      accountBalance.set(nanoNear);
      accountStorage.set(view.storage_usage);
    };
  };
}

function ethClientOnNear(opt: Options): () => Promise<void> {
  const ethClientOnNearHeight = opt.prometheus.gauge(
    'eth_client_on_near_height',
    'Height of Ethereum Client on NEAR'
  );

  return async () => {
    const target = parseAccountId(opt.config.contracts.near.client).unwrap();

    // TODO: Use BorshContract interface.
    /* eslint-disable camelcase */
    const result = (await opt.near.connection.provider.query({
      request_type: 'call_function',
      account_id: target,
      method_name: 'last_block_number',
      args_base64: Buffer.from('').toString('base64'),
      finality: 'optimistic'
    })) as CodeResult;
    /* eslint-enable camelcase */

    result.result.reverse();
    const height = ethers.BigNumber.from(result.result).toNumber();

    ethClientOnNearHeight.set(height);
  };
}

function ethChainBlock(opt: Options): () => Promise<void> {
  const ethChainBlock = opt.prometheus.gauge(
    'eth_chain_block',
    'Ethereum chain height'
  );

  return async () => {
    const block = await opt.config.eth.getBlock('latest');
    ethChainBlock.set(block.number);
  };
}

// const nearClientBlockTrusted = prometheus.gauge(
//   'near_client_block_trusted',
//   'last trusted block in NEAR Light Client in Ethereum'
// );

// const nearClientBlockLast = prometheus.gauge(
//   'near_client_block_last',
//   'last trusted block in NEAR Light Client in Ethereum'
// );

// const ethereumChainBlock = prometheus.gauge(
//   'ethereum_chain_block',
//   'Ethereum chain height'
// );

// const ethereumClientBlock = prometheus.gauge(
//   'ethereum_chain_block',
//   'Ethereum chain height'
// );

// Ethereum accounts:
//    Relayer
//    Watchdog
