# bridge

CLI to manage and verify the bridge between NEAR and Ethereum

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bridge.svg)](https://npmjs.org/package/bridge)
[![Downloads/week](https://img.shields.io/npm/dw/bridge.svg)](https://npmjs.org/package/bridge)
[![License](https://img.shields.io/npm/l/bridge.svg)](https://github.com/mfornet/bridge/blob/master/package.json)

<!-- toc -->

- [bridge](#bridge)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g bridge
$ bridge COMMAND
running command...
$ bridge (-v|--version|version)
bridge/0.0.1 darwin-x64 node-v14.16.1
$ bridge --help [COMMAND]
USAGE
  $ bridge COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`bridge help [COMMAND]`](#bridge-help-command)
- [`bridge monitor [BRIDGEID]`](#bridge-monitor-bridgeid)
- [`bridge z:generate-config FILE`](#bridge-zgenerate-config-file)

## `bridge help [COMMAND]`

display help for bridge

```
USAGE
  $ bridge help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `bridge monitor [BRIDGEID]`

Expose bridge information through prometheus metrics

```
USAGE
  $ bridge monitor [BRIDGEID]

OPTIONS
  -h, --help       show CLI help
  -l, --list       List information tracked
  --config=config  Path to config file
```

_See code: [src/commands/monitor.ts](https://github.com/mfornet/bridge-cli/blob/v0.0.1/src/commands/monitor.ts)_

## `bridge z:generate-config FILE`

Generate config/base.ts file from yml file automatically

```
USAGE
  $ bridge z:generate-config FILE

OPTIONS
  -h, --help       show CLI help
  --config=config  Path to config file
```

_See code: [src/commands/z/generate-config.ts](https://github.com/mfornet/bridge-cli/blob/v0.0.1/src/commands/z/generate-config.ts)_

<!-- commandsstop -->
