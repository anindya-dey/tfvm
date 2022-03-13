> **CAUTION:** This project is under development. The README would be updated with the relevant documentations once I release the first production version (v1).

# Terraform Version Manager

[![npm version](https://img.shields.io/npm/v/tfvm?color=blue&label=version&style=flat-square)](https://www.npmjs.com/package/tfvm) [![downloads per week](https://img.shields.io/npm/dw/tfvm)](https://www.npmjs.com/package/tfvm) [![license](https://img.shields.io/npm/l/tfvm?color=lightblue)](https://www.npmjs.com/package/tfvm)

### A NodeJS-based CLI tool to manage terraform versions on a system

Install it globally to manage all the terraform versions

```sh
# To install tfvm globally, run this
$ npm install -g tfvm
```

## Available commands

#### `list|ls [--remote | -r]`

Use this command to list the downloaded versions of terraform

```sh
$ tfvm list # gets all the locally available terraform executables
```

Append `--remote` or `-r` with `list` to get a list of all available releases from [Terraform](https://releases.hashicorp.com/terraform)

```sh
$ tfvm list --remote # displays the available releases from Terraform's website
```

#### `dir`

This command shows the directory where all the terraform executables are stored locally. The default path is the `$USER/terraform` directory.

```sh
$ tfvm dir # shows the directory where all the terraform executables are stored
```

#### `download|d [version]`

This will present a list of available releases from terraform. Choose one with up/down arrow and hit `ENTER` to download it.

```sh
$ tfvm download
```

Optionally, a `version` can be appended to this command to download it directly, like so:

```sh
$ tfvm download 1.1.0
```

---

:heart: _This project is inspired by the [nvm project](https://github.com/nvm-sh/nvm)_ :pray:
